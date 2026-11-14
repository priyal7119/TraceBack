/**
 * AWS SDK v3 Configuration & Client Initialization
 * 
 * Supports the 5 permitted AWS services:
 * 1. Amazon S3 (for item image storage)
 * 2. Amazon API Gateway (deployment target)
 * 3. AWS Lambda (deployment target)
 * 4. Amazon DynamoDB (NoSQL database)
 * 5. Amazon Rekognition (computer vision label detection)
 * 
 * Local Development Graceful Fallback:
 * If AWS credentials are not configured, clients are either mocked or disabled,
 * and the local development data adapter handles all persistence.
 */

const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { RekognitionClient } = require('@aws-sdk/client-rekognition');

const region = process.env.AWS_REGION || 'us-east-1';

const dynamoTableNames = {
  users: process.env.USERS_TABLE || process.env.DYNAMODB_TABLE_USERS || 'TraceBack_Users',
  reports: process.env.REPORTS_TABLE || process.env.DYNAMODB_TABLE_REPORTS || 'TraceBack_Reports',
  matches: process.env.MATCHES_TABLE || process.env.DYNAMODB_TABLE_MATCHES || 'TraceBack_Matches',
  claims: process.env.CLAIMS_TABLE || process.env.DYNAMODB_TABLE_CLAIMS || 'TraceBack_Claims',
  disputes: process.env.DISPUTES_TABLE || process.env.DYNAMODB_TABLE_DISPUTES || 'TraceBack_Disputes',
  notifications: process.env.NOTIFICATIONS_TABLE || process.env.DYNAMODB_TABLE_NOTIFICATIONS || 'TraceBack_Notifications',
};

// Use the standard AWS SDK v3 default credential provider chain.
// This automatically resolves Lambda role credentials (including AWS_SESSION_TOKEN for LabRole),
// local AWS CLI credentials (~/.aws/credentials), and environment variables without manual interception.
const createDynamoDbDocClient = (customConfig = {}) => {
  const clientConfig = { region, ...customConfig };
  const ddbClient = new DynamoDBClient(clientConfig);
  return DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
  });
};

const createS3Client = (customConfig = {}) => {
  const clientConfig = { region, ...customConfig };
  return new S3Client(clientConfig);
};

const createRekognitionClient = (customConfig = {}) => {
  const clientConfig = { region, ...customConfig };
  return new RekognitionClient(clientConfig);
};

let s3Client = null;
let dynamoDbDocClient = null;
let rekognitionClient = null;

try {
  dynamoDbDocClient = createDynamoDbDocClient();
  s3Client = createS3Client();
  rekognitionClient = createRekognitionClient();
  console.log('[AWS] SDK v3 Clients initialized using default credential provider chain. Region:', region);
} catch (err) {
  console.warn('[AWS] Could not initialize default AWS SDK clients:', err.message);
}

module.exports = {
  isAwsConfigured: Boolean(s3Client && dynamoDbDocClient),
  region,
  s3Client,
  createS3Client,
  dynamoDbDocClient,
  createDynamoDbDocClient,
  rekognitionClient,
  createRekognitionClient,
  s3Bucket: process.env.AWS_S3_BUCKET || 'traceback-campus-lost-and-found-hamc',
  dynamoTablePrefix: process.env.AWS_DYNAMODB_TABLE_PREFIX || 'TraceBack_',
  dynamoTableNames,
  rekognitionMinConfidence: parseFloat(process.env.AWS_REKOGNITION_MIN_CONFIDENCE || '80'),
};
