import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { serverEnv } from "@/lib/server/env";

const dynamoDbClient = new DynamoDBClient({
  region: serverEnv.awsRegion,
  credentials: {
    accessKeyId: serverEnv.awsAccessKeyId,
    secretAccessKey: serverEnv.awsSecretAccessKey,
  },
});

export const dynamoDbDocumentClient = DynamoDBDocumentClient.from(
  dynamoDbClient,
  {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  },
);
