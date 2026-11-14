/**
 * TraceBack Seed Script
 * Pre-populates local development store with HAMC Chembur campus data,
 * with securely hashed bcrypt passwords for administrator and student accounts.
 */

require('dotenv').config();
const { hashPassword } = require('./hashHelper');
const adapter = require('../data/adapter');
const logger = require('./logger');

const runSeed = async () => {
  logger.info('Starting TraceBack database seed...');

  const adminPasswordHash = await hashPassword(process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!');
  const userPasswordHash = await hashPassword(process.env.INITIAL_USER_PASSWORD || 'Password123!');

  const users = [
    {
      id: 'usr_01',
      name: process.env.INITIAL_USER_NAME || 'Aarav Sharma',
      email: (process.env.INITIAL_USER_EMAIL || 'aarav.sharma@campus.ves.ac.in').toLowerCase(),
      passwordHash: userPasswordHash,
      role: 'user',
      department: 'B.E. Computer Engineering (Year 3)',
      phone: '+91 98201 23456',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      bio: 'Third year engineering student at Vivekanand Education Society, HAMC campus Chembur.',
      status: 'active',
      createdAt: '2026-08-15T09:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_admin',
      name: process.env.INITIAL_ADMIN_NAME || 'Prof. Rajesh Kulkarni',
      email: (process.env.INITIAL_ADMIN_EMAIL || 'admin.hamc@traceback.org').toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'Campus Security & Facility Administration',
      phone: '+91 98200 99887',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Facility Custodian and Chief Administrator for Lost & Found, HAMC Chembur.',
      status: 'active',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_02',
      name: 'Priya Iyer',
      email: 'priya.iyer@campus.ves.ac.in',
      passwordHash: userPasswordHash,
      role: 'user',
      department: 'B.Pharm (Final Year)',
      phone: '+91 98192 34567',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Pharmacy student at Vivekanand Education Society, Chembur.',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_03',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@campus.ves.ac.in',
      passwordHash: userPasswordHash,
      role: 'user',
      department: 'MCA Department',
      phone: '+91 98334 56789',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'MCA student at Vivekanand Education Society HAMC.',
      status: 'active',
      createdAt: '2026-09-10T11:00:00.000Z',
      updatedAt: new Date().toISOString()
    }
  ];

  const reports = [
    {
      id: 'itm_001',
      type: 'lost',
      title: 'Titan Regalia Men\'s Watch (Silver & Gold)',
      description: '[DEMO SAMPLE DATA] Lost near the Central Quadrangle stairs after morning lectures. Metallic strap with dual-tone finish and blue dial.',
      category: 'Eyewear & Accessories',
      date: '2026-11-08',
      location: 'Central Quadrangle',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: 'usr_01',
      reportedBy: { id: 'usr_01', name: 'Aarav Sharma', email: 'aarav.sharma@campus.ves.ac.in', phone: '+91 98201 23456', role: 'user' },
      brand: 'Titan',
      primaryColor: 'Metallic Silver',
      distinctFeatures: 'Scratch near the 4 o\'clock marker, butterfly buckle.',
      custodyLocation: '',
      aiTags: ['Watch', 'Analog Watch', 'Metallic Band', 'Accessories'],
      rekognitionConfidence: 97.4,
      views: 42,
      createdAt: '2026-11-08T11:30:00.000Z',
      updatedAt: '2026-11-08T11:30:00.000Z'
    },
    {
      id: 'itm_002',
      type: 'found',
      title: 'Titan Dual-Tone Metallic Wristwatch',
      description: '[DEMO SAMPLE DATA] Found on bench outside Central Library reading room on 2nd floor. Deposited at the Central Library Custody Desk.',
      category: 'Eyewear & Accessories',
      date: '2026-11-08',
      location: 'Central Library Custody Desk',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      status: 'matched',
      userId: 'usr_admin',
      reportedBy: { id: 'usr_admin', name: 'Prof. Rajesh Kulkarni', email: 'admin.hamc@traceback.org', phone: '+91 98200 99887', role: 'admin' },
      brand: 'Titan',
      primaryColor: 'Metallic Silver',
      distinctFeatures: 'Has minor hairline scratch on the side casing.',
      custodyLocation: 'Central Library Custody Desk',
      aiTags: ['Watch', 'Wristwatch', 'Timepiece', 'Metallic Band'],
      rekognitionConfidence: 96.8,
      views: 78,
      createdAt: '2026-11-08T14:15:00.000Z',
      updatedAt: '2026-11-08T14:15:00.000Z'
    },
    {
      id: 'itm_003',
      type: 'lost',
      title: 'Apple AirPods Pro (2nd Gen) in White Case',
      description: '[DEMO SAMPLE DATA] Left behind in Lab 402 (Advanced Computing Lab) during Computer Networks practical session.',
      category: 'Electronics',
      date: '2026-11-07',
      location: 'Lab 402 - Advanced Computing Lab',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
      status: 'matched',
      userId: 'usr_01',
      reportedBy: { id: 'usr_01', name: 'Aarav Sharma', email: 'aarav.sharma@campus.ves.ac.in', phone: '+91 98201 23456', role: 'user' },
      brand: 'Apple',
      primaryColor: 'White',
      distinctFeatures: 'Small yellow smiley sticker on the back of the charging case.',
      custodyLocation: '',
      aiTags: ['Earphone', 'Audio Equipment', 'Electronics', 'Headphones'],
      rekognitionConfidence: 99.1,
      views: 110,
      createdAt: '2026-11-07T16:00:00.000Z',
      updatedAt: '2026-11-07T16:00:00.000Z'
    },
    {
      id: 'itm_004',
      type: 'found',
      title: 'AirPods Pro Case with Yellow Decal',
      description: '[DEMO SAMPLE DATA] Handed over by lab attendant of Lab 402 to the Main Gate Security Cabin. Contains both earbuds.',
      category: 'Electronics',
      date: '2026-11-07',
      location: 'Main Gate Security Cabin',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80',
      status: 'under_review',
      userId: 'usr_admin',
      reportedBy: { id: 'usr_admin', name: 'Prof. Rajesh Kulkarni', email: 'admin.hamc@traceback.org', phone: '+91 98200 99887', role: 'admin' },
      brand: 'Apple',
      primaryColor: 'White',
      distinctFeatures: 'Yellow circular sticker on reverse side.',
      custodyLocation: 'Main Gate Security Cabin',
      aiTags: ['Electronics', 'Headphones', 'Earbuds', 'White Plastic'],
      rekognitionConfidence: 98.4,
      views: 89,
      createdAt: '2026-11-07T17:30:00.000Z',
      updatedAt: '2026-11-07T17:30:00.000Z'
    },
    {
      id: 'itm_005',
      type: 'lost',
      title: 'Wildcraft Black & Teal College Backpack',
      description: '[DEMO SAMPLE DATA] Forgot on the cafeteria table during lunch rush. Contains engineering reference textbooks and spiral notebook.',
      category: 'Bags & Wallets',
      date: '2026-11-06',
      location: 'Campus Canteen',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: 'usr_03',
      reportedBy: { id: 'usr_03', name: 'Rohan Mehra', email: 'rohan.mehra@campus.ves.ac.in', phone: '+91 98334 56789', role: 'user' },
      brand: 'Wildcraft',
      primaryColor: 'Black / Teal',
      distinctFeatures: 'VESIT logo keychain attached to main zipper.',
      custodyLocation: '',
      aiTags: ['Backpack', 'Bag', 'Luggage', 'Textiles'],
      rekognitionConfidence: 94.2,
      views: 31,
      createdAt: '2026-11-06T13:45:00.000Z',
      updatedAt: '2026-11-06T13:45:00.000Z'
    },
    {
      id: 'itm_006',
      type: 'found',
      title: 'Casio fx-991EX Scientific Calculator',
      description: '[DEMO SAMPLE DATA] Found under desk in Auditorium Foyer after the campus seminar. Available for claim at Administrative Office Counter 3.',
      category: 'Electronics',
      date: '2026-11-05',
      location: 'Administrative Office - Counter 3',
      city: 'Chembur, Mumbai',
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      status: 'active',
      userId: 'usr_admin',
      reportedBy: { id: 'usr_admin', name: 'Prof. Rajesh Kulkarni', email: 'admin.hamc@traceback.org', phone: '+91 98200 99887', role: 'admin' },
      brand: 'Casio',
      primaryColor: 'Black & Carbon',
      distinctFeatures: 'Has roll number scratched on battery cover.',
      custodyLocation: 'Administrative Office - Counter 3',
      aiTags: ['Calculator', 'Electronics', 'Office Equipment'],
      rekognitionConfidence: 98.7,
      views: 54,
      createdAt: '2026-11-05T17:00:00.000Z',
      updatedAt: '2026-11-05T17:00:00.000Z'
    }
  ];

  const matches = [
    {
      id: 'mtc_001',
      lostItemId: 'itm_003',
      foundItemId: 'itm_004',
      lostItem: reports[2],
      foundItem: reports[3],
      overallScore: 94,
      confidence: 'High',
      scores: {
        imageLabels: 95,
        category: 100,
        location: 90,
        date: 95
      },
      visualSimilarity: 95,
      metadataSimilarity: 93,
      status: 'suggested',
      aiComparison: {
        matchedLabels: ['Electronics', 'Audio Equipment', 'White Plastic', 'Charging Case'],
        locationDistanceScore: 90,
        dateDifferenceDays: 0,
        rekognitionInsights: 'Automated Rekognition visual scan identified high geometric affinity and identical decal pattern on reverse side.'
      },
      createdAt: '2026-11-07T18:00:00.000Z',
      updatedAt: '2026-11-07T18:00:00.000Z'
    },
    {
      id: 'mtc_002',
      lostItemId: 'itm_001',
      foundItemId: 'itm_002',
      lostItem: reports[0],
      foundItem: reports[1],
      overallScore: 89,
      confidence: 'High',
      scores: {
        imageLabels: 88,
        category: 100,
        location: 85,
        date: 90
      },
      visualSimilarity: 88,
      metadataSimilarity: 90,
      status: 'suggested',
      aiComparison: {
        matchedLabels: ['Watch', 'Wristwatch', 'Metallic Band', 'Dual Tone'],
        locationDistanceScore: 85,
        dateDifferenceDays: 0,
        rekognitionInsights: 'Matching metallic dual-tone watch detected in proximate library custody desk on same date.'
      },
      createdAt: '2026-11-08T15:00:00.000Z',
      updatedAt: '2026-11-08T15:00:00.000Z'
    }
  ];

  const claims = [
    {
      id: 'clm_001',
      itemId: 'itm_004',
      itemTitle: 'AirPods Pro Case with Yellow Decal',
      claimantId: 'usr_01',
      claimantName: 'Aarav Sharma',
      claimantEmail: 'aarav.sharma@campus.ves.ac.in',
      claimantPhone: '+91 98201 23456',
      proofDetails: 'The charging case has a yellow circular smiley decal on the back. Connected via Apple Find My to aarav.sharma@campus.ves.ac.in.',
      verificationAnswers: {
        serialNumber: 'H1234XYZ987',
        deviceBluetoothName: 'Aarav\'s AirPods Pro'
      },
      status: 'under_review',
      adminNotes: 'Candidate verified in Find My screenshot. Physical verification scheduled at Main Gate Security Cabin.',
      reviewedBy: 'Prof. Rajesh Kulkarni',
      submittedAt: '2026-11-07T19:00:00.000Z',
      reviewedAt: '2026-11-08T09:30:00.000Z',
      updatedAt: '2026-11-08T09:30:00.000Z'
    }
  ];

  const disputes = [
    {
      id: 'dsp_001',
      itemId: 'itm_004',
      itemTitle: 'AirPods Pro Case with Yellow Decal',
      claimant1: { id: 'usr_01', name: 'Aarav Sharma', email: 'aarav.sharma@campus.ves.ac.in' },
      claimant2: { id: 'usr_03', name: 'Rohan Mehra', email: 'rohan.mehra@campus.ves.ac.in' },
      reason: 'Both students claim to have misplaced identical AirPods Pro in Lab 402 on Friday afternoon.',
      evidence: 'Student 1 provided Apple receipt and Bluetooth pairing logs; Student 2 provided packaging box.',
      status: 'investigating',
      arbitrationDecision: 'Physical device serial number to be matched against Apple account cloud record at Security Cabin.',
      assignedAdmin: 'Prof. Rajesh Kulkarni',
      submittedBy: 'usr_03',
      submittedAt: '2026-11-08T10:00:00.000Z',
      lastUpdated: '2026-11-08T14:00:00.000Z'
    }
  ];

  const notifications = [
    {
      id: 'notif_001',
      userId: 'usr_01',
      type: 'match',
      title: 'High-Confidence AI Match Available',
      message: 'Rekognition detected a 94% visual match between your lost AirPods and an item turned in at Main Gate Security Cabin.',
      link: '/user/matches/mtc_001',
      read: false,
      createdAt: '2026-11-07T18:05:00.000Z'
    },
    {
      id: 'notif_002',
      userId: 'usr_01',
      type: 'claim',
      title: 'Claim Under Custodial Review',
      message: 'Your claim for AirPods Pro (clm_001) has been reviewed by Custodian Prof. Rajesh Kulkarni. Physical inspection ready.',
      link: '/user/reports',
      read: true,
      createdAt: '2026-11-08T09:35:00.000Z'
    },
    {
      id: 'notif_003',
      userId: 'usr_01',
      type: 'match',
      title: 'Potential Match for Titan Watch',
      message: 'A found Titan wristwatch at Central Library Custody Desk matches your lost report with 89% similarity score.',
      link: '/user/matches/mtc_002',
      read: false,
      createdAt: '2026-11-08T15:05:00.000Z'
    }
  ];

  await adapter.seed({
    users,
    reports,
    matches,
    claims,
    disputes,
    notifications
  });

  logger.info('Database seeded successfully!');
  logger.info(`Admin account ready: ${process.env.INITIAL_ADMIN_EMAIL || 'admin.hamc@traceback.org'} (Password: ${process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword123!'})`);
  logger.info(`Student account ready: ${process.env.INITIAL_USER_EMAIL || 'aarav.sharma@campus.ves.ac.in'} (Password: ${process.env.INITIAL_USER_PASSWORD || 'Password123!'})`);
};

if (require.main === module) {
  runSeed().then(() => process.exit(0)).catch(err => {
    logger.error('Seed script failed', err);
    process.exit(1);
  });
}

module.exports = runSeed;
