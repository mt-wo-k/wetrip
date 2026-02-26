import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  DeleteCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

import {
  persistedScheduleSchema,
  type CreateScheduleSchema,
  type UpdateScheduleContentSchema,
} from "@/lib/schemas/schedule";
import { dynamoDbDocumentClient } from "@/lib/server/dynamodb";
import { serverEnv } from "@/lib/server/env";
import type { TripSchedule } from "@/lib/trips";

type CreateScheduleParams = {
  tripId: string;
  input: CreateScheduleSchema;
};

export async function createSchedule({
  tripId,
  input,
}: CreateScheduleParams): Promise<TripSchedule> {
  const now = new Date().toISOString();
  const schedule: TripSchedule = {
    tripId,
    scheduleId: randomUUID(),
    dayIndex: input.dayIndex,
    scheduleType: input.scheduleType,
    startTime: input.startTime,
    endTime: input.endTime,
    mapLink: input.mapLink,
    title: input.title,
    detail: input.detail,
    createdAt: now,
    updatedAt: now,
  };

  await dynamoDbDocumentClient.send(
    new PutCommand({
      TableName: serverEnv.dynamoDbTripSchedulesTable,
      Item: schedule,
      ConditionExpression:
        "attribute_not_exists(tripId) AND attribute_not_exists(scheduleId)",
    }),
  );

  return schedule;
}

export async function getSchedulesByTripId(tripId: string): Promise<TripSchedule[]> {
  const response = await dynamoDbDocumentClient.send(
    new QueryCommand({
      TableName: serverEnv.dynamoDbTripSchedulesTable,
      KeyConditionExpression: "#tripId = :tripId",
      ExpressionAttributeNames: {
        "#tripId": "tripId",
      },
      ExpressionAttributeValues: {
        ":tripId": tripId,
      },
    }),
  );

  const items = response.Items ?? [];
  const schedules: TripSchedule[] = [];

  for (const item of items) {
    const validated = persistedScheduleSchema.safeParse(item);

    if (!validated.success) {
      throw new Error("Schedule item shape is invalid in DynamoDB");
    }

    schedules.push(validated.data);
  }

  return schedules.sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex;
    }

    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
}

export async function updateScheduleContent({
  tripId,
  scheduleId,
  input,
}: {
  tripId: string;
  scheduleId: string;
  input: UpdateScheduleContentSchema;
}): Promise<TripSchedule> {
  const now = new Date().toISOString();
  const setExpressions = ["#updatedAt = :updatedAt"];
  const removeExpressions: string[] = [];

  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
    "#dayIndex": "dayIndex",
    "#startTime": "startTime",
    "#endTime": "endTime",
    "#mapLink": "mapLink",
    "#title": "title",
    "#detail": "detail",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
    ":dayIndex": input.dayIndex,
    ":startTime": input.startTime,
  };

  setExpressions.push("#dayIndex = :dayIndex");
  setExpressions.push("#startTime = :startTime");

  if (input.endTime !== undefined) {
    setExpressions.push("#endTime = :endTime");
    expressionAttributeValues[":endTime"] = input.endTime;
  } else {
    removeExpressions.push("#endTime");
  }

  if (input.mapLink !== undefined) {
    setExpressions.push("#mapLink = :mapLink");
    expressionAttributeValues[":mapLink"] = input.mapLink;
  } else {
    removeExpressions.push("#mapLink");
  }

  if (input.title !== undefined) {
    setExpressions.push("#title = :title");
    expressionAttributeValues[":title"] = input.title;
  } else {
    removeExpressions.push("#title");
  }

  if (input.detail !== undefined) {
    setExpressions.push("#detail = :detail");
    expressionAttributeValues[":detail"] = input.detail;
  } else {
    removeExpressions.push("#detail");
  }

  const updateExpression = [
    `SET ${setExpressions.join(", ")}`,
    removeExpressions.length > 0 ? `REMOVE ${removeExpressions.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const response = await dynamoDbDocumentClient.send(
    new UpdateCommand({
      TableName: serverEnv.dynamoDbTripSchedulesTable,
      Key: {
        tripId,
        scheduleId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(tripId) AND attribute_exists(scheduleId)",
      ReturnValues: "ALL_NEW",
    }),
  );

  if (!response.Attributes) {
    throw new Error("Schedule not found");
  }

  const validated = persistedScheduleSchema.safeParse(response.Attributes);

  if (!validated.success) {
    throw new Error("Updated schedule item shape is invalid in DynamoDB");
  }

  return validated.data;
}

export async function deleteSchedulesByTripId(tripId: string): Promise<number> {
  let lastEvaluatedKey: Record<string, unknown> | undefined;
  let deletedCount = 0;

  do {
    const response = await dynamoDbDocumentClient.send(
      new QueryCommand({
        TableName: serverEnv.dynamoDbTripSchedulesTable,
        KeyConditionExpression: "#tripId = :tripId",
        ExpressionAttributeNames: {
          "#tripId": "tripId",
        },
        ExpressionAttributeValues: {
          ":tripId": tripId,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    const items = response.Items ?? [];
    if (items.length > 0) {
      for (let index = 0; index < items.length; index += 25) {
        const chunk = items.slice(index, index + 25);
        let pendingItems: NonNullable<
          BatchWriteCommandInput["RequestItems"]
        >[string] = chunk.map((item) => ({
          DeleteRequest: {
            Key: {
              tripId: item.tripId,
              scheduleId: item.scheduleId,
            },
          },
        }));

        while (pendingItems.length > 0) {
          const batchResponse = await dynamoDbDocumentClient.send(
            new BatchWriteCommand({
              RequestItems: {
                [serverEnv.dynamoDbTripSchedulesTable]: pendingItems,
              },
            }),
          );

          pendingItems =
            batchResponse.UnprocessedItems?.[serverEnv.dynamoDbTripSchedulesTable] ??
            [];
        }

        deletedCount += chunk.length;
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return deletedCount;
}

export async function deleteScheduleById({
  tripId,
  scheduleId,
}: {
  tripId: string;
  scheduleId: string;
}): Promise<boolean> {
  const response = await dynamoDbDocumentClient.send(
    new DeleteCommand({
      TableName: serverEnv.dynamoDbTripSchedulesTable,
      Key: {
        tripId,
        scheduleId,
      },
      ConditionExpression: "attribute_exists(tripId) AND attribute_exists(scheduleId)",
      ReturnValues: "ALL_OLD",
    }),
  );

  return Boolean(response.Attributes);
}
