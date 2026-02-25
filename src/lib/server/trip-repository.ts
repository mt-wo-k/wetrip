import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

import { persistedTripSchema, type CreateTripSchema } from "@/lib/schemas/trip";
import { dynamoDbDocumentClient } from "@/lib/server/dynamodb";
import { serverEnv } from "@/lib/server/env";
import type { Trip } from "@/lib/trips";

type CreateTripParams = {
  input: CreateTripSchema;
  createdBySub: string;
};

const listPartitionKeyValue = "TRIP";

export async function createTrip({
  input,
  createdBySub,
}: CreateTripParams): Promise<Trip> {
  const now = new Date().toISOString();
  const trip: Trip & { listPartitionKey: string } = {
    id: randomUUID(),
    ...input,
    listPartitionKey: listPartitionKeyValue,
    createdAt: now,
    updatedAt: now,
    createdBySub,
  };

  await dynamoDbDocumentClient.send(
    new PutCommand({
      TableName: serverEnv.dynamoDbTripsTable,
      Item: trip,
      ConditionExpression: "attribute_not_exists(id)",
    }),
  );

  return trip;
}

export async function getTripById(id: string): Promise<Trip | null> {
  const response = await dynamoDbDocumentClient.send(
    new GetCommand({
      TableName: serverEnv.dynamoDbTripsTable,
      Key: {
        id,
      },
    }),
  );

  if (!response.Item) {
    return null;
  }

  const validated = persistedTripSchema.safeParse(response.Item);

  if (!validated.success) {
    throw new Error("Trip item shape is invalid in DynamoDB");
  }

  return validated.data;
}

export async function getTrips(): Promise<Trip[]> {
  const response = await dynamoDbDocumentClient.send(
    new QueryCommand({
      TableName: serverEnv.dynamoDbTripsTable,
      IndexName: serverEnv.dynamoDbTripsListIndex,
      KeyConditionExpression: "#lpk = :lpk",
      ExpressionAttributeNames: {
        "#lpk": "listPartitionKey",
      },
      ExpressionAttributeValues: {
        ":lpk": listPartitionKeyValue,
      },
    }),
  );

  const items = response.Items ?? [];
  const trips: Trip[] = [];

  for (const item of items) {
    const validated = persistedTripSchema.safeParse(item);

    if (!validated.success) {
      throw new Error("Trip item shape is invalid in DynamoDB");
    }

    trips.push(validated.data);
  }

  return trips.sort((a, b) => b.startDate.localeCompare(a.startDate));
}
