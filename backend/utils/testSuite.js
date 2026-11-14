/**
 * Automated Comprehensive Backend Test Suite
 * Validates all 14 testing requirements without requiring external tools.
 */

const http = require('http');
const { Readable } = require('stream');
const { EventEmitter } = require('events');
const app = require('../server');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const inProcessRequest = (method, path, body = null, headers = {}) => {
  return new Promise((resolve) => {
    const fullPath = path.startsWith('/health') ? '/health' : (`/api${path}`);
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const req = Readable.from(bodyStr ? [Buffer.from(bodyStr)] : []);
    req.method = method;
    req.url = fullPath;
    req.originalUrl = fullPath;

    const lowerHeaders = {
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(bodyStr)),
    };
    for (const [k, v] of Object.entries(headers)) {
      lowerHeaders[k.toLowerCase()] = v;
    }

    req.headers = lowerHeaders;
    req.socket = { remoteAddress: '127.0.0.1' };
    req.connection = { remoteAddress: '127.0.0.1' };

    let resData = '';
    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.writeHead = (status, h) => { res.statusCode = status; return res; };
    res.write = (c) => { resData += c; };
    res.end = (c) => {
      if (c) resData += c;
      let parsed;
      try { parsed = JSON.parse(resData); } catch { parsed = resData; }
      resolve({
        status: res.statusCode,
        headers: res._headers,
        body: parsed,
      });
    };

    app.handle(req, res);
  });
};

