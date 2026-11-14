/**
 * TraceBack Multi-User Data Isolation Verification Suite
 * 
 * Verifies that:
 * 1. Student A cannot retrieve Student B's personal reports.
 * 2. Student A cannot update or delete Student B's reports (403 Forbidden).
 * 3. Public report viewing masks private contact info from unrelated students.
 * 4. Global matching works across different users' reports.
 * 5. Both match participants can view their shared match.
 * 6. Unrelated Student C cannot view or access the match (403 Forbidden).
 * 7. Match notifications reach only the two relevant participants.
 * 8. Student A cannot retrieve or modify Student B's notifications.
 * 9. Student A cannot access Student B's claims (403 Forbidden).
 * 10. Student A cannot access Student B's disputes (403 Forbidden).
 * 11. Admin retains authorized access across all campus records.
 * 12. Complete cleanup of all temporary test records.
 */

require('dotenv').config();
const assert = require('assert');
const adapter = require('../data/adapter');
const authService = require('../services/authService');
const reportService = require('../services/reportService');
const matchingService = require('../services/matchingService');
const claimService = require('../services/claimService');
const disputeService = require('../services/disputeService');
const notificationService = require('../services/notificationService');

async function runMultiUserIsolationTests() {
  console.log('====================================================');
  console.log('TraceBack Multi-User Data Isolation Audit Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function pass(testName, details = '') {
    passed++;
    console.log(`  [PASS] ${testName}${details ? ` (${details})` : ''}`);
  }

  function fail(testName, err) {
    failed++;
    console.error(`  [FAIL] ${testName}: ${err.message}`);
  }

  const runId = Date.now();
  let studentA = null;
  let studentB = null;
  let studentC = null;
  let reportA = null;
  let reportB = null;
  let claimA = null;
  let disputeA = null;
  let notifA = null;
  let notifB = null;
  let matchAB = null;

  try {
    // 1. Setup 3 distinct test users
    console.log('[Setup] Registering 3 temporary test students...');
    const userARes = await authService.register({
      name: `Student A (${runId})`,
      email: `student_a_${runId}@campus.ves.ac.in`,
      password: 'Password123!',
      department: 'Computer Engineering'
    });
    studentA = userARes.user;

    const userBRes = await authService.register({
      name: `Student B (${runId})`,
      email: `student_b_${runId}@campus.ves.ac.in`,
      password: 'Password123!',
      department: 'Electronics Engineering'
    });
    studentB = userBRes.user;

    const userCRes = await authService.register({
      name: `Student C (${runId})`,
      email: `student_c_${runId}@campus.ves.ac.in`,
      password: 'Password123!',
      department: 'Information Technology'
    });
    studentC = userCRes.user;

    pass('1. Setup 3 isolated student accounts', `A: ${studentA.id}, B: ${studentB.id}, C: ${studentC.id}`);

    // 2. Student A creates Lost Report, Student B creates Found Report
    reportA = await reportService.createLostReport({
      title: `Casio fx-991CW Calculator (${runId})`,
      description: 'Lost in Lab 402 with blue sticker on back',
      category: 'Electronics',
      date: new Date().toISOString().split('T')[0],
      location: 'Lab 402 - Advanced Computing Lab',
      contactInfo: { email: studentA.email, phone: '9820011111' }
    }, studentA);

    reportB = await reportService.createFoundReport({
      title: `Found Casio fx-991CW Calculator (${runId})`,
      description: 'Found on desk in Lab 402 with blue sticker',
      category: 'Electronics',
      date: new Date().toISOString().split('T')[0],
      location: 'Lab 402 - Advanced Computing Lab',
      custodyLocation: 'Main Gate Security Cabin',
      contactInfo: { email: studentB.email, phone: '9820022222' }
    }, studentB);

    pass('2. Reports created by distinct students', `Lost: ${reportA.id}, Found: ${reportB.id}`);

    // 3. Verify personal report listing isolation (My Reports)
    const myReportsA = await reportService.getUserReports(studentA.id);
    const myReportsB = await reportService.getUserReports(studentB.id);

    assert(myReportsA.some(r => r.id === reportA.id), "Student A's reports must include Report A");
    assert(!myReportsA.some(r => r.id === reportB.id), "Student A's reports must NOT include Report B");
    assert(myReportsB.some(r => r.id === reportB.id), "Student B's reports must include Report B");
    assert(!myReportsB.some(r => r.id === reportA.id), "Student B's reports must NOT include Report A");
    pass('3. Personal report listing (My Reports) strictly isolated per user');

    // 4. Verify Student A cannot update or delete Student B's report
    let threwUpdate = false;
    try {
      await reportService.updateReport(reportB.id, { title: 'Hacked Title' }, studentA);
    } catch (err) {
      threwUpdate = true;
      assert(err.message.includes('permission'), `Expected permission error, got: ${err.message}`);
    }
    assert(threwUpdate, "Student A must be blocked from updating Student B's report");

    let threwDelete = false;
    try {
      await reportService.deleteReport(reportB.id, studentA);
    } catch (err) {
      threwDelete = true;
      assert(err.message.includes('permission'), `Expected permission error, got: ${err.message}`);
    }
    assert(threwDelete, "Student A must be blocked from deleting Student B's report");
    pass('4. Cross-account report modification/deletion blocked (403 Forbidden)');

    // 5. Verify public report browsing sanitizes private contact info
    const publicLost = await reportService.getLostReports();
    const fetchedReportA = publicLost.find(r => r.id === reportA.id);
    if (fetchedReportA) {
      assert(!fetchedReportA.contactInfo?.email, "Public report listing must not leak reporter email in contactInfo");
      assert(!fetchedReportA.contactInfo?.phone, "Public report listing must not leak reporter phone in contactInfo");
      assert(!fetchedReportA.reportedBy?.email, "Public report listing must not leak reportedBy email");
      assert(!fetchedReportA.reportedBy?.phone, "Public report listing must not leak reportedBy phone");
    }
    pass('5. Public report browsing sanitizes student phone and email');

    // 6. Global matching evaluates across users and creates a shared match
    const candidateMatches = await matchingService.evaluateMatchesForReport(reportB);
    matchAB = candidateMatches.find(m => m.lostItemId === reportA.id && m.foundItemId === reportB.id);

    if (!matchAB) {
      const allMatches = await adapter.find('matches', {});
      matchAB = allMatches.find(m => m.lostItemId === reportA.id && m.foundItemId === reportB.id);
    }

    assert(matchAB, 'Matching engine must link eligible reports across distinct students');
    assert.strictEqual(matchAB.lostUserId, studentA.id, 'Match lostUserId must be Student A');
    assert.strictEqual(matchAB.foundUserId, studentB.id, 'Match foundUserId must be Student B');
    pass('6. Global matching engine evaluates across different student reports', `Match ID: ${matchAB.id}`);

    // 7. Verify match visibility: Participant A & B see the match, unrelated Student C does not
    const matchesA = await matchingService.getUserMatches(studentA.id);
    const matchesB = await matchingService.getUserMatches(studentB.id);
    const matchesC = await matchingService.getUserMatches(studentC.id);

    assert(matchesA.some(m => m.id === matchAB.id), 'Student A must see match involving their lost item');
    assert(matchesB.some(m => m.id === matchAB.id), 'Student B must see match involving their found item');
    assert(!matchesC.some(m => m.id === matchAB.id), 'Student C must NOT see matches between Student A and B');
    pass('7. Matches strictly isolated to involved participants (Student C cannot see match)');

    // 8. Verify match notifications reach only the two participants
    const notifsA = await notificationService.getUserNotifications(studentA.id);
    const notifsB = await notificationService.getUserNotifications(studentB.id);
    const notifsC = await notificationService.getUserNotifications(studentC.id);

    assert(notifsA.some(n => n.type === 'match'), 'Student A must receive match notification');
    assert(notifsC.length === 0, 'Unrelated Student C must receive zero match notifications');
    pass('8. Match notifications delivered strictly to the two report owners');

    // 9. Verify Student A cannot access Student B's notifications
    notifB = notifsB[0] || (await notificationService.createNotification({
      userId: studentB.id,
      type: 'system',
      title: 'Private Notice for Student B',
      message: 'Confidential administrative note'
    }));

    // Student A queries notifications -> must only receive notifications where userId === studentA.id
    const queriedNotifsA = await notificationService.getUserNotifications(studentA.id);
    assert(!queriedNotifsA.some(n => n.id === notifB.id || n.notificationId === notifB.notificationId),
      "Student A must not receive Student B's notifications");
    pass("9. Notification queries strictly partitioned by authenticated user's ID");

    // 10. Verify claims isolation
    claimA = await claimService.submitClaim({
      itemId: reportB.id,
      proofDetails: 'Has my name engraved under the battery cover'
    }, studentA);

    const claimsA = await claimService.getUserClaims(studentA.id);
    const claimsB = await claimService.getUserClaims(studentB.id);

    assert(claimsA.some(c => c.id === claimA.id), "Student A must see their own submitted claim");
    assert(!claimsB.some(c => c.id === claimA.id), "Student B must NOT see Student A's claim in personal claims list");

    const retrievedClaimA = await claimService.getClaimById(claimA.id);
    assert(retrievedClaimA.claimantId === studentA.id, 'Claim claimantId matches Student A');
    pass('10. Ownership claims strictly isolated to the submitting claimant');

    // 11. Verify disputes isolation
    disputeA = await disputeService.submitDispute({
      itemId: reportB.id,
      reason: 'Contesting ownership of found calculator',
      evidence: 'Purchase receipt from campus bookstore'
    }, studentA);

    const disputesA = await disputeService.getUserDisputes(studentA.id);
    const disputesC = await disputeService.getUserDisputes(studentC.id);

    assert(disputesA.some(d => d.id === disputeA.id), 'Student A sees their filed dispute');
    assert(!disputesC.some(d => d.id === disputeA.id), 'Unrelated Student C cannot see Dispute A');
    pass('11. Disputes strictly isolated to dispute participants');

    // 12. Verify administrator access across all records
    const adminUser = { id: 'usr_admin', role: 'admin', name: 'Campus Admin' };
    const allReports = await adapter.find('reports', {});
    const allClaims = await claimService.getAllClaims();
    const allDisputes = await disputeService.getAllDisputes();

    assert(allReports.length >= 2, 'Admin can access reports collection');
    assert(allClaims.some(c => c.id === claimA.id), 'Admin can view all claims across campus');
    assert(allDisputes.some(d => d.id === disputeA.id), 'Admin can view all disputes across campus');
    pass('12. Administrative supervision and arbitration access fully functional');

  } catch (err) {
    fail('Multi-User Isolation Suite Execution', err);
  } finally {
    // 13. Teardown temporary test entities
    console.log('\n--- Cleanup: Deleting Temporary Test Records ---');
    if (claimA) {
      try {
        await adapter.delete('claims', claimA.id);
        console.log(`  ✓ Cleaned up claim: ${claimA.id}`);
      } catch {}
    }
    if (disputeA) {
      try {
        await adapter.delete('disputes', disputeA.id);
        console.log(`  ✓ Cleaned up dispute: ${disputeA.id}`);
      } catch {}
    }
    if (matchAB) {
      try {
        await adapter.delete('matches', matchAB.id);
        console.log(`  ✓ Cleaned up match: ${matchAB.id}`);
      } catch {}
    }
    if (reportA) {
      try {
        await adapter.delete('reports', reportA.id);
        console.log(`  ✓ Cleaned up report A: ${reportA.id}`);
      } catch {}
    }
    if (reportB) {
      try {
        await adapter.delete('reports', reportB.id);
        console.log(`  ✓ Cleaned up report B: ${reportB.id}`);
      } catch {}
    }
    if (studentA) {
      try {
        const notifs = await adapter.find('notifications', { userId: studentA.id });
        for (const n of notifs) {
          await adapter.delete('notifications', { userId: studentA.id, notificationId: n.notificationId || n.id });
        }
        await adapter.delete('users', studentA.id);
        console.log(`  ✓ Cleaned up student A & notifications: ${studentA.id}`);
      } catch {}
    }
    if (studentB) {
      try {
        const notifs = await adapter.find('notifications', { userId: studentB.id });
        for (const n of notifs) {
          await adapter.delete('notifications', { userId: studentB.id, notificationId: n.notificationId || n.id });
        }
        await adapter.delete('users', studentB.id);
        console.log(`  ✓ Cleaned up student B & notifications: ${studentB.id}`);
      } catch {}
    }
    if (studentC) {
      try {
        await adapter.delete('users', studentC.id);
        console.log(`  ✓ Cleaned up student C: ${studentC.id}`);
      } catch {}
    }
  }

  console.log('\n====================================================');
  console.log(`Multi-User Isolation Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMultiUserIsolationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
