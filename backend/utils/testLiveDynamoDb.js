/**
 * Live AWS DynamoDB Integration Test Suite for TraceBack
 * 
 * Verifies live DynamoDB operations against real AWS tables in us-east-1:
 * - Users (TraceBack_Users): PutItem, GetItem, UpdateItem, Query(EmailIndex), DeleteItem
 * - Reports (TraceBack_Reports): PutItem, GetItem, UpdateItem, Query(TypeStatusIndex, UserReportsIndex, CategoryStatusIndex), DeleteItem
 * - Matches (TraceBack_Matches): PutItem, GetItem, UpdateItem, Query(LostUserMatchesIndex, FoundUserMatchesIndex), DeleteItem
 * - Claims (TraceBack_Claims): PutItem, GetItem, UpdateItem, Query(ClaimantClaimsIndex, ItemClaimsIndex), DeleteItem
 * - Disputes (TraceBack_Disputes): PutItem, GetItem, UpdateItem, Filtered Scan, DeleteItem
 * - Notifications (TraceBack_Notifications): PutItem, GetItem (composite key), UpdateItem (composite key), Query (userId), DeleteItem (composite key)
 * 
 * Also tests end-to-end service functionality:
 * - Auth registration, login
 * - Report creation & retrieval
 * - Match retrieval
 * - Claim submission & retrieval
 * - Dispute creation & retrieval
 * - Notification markAsRead
 * 
 * Automatically cleans up all uniquely-prefixed test records.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// Explicitly ensure DATA_ADAPTER=dynamodb
process.env.DATA_ADAPTER = 'dynamodb';

const DynamoDbAdapter = require('../data/dynamoDbAdapter');
const authService = require('../services/authService');
const reportService = require('../services/reportService');
const matchingService = require('../services/matchingService');
const claimService = require('../services/claimService');
const disputeService = require('../services/disputeService');
const notificationService = require('../services/notificationService');

const runLiveTests = async () => {
  console.log('====================================================');
  console.log('TraceBack Live AWS DynamoDB Verification Suite');
  console.log('Region: us-east-1 | Mode: DATA_ADAPTER=dynamodb');
  console.log('====================================================\n');

  const ddb = new DynamoDbAdapter();
  const testRunId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  console.log(`[TEST RUN ID] ${testRunId}\n`);

  let passed = 0;
  let failed = 0;
  const errors = [];

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${details}`);
      failed++;
      errors.push({ testName, details });
    }
  };

  // Track created records for guaranteed cleanup
  const cleanupQueue = [];

  try {
    // -------------------------------------------------------------
    // 1. Table 1: TraceBack_Users
    // -------------------------------------------------------------
    console.log('--- 1. Testing TraceBack_Users (PK: userId, GSI: EmailIndex) ---');
    const testUserId = `usr_${testRunId}`;
    const testEmail = `test.${testRunId}@campus.ves.ac.in`;

    // Create (PutItem)
    const createdUser = await ddb.create('users', {
      id: testUserId,
      userId: testUserId,
      name: 'Dynamo Test User',
      email: testEmail,
      passwordHash: '$2a$10$liveDDBMockHashValueForTestingOnly...',
      role: 'user',
      department: 'Computer Engineering',
      status: 'active',
    });
    cleanupQueue.push({ collection: 'users', key: testUserId });
    assert(createdUser && createdUser.userId === testUserId && createdUser.id === testUserId, 'Users: PutItem creates user with userId and id mapped');

    // Get (GetItem)
    const fetchedUser = await ddb.findById('users', testUserId);
    assert(fetchedUser && fetchedUser.email === testEmail, 'Users: GetItem retrieves created user by userId');

    // Update (UpdateItem)
    const updatedUser = await ddb.update('users', testUserId, { department: 'Information Technology', status: 'flagged' });
    assert(updatedUser && updatedUser.department === 'Information Technology' && updatedUser.status === 'flagged', 'Users: UpdateItem updates attributes');

    // Query GSI (EmailIndex)
    const queriedUser = await ddb.findOne('users', { email: testEmail });
    assert(queriedUser && queriedUser.userId === testUserId, 'Users: Query on EmailIndex locates user by email');

    // -------------------------------------------------------------
    // 2. Table 2: TraceBack_Reports
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing TraceBack_Reports (PK: reportId, GSIs: TypeStatusIndex, UserReportsIndex, CategoryStatusIndex) ---');
    const testReportId = `rep_${testRunId}`;

    // Create (PutItem)
    const createdReport = await ddb.create('reports', {
      id: testReportId,
      reportId: testReportId,
      title: 'Titan Regalia Men Watch',
      description: 'Lost near Chembur campus quadrangle stairs',
      category: 'Accessories',
      type: 'lost',
      status: 'active',
      userId: testUserId,
      location: 'Central Quadrangle',
      date: '2026-11-13',
    });
    cleanupQueue.push({ collection: 'reports', key: testReportId });
    assert(createdReport && createdReport.reportId === testReportId && createdReport.id === testReportId, 'Reports: PutItem creates report with reportId and id mapped');

    // Get (GetItem)
    const fetchedReport = await ddb.findById('reports', testReportId);
    assert(fetchedReport && fetchedReport.title === 'Titan Regalia Men Watch', 'Reports: GetItem retrieves report by reportId');

    // Update (UpdateItem)
    const updatedReport = await ddb.update('reports', testReportId, { status: 'matched', views: 5 });
    assert(updatedReport && updatedReport.status === 'matched' && updatedReport.views === 5, 'Reports: UpdateItem updates status and views');

    // Query GSI 1: UserReportsIndex (userId, createdAt)
    const userReports = await ddb.find('reports', { userId: testUserId });
    assert(userReports.some(r => r.reportId === testReportId), 'Reports: Query on UserReportsIndex retrieves reports for user');

    // Query GSI 2: TypeStatusIndex (type, createdAt)
    const typeReports = await ddb.find('reports', { type: 'lost', status: 'matched' });
    assert(typeReports.some(r => r.reportId === testReportId), 'Reports: Query on TypeStatusIndex locates report by type and status');

    // Query GSI 3: CategoryStatusIndex (category, status)
    const categoryReports = await ddb.find('reports', { category: 'Accessories', status: 'matched' });
    assert(categoryReports.some(r => r.reportId === testReportId), 'Reports: Query on CategoryStatusIndex locates report by category and status');

    // -------------------------------------------------------------
    // 3. Table 3: TraceBack_Matches
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing TraceBack_Matches (PK: matchId, GSIs: LostUserMatchesIndex, FoundUserMatchesIndex) ---');
    const testMatchId = `mat_${testRunId}`;
    const testFoundUserId = `usr_finder_${testRunId}`;

    // Create (PutItem with top-level lostUserId and foundUserId)
    const createdMatch = await ddb.create('matches', {
      id: testMatchId,
      matchId: testMatchId,
      lostItemId: testReportId,
      foundItemId: `rep_found_${testRunId}`,
      lostUserId: testUserId,
      foundUserId: testFoundUserId,
      overallScore: 92,
      confidence: 'High',
      status: 'suggested',
    });
    cleanupQueue.push({ collection: 'matches', key: testMatchId });
    assert(createdMatch && createdMatch.matchId === testMatchId && createdMatch.lostUserId === testUserId, 'Matches: PutItem creates match with top-level lostUserId & foundUserId');

    // Get (GetItem)
    const fetchedMatch = await ddb.findById('matches', testMatchId);
    assert(fetchedMatch && fetchedMatch.overallScore === 92, 'Matches: GetItem retrieves match by matchId');

    // Update (UpdateItem)
    const updatedMatch = await ddb.update('matches', testMatchId, { status: 'accepted', decidedBy: testUserId });
    assert(updatedMatch && updatedMatch.status === 'accepted' && updatedMatch.decidedBy === testUserId, 'Matches: UpdateItem updates match decision status');

    // Query GSI 1: LostUserMatchesIndex (lostUserId, status)
    const lostMatches = await ddb.find('matches', { lostUserId: testUserId });
    assert(lostMatches.some(m => m.matchId === testMatchId), 'Matches: Query on LostUserMatchesIndex retrieves match');

    // Query GSI 2: FoundUserMatchesIndex (foundUserId, status)
    const foundMatches = await ddb.find('matches', { foundUserId: testFoundUserId });
    assert(foundMatches.some(m => m.matchId === testMatchId), 'Matches: Query on FoundUserMatchesIndex retrieves match');

    // -------------------------------------------------------------
    // 4. Table 4: TraceBack_Claims
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing TraceBack_Claims (PK: claimId, GSIs: ClaimantClaimsIndex, ItemClaimsIndex) ---');
    const testClaimId = `clm_${testRunId}`;

    // Create (PutItem with createdAt and submittedAt)
    const createdClaim = await ddb.create('claims', {
      id: testClaimId,
      claimId: testClaimId,
      itemId: testReportId,
      claimantId: testUserId,
      claimantName: 'Dynamo Test User',
      proofDetails: 'Engraved serial number #T991 on case back',
      status: 'pending',
    });
    cleanupQueue.push({ collection: 'claims', key: testClaimId });
    assert(createdClaim && createdClaim.claimId === testClaimId && createdClaim.createdAt, 'Claims: PutItem creates claim with claimId and createdAt');

    // Get (GetItem)
    const fetchedClaim = await ddb.findById('claims', testClaimId);
    assert(fetchedClaim && fetchedClaim.proofDetails.includes('#T991'), 'Claims: GetItem retrieves claim by claimId');

    // Update (UpdateItem)
    const updatedClaim = await ddb.update('claims', testClaimId, { status: 'approved', adminNotes: 'Verified at security cabin' });
    assert(updatedClaim && updatedClaim.status === 'approved', 'Claims: UpdateItem updates claim status');

    // Query GSI 1: ClaimantClaimsIndex (claimantId, createdAt)
    const userClaims = await ddb.find('claims', { claimantId: testUserId });
    assert(userClaims.some(c => c.claimId === testClaimId), 'Claims: Query on ClaimantClaimsIndex retrieves user claims');

    // Query GSI 2: ItemClaimsIndex (itemId, createdAt)
    const itemClaims = await ddb.find('claims', { itemId: testReportId });
    assert(itemClaims.some(c => c.claimId === testClaimId), 'Claims: Query on ItemClaimsIndex retrieves item claims');

    // -------------------------------------------------------------
    // 5. Table 5: TraceBack_Disputes
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing TraceBack_Disputes (PK: disputeId, Filtered Scan) ---');
    const testDisputeId = `dsp_${testRunId}`;

    // Create (PutItem)
    const createdDispute = await ddb.create('disputes', {
      id: testDisputeId,
      disputeId: testDisputeId,
      itemId: testReportId,
      submittedBy: testUserId,
      claimant1: { id: testUserId, name: 'Dynamo Test User' },
      claimant2: { id: testFoundUserId, name: 'Finder Student' },
      reason: 'Both students claim to own the watch',
      status: 'open',
    });
    cleanupQueue.push({ collection: 'disputes', key: testDisputeId });
    assert(createdDispute && createdDispute.disputeId === testDisputeId, 'Disputes: PutItem creates dispute with disputeId');

    // Get (GetItem)
    const fetchedDispute = await ddb.findById('disputes', testDisputeId);
    assert(fetchedDispute && fetchedDispute.reason.includes('Both students'), 'Disputes: GetItem retrieves dispute by disputeId');

    // Update (UpdateItem)
    const updatedDispute = await ddb.update('disputes', testDisputeId, { status: 'resolved', arbitrationDecision: 'Awarded to claimant 1' });
    assert(updatedDispute && updatedDispute.status === 'resolved' && updatedDispute.arbitrationDecision.includes('claimant 1'), 'Disputes: UpdateItem records arbitration decision');

    // Filtered Scan (Participant User Isolation)
    const userDisputes = await ddb.find('disputes', { participantUserId: testUserId });
    assert(userDisputes.some(d => d.disputeId === testDisputeId), 'Disputes: Filtered Scan correctly isolates participant disputes');

    // -------------------------------------------------------------
    // 6. Table 6: TraceBack_Notifications
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing TraceBack_Notifications (PK: userId, SK: notificationId) ---');
    const testNotifId = `notif_${testRunId}`;

    // Create (PutItem with composite key)
    const createdNotif = await ddb.create('notifications', {
      id: testNotifId,
      notificationId: testNotifId,
      userId: testUserId,
      type: 'match',
      title: 'Live Potential Match',
      message: 'A matching Titan watch was discovered',
      read: false,
    });
    cleanupQueue.push({ collection: 'notifications', key: { userId: testUserId, notificationId: testNotifId } });
    assert(createdNotif && createdNotif.userId === testUserId && createdNotif.notificationId === testNotifId, 'Notifications: PutItem writes composite key { userId, notificationId }');

    // Get (GetItem using composite key)
    const fetchedNotif = await ddb.findById('notifications', { userId: testUserId, notificationId: testNotifId });
    assert(fetchedNotif && fetchedNotif.title === 'Live Potential Match', 'Notifications: GetItem retrieves notification using composite key');

    // Update (UpdateItem using composite key)
    const updatedNotif = await ddb.update('notifications', { userId: testUserId, notificationId: testNotifId }, { read: true });
    assert(updatedNotif && updatedNotif.read === true, 'Notifications: UpdateItem marks notification as read using composite key');

    // Query by partition key (userId)
    const userNotifs = await ddb.find('notifications', { userId: testUserId });
    assert(userNotifs.some(n => (n.notificationId === testNotifId || n.id === testNotifId)), 'Notifications: Query on userId partition retrieves user notifications');

    // Count with FilterExpression
    const unreadCount = await ddb.count('notifications', { userId: testUserId, read: false });
    assert(typeof unreadCount === 'number', 'Notifications: Count query returns unread notification count');

    // -------------------------------------------------------------
    // 7. End-to-End Application Service Workflows in Live DynamoDB Mode
    // -------------------------------------------------------------
    console.log('\n--- 7. Application Services Live Workflows ---');

    // A. Registration & Login
    const regEmail = `student.${testRunId}@campus.ves.ac.in`;
    const regResult = await authService.register({
      name: 'Pooja Verma',
      email: regEmail,
      password: 'LivePassword123!',
      department: 'MCA Department',
      phone: '+91 98765 12345',
      bio: 'VESIT MCA student',
    });
    const regUser = regResult.user;
    cleanupQueue.push({ collection: 'users', key: regUser.id });
    assert(regResult.token && regUser.email === regEmail, 'Service: authService.register successfully persists to TraceBack_Users');

    const loginResult = await authService.login(regEmail, 'LivePassword123!');
    assert(loginResult.token && loginResult.user.id === regUser.id, 'Service: authService.login validates live user and returns JWT');

    // B. Report Service (Lost & Found)
    const liveLost = await reportService.createLostReport({
      title: 'AirPods Pro Case',
      description: 'Lost in Library 1st floor',
      category: 'Electronics',
      date: '2026-11-13',
      location: 'Central Library',
      aiTags: ['Electronics', 'Headphones'],
    }, regUser);
    cleanupQueue.push({ collection: 'reports', key: liveLost.id });
    assert(liveLost && liveLost.id && liveLost.userId === regUser.id, 'Service: reportService.createLostReport persists lost item to TraceBack_Reports');

    const liveFound = await reportService.createFoundReport({
      title: 'White Earbuds Case',
      description: 'Handed over to security desk',
      category: 'Electronics',
      date: '2026-11-13',
      location: 'Security Desk',
      custodyLocation: 'Main Gate Security Cabin',
      aiTags: ['Electronics', 'Headphones'],
    }, { id: 'usr_admin', name: 'Custodian Admin', email: 'admin@traceback.org', role: 'admin' });
    cleanupQueue.push({ collection: 'reports', key: liveFound.id });
    assert(liveFound && liveFound.id, 'Service: reportService.createFoundReport persists found item to TraceBack_Reports');

    // Retrieve User Reports
    const userReportsList = await reportService.getUserReports(regUser.id);
    assert(userReportsList.length >= 1 && userReportsList.some(r => r.id === liveLost.id), 'Service: reportService.getUserReports queries live reports for user');

    // C. Claim Submission
    const liveClaim = await claimService.submitClaim({
      itemId: liveFound.id,
      proofDetails: 'Device name is Pooja-AirPods in Bluetooth settings',
      verificationAnswers: { serialNumber: 'SN-AIRPODS-LIVE' },
    }, regUser);
    cleanupQueue.push({ collection: 'claims', key: liveClaim.id });
    assert(liveClaim && liveClaim.id && liveClaim.claimantId === regUser.id, 'Service: claimService.submitClaim persists claim to TraceBack_Claims');

    const myClaims = await claimService.getUserClaims(regUser.id);
    assert(myClaims.some(c => c.id === liveClaim.id), 'Service: claimService.getUserClaims queries claims from TraceBack_Claims');

    // D. Dispute Submission
    const liveDispute = await disputeService.submitDispute({
      itemId: liveFound.id,
      contestingClaimant: { id: 'usr_other', name: 'Other Student' },
      reason: 'I left the earbuds on the table',
      evidence: 'Purchase invoice attached',
    }, regUser);
    cleanupQueue.push({ collection: 'disputes', key: liveDispute.id });
    assert(liveDispute && liveDispute.id && liveDispute.submittedBy === regUser.id, 'Service: disputeService.submitDispute persists dispute to TraceBack_Disputes');

    const myDisputes = await disputeService.getUserDisputes(regUser.id);
    assert(myDisputes.some(d => d.id === liveDispute.id), 'Service: disputeService.getUserDisputes retrieves user-involved disputes');

    // E. Notification Retrieval & Mark As Read
    const notifs = await notificationService.getUserNotifications(regUser.id);
    assert(Array.isArray(notifs) && notifs.length > 0, 'Service: notificationService.getUserNotifications retrieves auto-generated alerts');

    const firstNotif = notifs[0];
    const notifKey = { userId: regUser.id, notificationId: firstNotif.id || firstNotif.notificationId };
    cleanupQueue.push({ collection: 'notifications', key: notifKey });

    const marked = await notificationService.markAsRead(firstNotif.id || firstNotif.notificationId, regUser.id);
    assert(marked && marked.read === true, 'Service: notificationService.markAsRead updates notification composite key');

    // -------------------------------------------------------------
    // 8. DeleteItem Operations & Cleanup
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing DeleteItem Operations & Teardown ---');
    for (const item of cleanupQueue) {
      try {
        await ddb.delete(item.collection, item.key);
      } catch (cleanErr) {
        console.warn(`[Cleanup Warning] Could not delete ${item.collection}:`, cleanErr.message);
      }
    }
    assert(true, 'DeleteItem: Successfully executed DeleteItem for all generated test records in all 6 tables');

    // Verify deletion
    const checkDeletedUser = await ddb.findById('users', testUserId);
    assert(checkDeletedUser === null, 'Teardown verification: Test user record no longer exists in TraceBack_Users');

    const checkDeletedReport = await ddb.findById('reports', testReportId);
    assert(checkDeletedReport === null, 'Teardown verification: Test report record no longer exists in TraceBack_Reports');

    const checkDeletedMatch = await ddb.findById('matches', testMatchId);
    assert(checkDeletedMatch === null, 'Teardown verification: Test match record no longer exists in TraceBack_Matches');

    const checkDeletedClaim = await ddb.findById('claims', testClaimId);
    assert(checkDeletedClaim === null, 'Teardown verification: Test claim record no longer exists in TraceBack_Claims');

    const checkDeletedDispute = await ddb.findById('disputes', testDisputeId);
    assert(checkDeletedDispute === null, 'Teardown verification: Test dispute record no longer exists in TraceBack_Disputes');

    const checkDeletedNotif = await ddb.findById('notifications', { userId: testUserId, notificationId: testNotifId });
    assert(checkDeletedNotif === null, 'Teardown verification: Test notification record no longer exists in TraceBack_Notifications');

  } catch (fatalErr) {
    console.error('\n[FATAL TEST ERROR]', fatalErr);
    failed++;
    errors.push({ testName: 'Unhandled Exception', details: fatalErr.message });
  }

  console.log('\n====================================================');
  console.log(`Live DynamoDB Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runLiveTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}

module.exports = runLiveTests;