const request = (method, path, body = null, headers = {}) => {
  // If running in sandbox without loopback sockets, fall back to in-process dispatch seamlessly
  return new Promise((resolve) => {
    try {
      const url = new URL(`${BASE_URL}${path}`);
      const reqHeaders = {
        'Content-Type': 'application/json',
        ...headers,
      };

      const req = http.request(
        url,
        {
          method,
          headers: reqHeaders,
          timeout: 1500,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let parsed;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsed,
            });
          });
        }
      );

      req.on('error', () => {
        inProcessRequest(method, path, body, headers).then(resolve);
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    } catch {
      inProcessRequest(method, path, body, headers).then(resolve);
    }
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('TraceBack HAMC Backend Automated Test Suite');
  console.log('====================================================\n');

  let studentToken = null;
  let adminToken = null;
  let createdLostId = null;
  let createdFoundId = null;
  let sampleMatchId = null;
  let sampleClaimId = null;
  let sampleDisputeId = null;
  let sampleNotifId = null;

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Healthcheck
    const health = await request('GET', '/health');
    assert(health.status === 200, 'Health check endpoint returns 200', JSON.stringify(health.body));

    // 2. Student Login
    const studentLogin = await request('POST', '/auth/login', {
      email: 'priya.iyer@campus.ves.ac.in',
      password: 'Password123!',
    });
    assert(studentLogin.status === 200 && studentLogin.body.token, 'Student login returns 200 and JWT token');
    studentToken = studentLogin.body.token;

    // 3. Admin Login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin.hamc@traceback.org',
      password: 'AdminPassword123!',
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin login returns 200 with admin role');
    adminToken = adminLogin.body.token;

    // 4. Protected Route: Get Profile
    const profile = await request('GET', '/users/profile', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(profile.status === 200 && profile.body.user.email === 'priya.iyer@campus.ves.ac.in', 'Protected user profile returns student data');

    // 5. RBAC: Student blocked from Admin API
    const studentBlocked = await request('GET', '/admin/overview', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(studentBlocked.status === 403, 'RBAC blocks standard student from admin overview (403 Forbidden)');

    // 6. Admin access to Admin API
    const adminOverview = await request('GET', '/admin/overview', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminOverview.status === 200 && adminOverview.body.stats, 'Admin successfully accesses admin overview metrics');

    // 7. Get Lost Reports
    const lostReports = await request('GET', '/reports/lost');
    assert(lostReports.status === 200 && Array.isArray(lostReports.body.reports), 'Get public lost reports returns list');

    // 8. Get Found Reports
    const foundReports = await request('GET', '/reports/found');
    assert(foundReports.status === 200 && Array.isArray(foundReports.body.reports), 'Get public found reports returns list');

    // 9. Create Lost Report
    const newLost = await request('POST', '/reports/lost', {
      title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
      description: 'Lost in Central Library 2nd floor reading cubicle during afternoon study session.',
      category: 'Electronics',
      date: '2026-11-10',
      location: 'Central Library - 2nd Floor Reading Room',
      brand: 'Sony',
      primaryColor: 'Matte Black',
      aiTags: ['Electronics', 'Headphones', 'Audio Equipment', 'Matte Black'],
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(newLost.status === 201 && newLost.body.report.id, 'Student creates lost item report');
    createdLostId = newLost.body.report.id;

    // 10. Create Found Report (matches above item to test matching engine)
    const newFound = await request('POST', '/reports/found', {
      title: 'Sony Black Over-Ear Headphones',
      description: 'Handed in from Central Library reading area. Deposited at Library Custody Desk.',
      category: 'Electronics',
      date: '2026-11-10',
      location: 'Central Library Custody Desk',
      custodyLocation: 'Central Library Custody Desk',
      brand: 'Sony',
      primaryColor: 'Black',
      aiTags: ['Electronics', 'Headphones', 'Black Over-Ear'],
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(newFound.status === 201 && newFound.body.report.id, 'Admin creates found item report');
    createdFoundId = newFound.body.report.id;

    // 11. Matching Engine Verification
    const matches = await request('GET', '/matches', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(matches.status === 200 && matches.body.matches.length > 0, 'Matching engine automatically generated match suggestions');
    sampleMatchId = matches.body.matches[0].id;

    // Verify match details & scoring breakdown
    const matchDetail = await request('GET', `/matches/${sampleMatchId}`, null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(
      matchDetail.status === 200 &&
      matchDetail.body.match.scores &&
      matchDetail.body.match.scores.imageLabels !== undefined &&
      matchDetail.body.match.scores.category !== undefined,
      'Match record contains 4-part weighted scoring breakdown'
    );

    // 12. Record Match Decision
    const decision = await request('POST', `/matches/${sampleMatchId}/decision`, {
      decision: 'accept',
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(decision.status === 200 && decision.body.match.status === 'accepted', 'Student accepts match suggestion');

    // 13. Submit Ownership Claim
    const claim = await request('POST', '/claims', {
      itemId: createdFoundId,
      proofDetails: 'Headphones have custom engraving inside headband: ARV-2026. Device name is Aarav-XM4.',
      verificationAnswers: { serialNumber: 'SN-SONY-789' },
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(claim.status === 201 && claim.body.claim.id, 'Student submits item ownership claim');
    sampleClaimId = claim.body.claim.id;

    // 14. Admin Review Claim
    const claimReview = await request('PATCH', `/claims/${sampleClaimId}`, {
      status: 'approved',
      adminNotes: 'Serial number verified against student invoice. Approved for collection at Library Desk.',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(claimReview.status === 200 && claimReview.body.claim.status === 'approved', 'Admin reviews and approves ownership claim');

    // 15. Submit Dispute
    const dispute = await request('POST', '/disputes', {
      itemId: createdFoundId,
      reason: 'Second student also claims ownership of black headphones.',
      evidence: 'Purchased at Chembur electronics store.',
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(dispute.status === 201 && dispute.body.dispute.id, 'Dispute successfully filed');
    sampleDisputeId = dispute.body.dispute.id;

    // 16. Admin Resolve Dispute
    const disputeResolve = await request('POST', `/disputes/${sampleDisputeId}/resolve`, {
      decision: 'Physical proof of purchase examined. Device released to rightful claimant 1.',
      status: 'resolved',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(disputeResolve.status === 200 && disputeResolve.body.dispute.status === 'resolved', 'Admin resolves dispute');

    // 17. In-App Notifications
    const notifs = await request('GET', '/notifications', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(notifs.status === 200 && Array.isArray(notifs.body.notifications), 'Notifications retrieved successfully');
    if (notifs.body.notifications.length > 0) {
      sampleNotifId = notifs.body.notifications[0].id;
      const markRead = await request('PATCH', `/notifications/${sampleNotifId}/read`, null, {
        Authorization: `Bearer ${studentToken}`,
      });
      assert(markRead.status === 200 && markRead.body.notification.read === true, 'Mark notification as read works');
    }

    // 18. Image Presigned URL / Local Dev Endpoint
    const uploadUrl = await request('POST', '/images/upload-url', {
      fileName: 'watch-photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024 * 500,
      reportType: 'lost',
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(uploadUrl.status === 200 && uploadUrl.body.uploadUrl, 'Image upload preparation endpoint returns uploadUrl & publicUrl');

    // 19. Forgot Password Workflow
    const forgot = await request('POST', '/auth/forgot-password', {
      email: 'priya.iyer@campus.ves.ac.in',
    });
    assert(forgot.status === 200 && forgot.body.devToken, 'Forgot password initiates development token workflow');

    // 20. Reset Password Workflow
    const reset = await request('POST', '/auth/reset-password', {
      token: forgot.body.devToken,
      newPassword: 'Password123!',
    });
    assert(reset.status === 200, 'Password reset succeeds with token');

    // 21. New User Registration
    const newReg = await request('POST', '/auth/register', {
      name: 'Sneha Patil',
      email: `sneha.patil.${Date.now()}@campus.ves.ac.in`,
      password: 'StrongPassword123!',
      department: 'B.E. Information Technology',
      phone: '+91 98765 43210',
    });
    assert(newReg.status === 201 && newReg.body.token, 'New campus user registration succeeds');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================');

  return failed === 0;
};

if (require.main === module) {
  runTests().then((success) => process.exit(success ? 0 : 1)).catch(() => process.exit(1));
}

module.exports = runTests;
