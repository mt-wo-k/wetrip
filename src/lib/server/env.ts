function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const serverEnv = {
  awsRegion: getRequiredEnv("AWS_REGION"),
  awsAccessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
  awsSecretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
  dynamoDbTripsTable: getRequiredEnv("DYNAMODB_TRIPS_TABLE"),
  dynamoDbTripsListIndex: getRequiredEnv("DYNAMODB_TRIPS_LIST_INDEX"),
  dynamoDbTripSchedulesTable: getRequiredEnv("DYNAMODB_TRIP_SCHEDULES_TABLE"),
};
