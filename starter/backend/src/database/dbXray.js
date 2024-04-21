import {DynamoDBDocument} from "@aws-sdk/lib-dynamodb";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import AWSXRay from 'aws-xray-sdk-core'
import {createLogger} from "../utils/logger.mjs";

const log = createLogger("db-initializing")

export const createXrayDBClient = () => {
    log.info("Integrating XRay tracing to DB Clint")
    const dynamoDb = new DynamoDB()
    const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDb)
    const dynamoDBDocument = DynamoDBDocument.from(dynamoDbXRay);
    log.info("XRay Integrated")
    return dynamoDBDocument;
}