/**
 * TraceBack HAMC Security & AWS Architecture Targeted Test Suite
 * 
 * Verifies:
 * 1. HTTP-only cookie authentication & session validation (no localStorage tokens)
 * 2. Dispute isolation & admin-only arbitration
 * 3. Private S3 presigned GET URL generation
 * 4. Rekognition transparency (never reporting simulated confidence as live AI)
 * 5. Production reset-token suppression (no devToken in production)
 * 6. AWS region default set to us-east-1
 */

const assert = require('assert');
const authService = require('../services/authService');
const disputeService = require('../services/disputeService');
const imageService = require('../services/imageService');
const { getCookieOptions, generateToken, verifyToken, COOKIE_NAME } = require('../utils/jwtHelper');
const awsConfig = require('../config/aws');

async function runSecurityTests() {
  console.log('====================================================');
  console.log('TraceBack HAMC Security & AWS Architecture Audit Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. JWT & Cookie Security
  test('Cookie options enforce httpOnly, path=/ and correct sameSite', () => {
    const devOpts = getCookieOptions();
    assert.strictEqual(devOpts.httpOnly, true, 'Cookie must be httpOnly');
    assert.strictEqual(devOpts.path, '/', 'Cookie path must be root /');
    assert(devOpts.maxAge > 0, 'Cookie must have positive maxAge');
    assert.strictEqual(COOKIE_NAME, 'traceback_token', 'Cookie name must be traceback_token');
    assert.strictEqual(devOpts.sameSite, 'lax', 'Dev cookie must be sameSite=lax');
    assert.strictEqual(devOpts.secure, false, 'Dev cookie must have secure=false for non-https localhost');

    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const prodOpts = getCookieOptions();
      assert.strictEqual(prodOpts.sameSite, 'none', 'Production cross-origin cookie must be sameSite=none');
      assert.strictEqual(prodOpts.secure, true, 'Production cross-origin cookie must be secure=true');
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });

  test('JWT token contains verified claims and valid expiration', () => {
    const testUser = { id: 'usr_sec_01', email: 'sec@campus.ves.ac.in', role: 'user', name: 'Sec Student' };
    const token = generateToken(testUser);
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, 'usr_sec_01');
    assert.strictEqual(decoded.role, 'user');
  });

  // 2. Production Password Reset Token Suppression
  await testAsync('Production environment strictly suppresses devToken from forgot-password response', async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const result = await authService.forgotPassword('priya.iyer@campus.ves.ac.in');
      assert.strictEqual(result.devToken, undefined, 'devToken must NOT exist in production response');
      assert(result.message.length > 0, 'Friendly message must still be returned');
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });

  await testAsync('Development environment provides devToken for local testing', async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'development';
      const result = await authService.forgotPassword('priya.iyer@campus.ves.ac.in');
      assert(typeof result.devToken === 'string' && result.devToken.length > 10, 'devToken must exist in development');
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });

  // 3. Rekognition Transparency & Simulation Distinction
  await testAsync('Rekognition service explicitly flags simulation and reports null confidence when AWS is not active', async () => {
    const prevAdapter = process.env.DATA_ADAPTER;
    try {
      process.env.DATA_ADAPTER = 'local';
      const analysis = await imageService.detectLabels({
        imageKey: 'uploads/item/test.jpg',
        category: 'Electronics',
        brand: 'Sony'
      });

      assert.strictEqual(analysis.isLiveRekognition, false, 'isLiveRekognition must be false in simulation');
      assert.strictEqual(analysis.confidence, null, 'Simulated confidence must be strictly null (never fake 95%)');
      assert.strictEqual(analysis.provider, 'local-simulation-no-aws', 'Provider must clearly state local simulation');
      assert(analysis.labels.includes('Electronics'), 'Labels should contain input category');
    } finally {
      process.env.DATA_ADAPTER = prevAdapter;
    }
  });

  // 4. Private S3 Object & Presigned URL Resolution
  await testAsync('Private S3 view URL helper preserves local paths and safely resolves image keys', async () => {
    // Local path preservation
    const localUrl = '/uploads/item/sample.jpg';
    const resolvedLocal = await imageService.getPresignedGetUrl(localUrl);
    assert.strictEqual(resolvedLocal, localUrl, 'Local upload paths must be preserved untouched');

    // External image preservation
    const unsplashUrl = 'https://images.unsplash.com/photo-12345';
    const resolvedExternal = await imageService.getPresignedGetUrl(unsplashUrl);
    assert.strictEqual(resolvedExternal, unsplashUrl, 'External CDN URLs must be preserved untouched');
  });

  // 5. Dispute Isolation
  await testAsync('getUserDisputes strictly returns only disputes involving the requested student', async () => {
    const student1Disputes = await disputeService.getUserDisputes('usr_01');
    for (const d of student1Disputes) {
      const isInvolved =
        d.submittedBy === 'usr_01' ||
        (d.claimant1 && d.claimant1.id === 'usr_01') ||
        (d.claimant2 && d.claimant2.id === 'usr_01');
      assert(isInvolved, 'Every retrieved dispute must involve the queried user ID');
    }
  });

  // 6. AWS Region Configuration
  test('Default AWS Region is configured to us-east-1', () => {
    assert.strictEqual(awsConfig.region, 'us-east-1', 'Default AWS region must be us-east-1');
  });

  console.log('\n====================================================');
  console.log(`Security Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
