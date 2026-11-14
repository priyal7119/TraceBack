/**
 * Comprehensive Test Runner for AI Matches
 * Tests all 8 required scenarios:
 * 1. Logged-in user with no matches
 * 2. Logged-in user with one match
 * 3. Logged-in user with multiple matches
 * 4. User opening match details
 * 5. User accepting a match
 * 6. User rejecting a match
 * 7. Unauthenticated user attempting to access matches
 * 8. Student attempting to access another user's match
 */

const jwt = require('jsonwebtoken');
const adapter = require('../data/adapter');
const matchingService = require('../services/matchingService');
const matchController = require('../controllers/matchController');

const JWT_SECRET = process.env.JWT_SECRET || 'traceback-campus-secret-key-hamc-chembur-2024';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runMatchesTests() {
  console.log('====================================================');
  console.log('TraceBack AI Matches Diagnostic & Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // --- Scenario 7: Unauthenticated user attempting to access matches ---
  console.log('Scenario 7: Unauthenticated user attempting to access matches');
  {
    const { authenticate } = require('../middleware/authMiddleware');
    const req = { headers: {}, cookies: {} };
    const res = createMockRes();
    let nextCalled = false;
    authenticate(req, res, () => { nextCalled = true; });

    assert(res.statusCode === 401, 'Returns 401 Unauthorized for unauthenticated request');
    assert(res.body && res.body.success === false, 'Returns success: false for unauthenticated request');
    assert(!nextCalled, 'Auth middleware blocks unauthenticated request from reaching handler');
  }

  // Set up test data
  const userNoMatches = { id: 'usr_no_matches', role: 'user', name: 'Fresh User' };
  const userStudentA = { id: 'usr_student_a', role: 'user', name: 'Aarav Sharma' };
  const userStudentB = { id: 'usr_student_b', role: 'user', name: 'Other Student' };
  const adminUser = { id: 'usr_admin', role: 'admin', name: 'Admin Kulkarni' };

  // Create isolated test matches
  const matchA1 = await adapter.create('matches', {
    id: 'mat_test_a1',
    lostItemId: 'rep_a1',
    foundItemId: 'rep_f1',
    lostItem: {
      id: 'rep_a1',
      title: 'Water Bottle',
      userId: userStudentA.id,
      image: 'https://images.unsplash.com/photo-bottle'
    },
    foundItem: {
      id: 'rep_f1',
      title: 'Tupperware Bottle',
      userId: 'usr_custodian',
      image: 'https://images.unsplash.com/photo-bottle2'
    },
    overallScore: 88,
    status: 'suggested'
  });

  const matchA2 = await adapter.create('matches', {
    id: 'mat_test_a2',
    lostItemId: 'rep_a2',
    foundItemId: 'rep_f2',
    lostItem: {
      id: 'rep_a2',
      title: 'Calculus Notebook',
      userId: userStudentA.id,
      image: 'https://images.unsplash.com/photo-book'
    },
    foundItem: {
      id: 'rep_f2',
      title: 'Spiral Notebook',
      userId: 'usr_custodian',
      image: 'https://images.unsplash.com/photo-book2'
    },
    overallScore: 92,
    status: 'suggested'
  });

  // --- Scenario 1: Logged-in user with no matches ---
  console.log('\nScenario 1: Logged-in user with no matches');
  {
    const req = { user: userNoMatches, query: {} };
    const res = createMockRes();
    await matchController.getMatches(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.body.success === true, 'Response contains success: true');
    assert(Array.isArray(res.body.matches), 'Response matches is a valid array');
    assert(res.body.matches.length === 0, 'User with no matches gets exactly 0 matches');
    assert(res.body.count === 0, 'Match count is 0');
  }

  // --- Scenario 2: Logged-in user with one match ---
  console.log('\nScenario 2: Logged-in user with one match');
  {
    const singleMatchUser = { id: 'usr_single_match', role: 'user' };
    const singleMatch = await adapter.create('matches', {
      id: 'mat_single_001',
      lostItemId: 'rep_single_lost',
      foundItemId: 'rep_single_found',
      lostItem: {
        id: 'rep_single_lost',
        title: 'Single Lost Item',
        userId: singleMatchUser.id,
        image: 'https://example.com/single.jpg'
      },
      foundItem: {
        id: 'rep_single_found',
        title: 'Single Found Item',
        userId: 'custodian',
        image: 'https://example.com/single_found.jpg'
      },
      overallScore: 95,
      status: 'suggested'
    });

    const req = { user: singleMatchUser, query: {} };
    const res = createMockRes();
    await matchController.getMatches(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.body.matches.length === 1, 'Returns exactly 1 match');
    const m = res.body.matches[0];
    assert(Array.isArray(m.lostItem.images) && m.lostItem.images.length > 0, 'lostItem.images is normalized to an array');
    assert(Array.isArray(m.foundItem.images) && m.foundItem.images.length > 0, 'foundItem.images is normalized to an array');
    assert(typeof m.aiComparison?.rekognitionInsights === 'string', 'aiComparison.rekognitionInsights is present');

    // Clean up
    await adapter.delete('matches', singleMatch.id);
  }

  // --- Scenario 3: Logged-in user with multiple matches ---
  console.log('\nScenario 3: Logged-in user with multiple matches');
  {
    const req = { user: userStudentA, query: {} };
    const res = createMockRes();
    await matchController.getMatches(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.body.matches.length >= 2, `Returns multiple matches (found: ${res.body.matches.length})`);
    res.body.matches.forEach((m, idx) => {
      assert(Array.isArray(m.lostItem?.images), `Match [${idx}] lostItem.images is safe array`);
      assert(Array.isArray(m.foundItem?.images), `Match [${idx}] foundItem.images is safe array`);
    });
  }

  // --- Scenario 4: User opening match details ---
  console.log('\nScenario 4: User opening match details');
  {
    const req = { user: userStudentA, params: { id: matchA1.id } };
    const res = createMockRes();
    await matchController.getMatchById(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK');
    assert(res.body.match && res.body.match.id === matchA1.id, 'Returns correct match object');
    assert(Array.isArray(res.body.match.lostItem.images), 'Details has safe lostItem.images array');
    assert(Array.isArray(res.body.match.foundItem.images), 'Details has safe foundItem.images array');
    assert(typeof res.body.match.aiComparison.locationDistanceKm === 'number', 'Details has locationDistanceKm');
    assert(typeof res.body.match.aiComparison.timeDifferenceHours === 'number', 'Details has timeDifferenceHours');
  }

  // --- Scenario 5: User accepting a match ---
  console.log('\nScenario 5: User accepting a match');
  {
    const req = { user: userStudentA, params: { id: matchA1.id }, body: { decision: 'accept' } };
    const res = createMockRes();
    await matchController.handleMatchDecision(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK on accept');
    assert(res.body.match.status === 'accepted', 'Match status updated to "accepted"');
    assert(res.body.message.includes('accepted'), 'Confirmation message returned');
  }

  // --- Scenario 6: User rejecting a match ---
  console.log('\nScenario 6: User rejecting a match');
  {
    const req = { user: userStudentA, params: { id: matchA2.id }, body: { decision: 'reject' } };
    const res = createMockRes();
    await matchController.handleMatchDecision(req, res, (err) => { throw err; });

    assert(res.statusCode === 200, 'Returns 200 OK on reject');
    assert(res.body.match.status === 'rejected', 'Match status updated to "rejected"');
  }

  // --- Scenario 8: Student attempting to access another user's match ---
  console.log("\nScenario 8: Student attempting to access another user's match");
  {
    // Student B attempts to view Student A's match
    const reqView = { user: userStudentB, params: { id: matchA1.id } };
    const resView = createMockRes();
    await matchController.getMatchById(reqView, resView, (err) => { throw err; });

    assert(resView.statusCode === 403, 'Returns 403 Forbidden when student views another user match');
    assert(resView.body.success === false, 'Returns success: false');
    assert(resView.body.message.includes('Access denied'), 'Denial message returned');

    // Student B attempts to modify decision on Student A's match
    const reqDecide = { user: userStudentB, params: { id: matchA1.id }, body: { decision: 'accept' } };
    const resDecide = createMockRes();
    await matchController.handleMatchDecision(reqDecide, resDecide, (err) => { throw err; });

    assert(resDecide.statusCode === 403, 'Returns 403 Forbidden when student tries to decide another user match');

    // Admin CAN view any user's match
    const reqAdmin = { user: adminUser, params: { id: matchA1.id } };
    const resAdmin = createMockRes();
    await matchController.getMatchById(reqAdmin, resAdmin, (err) => { throw err; });
    assert(resAdmin.statusCode === 200, 'Admin can view any match across campus');
  }

  // Clean up test matches
  await adapter.delete('matches', matchA1.id);
  await adapter.delete('matches', matchA2.id);

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');

  return failed === 0;
}

runMatchesTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Test suite uncaught error:', err);
    process.exit(1);
  });
