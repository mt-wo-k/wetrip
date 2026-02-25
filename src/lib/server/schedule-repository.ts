import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
    startTime: input.startTime,
    endTime: input.endTime,
    name: input.name,
    detail: input.detail,
    reservationStatus: input.reservationStatus,
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

export async function updateScheduleReservationStatus({
  tripId,
  scheduleId,
  reservationStatus,
}: {
  tripId: string;
  scheduleId: string;
  reservationStatus: "reserved";
}): Promise<TripSchedule> {
  const now = new Date().toISOString();
  const response = await dynamoDbDocumentClient.send(
    new UpdateCommand({
      TableName: serverEnv.dynamoDbTripSchedulesTable,
      Key: {
        tripId,
        scheduleId,
      },
      UpdateExpression: "SET reservationStatus = :status, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":status": reservationStatus,
        ":updatedAt": now,
      },
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
    "#name": "name",
    "#detail": "detail",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
  };

  if (input.name !== undefined) {
    setExpressions.push("#name = :name");
    expressionAttributeValues[":name"] = input.name;
  } else {
    removeExpressions.push("#name");
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
