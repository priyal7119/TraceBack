/**
 * TraceBack Lambda Adapter Verification Test Suite
 * Tests the serverless-http wrapper, API Gateway event translation,
 * cookie handling, and Express export separation without starting a socket server.
 */

const assert = require('assert');
const path = require('path');

async function runTests() {
  console.log('====================================================');
  console.log('TraceBack AWS Lambda Adapter Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function pass(msg) {
    passed++;
    total++;
    console.log(`  [PASS] ${msg}`);
  }

  function fail(msg, err) {
    total++;
    console.error(`  [FAIL] ${msg}:`, err?.message || err);
  }

  // Test 1: Requiring lambda.js does not start an Express server
  try {
    const lambda = require('../lambda');
    pass('Requiring lambda.js loads cleanly without error');

    // Check handler is a function
    assert.strictEqual(typeof lambda.handler, 'function', 'lambda.handler must be a function');
    pass('Exported lambda.handler is a valid callable function');
  } catch (err) {
    fail('Requiring lambda.js failed', err);
  }

  const lambda = require('../lambda');

  // Test 2: Simulated API Gateway v2 HTTP API event for GET /health
  try {
    const healthEvent = {
      version: '2.0',
      routeKey: 'GET /health',
      rawPath: '/health',
      rawQueryString: '',
      headers: {
        host: 'api.traceback.ves.ac.in',
        'user-agent': 'aws-lambda-test',
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/health',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
        },
      },
      isBase64Encoded: false,
    };

    const response = await lambda.handler(healthEvent, {});
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 'healthy');
    pass('Lambda handler processes GET /health and returns 200 healthy');
  } catch (err) {
    fail('GET /health via Lambda handler failed', err);
  }

  // Test 3: Simulated API Gateway event for GET /api/reports/lost
  try {
    const reportsEvent = {
      version: '2.0',
      routeKey: 'GET /api/reports/lost',
      rawPath: '/api/reports/lost',
      rawQueryString: '',
      headers: {
        host: 'api.traceback.ves.ac.in',
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/reports/lost',
          protocol: 'HTTP/1.1',
        },
      },
      isBase64Encoded: false,
    };

    const response = await lambda.handler(reportsEvent, {});
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert(Array.isArray(body.reports), 'reports must be an array');
    pass('Lambda handler processes GET /api/reports/lost');
  } catch (err) {
    fail('GET /api/reports/lost via Lambda handler failed', err);
  }

  // Test 4: Simulated POST /api/auth/login and verify Set-Cookie header
  let authCookie = null;
  try {
    const loginEvent = {
      version: '2.0',
      routeKey: 'POST /api/auth/login',
      rawPath: '/api/auth/login',
      rawQueryString: '',
      headers: {
        'content-type': 'application/json',
        host: 'api.traceback.ves.ac.in',
      },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/auth/login',
          protocol: 'HTTP/1.1',
        },
      },
      body: JSON.stringify({
        email: 'priya.iyer@campus.ves.ac.in',
        password: process.env.INITIAL_USER_PASSWORD || 'Password123!',
      }),
      isBase64Encoded: false,
    };

    const response = await lambda.handler(loginEvent, {});
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert(body.token, 'Expected JWT token in response body');

    // Check Set-Cookie in headers or cookies array
    const rawSetCookie = response.headers?.['set-cookie'] || response.headers?.['Set-Cookie'] || (response.cookies && response.cookies[0]);
    assert(rawSetCookie, 'Expected at least one set-cookie in response');
    assert(rawSetCookie.includes('traceback_token'), 'Expected traceback_token cookie');
    assert(rawSetCookie.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');

    // Extract cookie value for subsequent request
    authCookie = rawSetCookie.split(';')[0];
    pass('Lambda handler issues JWT and returns HttpOnly Set-Cookie header');
  } catch (err) {
    fail('POST /api/auth/login via Lambda handler failed', err);
  }

  // Test 5: Simulated GET /api/auth/me using Cookie header
  try {
    const meEvent = {
      version: '2.0',
      routeKey: 'GET /api/auth/me',
      rawPath: '/api/auth/me',
      rawQueryString: '',
      headers: {
        host: 'api.traceback.ves.ac.in',
        cookie: authCookie,
      },
      requestContext: {
        http: {
          method: 'GET',
          path: '/api/auth/me',
          protocol: 'HTTP/1.1',
        },
      },
      isBase64Encoded: false,
    };

    const response = await lambda.handler(meEvent, {});
    assert.strictEqual(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user?.email, 'priya.iyer@campus.ves.ac.in');
    pass('Lambda handler receives Cookie header, authenticates user, and returns profile');
  } catch (err) {
    fail('GET /api/auth/me via Cookie failed', err);
  }

  // Test 6: Production mode blocks local-upload filesystem endpoint
  try {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const uploadEvent = {
      version: '2.0',
      routeKey: 'POST /api/images/local-upload',
      rawPath: '/api/images/local-upload',
      rawQueryString: '',
      headers: {
        host: 'api.traceback.ves.ac.in',
        cookie: authCookie,
      },
      requestContext: {
        http: {
          method: 'POST',
          path: '/api/images/local-upload',
          protocol: 'HTTP/1.1',
        },
      },
      isBase64Encoded: false,
    };

    const response = await lambda.handler(uploadEvent, {});
    process.env.NODE_ENV = prevEnv;

    assert.strictEqual(response.statusCode, 403, `Expected 403 in production, got ${response.statusCode}`);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, false);
    assert(body.message.includes('disabled in production'), 'Message must indicate production block');
    pass('Production mode strictly blocks local filesystem uploads (403)');
  } catch (err) {
    fail('Production upload blocking test failed', err);
  }

  // Test 7: AWS Configuration uses default credential provider chain and validates DynamoDB & S3 settings
  try {
    const awsConfig = require('../config/aws');
    assert.strictEqual(awsConfig.region, 'us-east-1', 'Default region must be us-east-1');
    assert.strictEqual(awsConfig.s3Bucket, 'traceback-campus-lost-and-found-hamc', 'S3 bucket must match configured bucket');
    assert.strictEqual(awsConfig.dynamoTableNames.users, 'TraceBack_Users', 'Users table must match');
    assert.strictEqual(awsConfig.dynamoTableNames.reports, 'TraceBack_Reports', 'Reports table must match');
    assert.strictEqual(awsConfig.dynamoTableNames.matches, 'TraceBack_Matches', 'Matches table must match');
    assert.strictEqual(awsConfig.dynamoTableNames.claims, 'TraceBack_Claims', 'Claims table must match');
    assert.strictEqual(awsConfig.dynamoTableNames.disputes, 'TraceBack_Disputes', 'Disputes table must match');
    assert.strictEqual(awsConfig.dynamoTableNames.notifications, 'TraceBack_Notifications', 'Notifications table must match');
    pass('AWS config correctly configures region, S3 bucket, and all 6 DynamoDB tables');
  } catch (err) {
    fail('AWS config verification failed', err);
  }

  console.log('\n====================================================');
  console.log(`Lambda Test Results: ${passed} PASSED, ${total - passed} FAILED (Total: ${total})`);
  console.log('====================================================');

  if (total - passed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
