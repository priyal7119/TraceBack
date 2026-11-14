/**
 * Targeted Test Suite for DynamoDB Adapter Integration
 * 
 * Validates:
 * 1. Primary key mapping for all 6 tables (id <-> specific PK/SK)
 * 2. CRUD command generation & execution across all entities
 * 3. Match top-level GSI attributes (lostUserId, foundUserId, status, createdAt)
 * 4. Claims createdAt and submittedAt preservation
 * 5. Notification composite-key operations (userId + notificationId)
 * 6. User-specific dispute isolation via Scan FilterExpression
 * 7. Correct GSI selection across all query patterns
 * 8. Local JSON fallback persistence
 * 9. Explicit failure in AWS mode when AWS calls fail (no silent fallback)
 */

const DynamoDbAdapter = require('../data/dynamoDbAdapter');
const adapter = require('../data/adapter');
const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const runTests = async () => {
  console.log('====================================================');
  console.log('TraceBack DynamoDB Adapter Validation Suite');
  console.log('====================================================\n');

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

  // Test Harness: Recorded Mock DynamoDB Client
  const recordedCommands = [];
  const mockResponses = new Map();

  const mockClient = {
    send: async (command) => {
      recordedCommands.push(command);
      const cmdName = command.constructor.name;
      const key = `${cmdName}_${command.input.TableName}_${command.input.IndexName || 'main'}`;

      if (mockResponses.has(key)) {
        const handler = mockResponses.get(key);
        return typeof handler === 'function' ? handler(command.input) : handler;
      }

      // Default mock responses
      if (cmdName === 'GetCommand') {
        return { Item: { ...command.input.Key, name: 'Mock Item' } };
      }
      if (cmdName === 'PutCommand') {
        return {};
      }
      if (cmdName === 'UpdateCommand') {
        return { Attributes: { ...command.input.Key, updated: true } };
      }
      if (cmdName === 'DeleteCommand') {
        return {};
      }
      if (cmdName === 'QueryCommand' || cmdName === 'ScanCommand') {
        return { Items: [], Count: 0 };
      }
      return {};
    }
  };

  const ddb = new DynamoDbAdapter(mockClient);

  // -------------------------------------------------------------
  // 1. Primary Key Mapping (Task 2)
  // -------------------------------------------------------------
  console.log('--- 1. Generic ID to Primary Key Mapping ---');

  // Users: id <-> userId
  const userItem = ddb._toDynamoItem('users', { id: 'usr_101', name: 'John Doe', email: 'john@campus.ves.ac.in' });
  assert(userItem.userId === 'usr_101' && userItem.id === 'usr_101', 'Users: maps id to userId as PK');
  const userFromDb = ddb._fromDynamoItem('users', { userId: 'usr_101', name: 'John Doe' });
  assert(userFromDb.id === 'usr_101' && userFromDb.userId === 'usr_101', 'Users: reads userId and populates both id and userId');

  // Reports: id <-> reportId
  const reportItem = ddb._toDynamoItem('reports', { id: 'rep_202', title: 'Lost Keys', type: 'lost' });
  assert(reportItem.reportId === 'rep_202' && reportItem.id === 'rep_202', 'Reports: maps id to reportId as PK');
  const reportFromDb = ddb._fromDynamoItem('reports', { reportId: 'rep_202', title: 'Lost Keys' });
  assert(reportFromDb.id === 'rep_202' && reportFromDb.reportId === 'rep_202', 'Reports: reads reportId and populates both id and reportId');

  // Matches: id <-> matchId
  const matchItem = ddb._toDynamoItem('matches', { id: 'mat_303', lostItemId: 'rep_1', foundItemId: 'rep_2' });
  assert(matchItem.matchId === 'mat_303' && matchItem.id === 'mat_303', 'Matches: maps id to matchId as PK');
  const matchFromDb = ddb._fromDynamoItem('matches', { matchId: 'mat_303' });
  assert(matchFromDb.id === 'mat_303' && matchFromDb.matchId === 'mat_303', 'Matches: reads matchId and populates both id and matchId');

  // Claims: id <-> claimId
  const claimItem = ddb._toDynamoItem('claims', { id: 'clm_404', itemId: 'rep_2', claimantId: 'usr_1' });
  assert(claimItem.claimId === 'clm_404' && claimItem.id === 'clm_404', 'Claims: maps id to claimId as PK');
  const claimFromDb = ddb._fromDynamoItem('claims', { claimId: 'clm_404' });
  assert(claimFromDb.id === 'clm_404' && claimFromDb.claimId === 'clm_404', 'Claims: reads claimId and populates both id and claimId');

  // Disputes: id <-> disputeId
  const disputeItem = ddb._toDynamoItem('disputes', { id: 'dsp_505', itemId: 'rep_2', reason: 'Contested ownership' });
  assert(disputeItem.disputeId === 'dsp_505' && disputeItem.id === 'dsp_505', 'Disputes: maps id to disputeId as PK');
  const disputeFromDb = ddb._fromDynamoItem('disputes', { disputeId: 'dsp_505' });
  assert(disputeFromDb.id === 'dsp_505' && disputeFromDb.disputeId === 'dsp_505', 'Disputes: reads disputeId and populates both id and disputeId');

  // Notifications: userId (PK) and notificationId (SK)
  const notifItem = ddb._toDynamoItem('notifications', { id: 'notif_606', userId: 'usr_1', title: 'Alert' });
  assert(notifItem.userId === 'usr_1' && notifItem.notificationId === 'notif_606' && notifItem.id === 'notif_606', 'Notifications: maps userId as PK and notificationId as SK');
  const notifFromDb = ddb._fromDynamoItem('notifications', { userId: 'usr_1', notificationId: 'notif_606' });
  assert(notifFromDb.userId === 'usr_1' && notifFromDb.notificationId === 'notif_606' && notifFromDb.id === 'notif_606', 'Notifications: reads composite key and populates id');

  // Verify generic id is NOT the only primary key
  assert(userItem.userId !== undefined, 'User item explicitly has userId attribute');
  assert(reportItem.reportId !== undefined, 'Report item explicitly has reportId attribute');
  assert(matchItem.matchId !== undefined, 'Match item explicitly has matchId attribute');
  assert(claimItem.claimId !== undefined, 'Claim item explicitly has claimId attribute');
  assert(disputeItem.disputeId !== undefined, 'Dispute item explicitly has disputeId attribute');
  assert(notifItem.notificationId !== undefined && notifItem.userId !== undefined, 'Notification explicitly has composite key attributes');

  // -------------------------------------------------------------
  // 2. Match Top-Level GSI Attributes (Task 3)
  // -------------------------------------------------------------
  console.log('\n--- 2. Match Record GSI Attributes ---');
  const createdMatch = ddb._toDynamoItem('matches', {
    id: 'mat_test_01',
    lostItemId: 'rep_lost_1',
    foundItemId: 'rep_found_1',
    lostItem: { userId: 'usr_lost_student', title: 'Lost Phone' },
    foundItem: { reportedBy: { id: 'usr_found_admin' }, title: 'Found Phone' },
    status: 'suggested',
  });

  assert(createdMatch.lostUserId === 'usr_lost_student', 'Match derives lostUserId from lostItem.userId');
  assert(createdMatch.foundUserId === 'usr_found_admin', 'Match derives foundUserId from foundItem.reportedBy.id');
  assert(createdMatch.status === 'suggested', 'Match has top-level status attribute');
  assert(Boolean(createdMatch.createdAt), 'Match has top-level createdAt timestamp');

  // -------------------------------------------------------------
  // 3. Claims createdAt Population (Task 4)
  // -------------------------------------------------------------
  console.log('\n--- 3. Claims Timestamp Preservation ---');
  const now = new Date().toISOString();
  const createdClaim = ddb._toDynamoItem('claims', {
    id: 'clm_test_01',
    itemId: 'rep_found_1',
    claimantId: 'usr_claimant',
    submittedAt: now,
  });

  assert(createdClaim.createdAt === now, 'Claims explicitly sets createdAt matching submittedAt');
  assert(createdClaim.submittedAt === now, 'Claims preserves submittedAt');

  // -------------------------------------------------------------
  // 4. Notification Composite-Key Operations (Task 5)
  // -------------------------------------------------------------
  console.log('\n--- 4. Notification Composite-Key Operations ---');
  // Composite key extraction
  const compositeKey = ddb._buildKey('notifications', { userId: 'usr_1', notificationId: 'notif_99' });
  assert(compositeKey.userId === 'usr_1' && compositeKey.notificationId === 'notif_99', 'Notifications extracts { userId, notificationId } composite key');

  // Rejection of scalar key
  let threwScalarError = false;
  try {
    ddb._buildKey('notifications', 'scalar_notif_id');
  } catch (err) {
    threwScalarError = true;
  }
  assert(threwScalarError, 'Notifications throws error when scalar key is supplied without userId');

  // Find by composite key
  recordedCommands.length = 0;
  await ddb.findById('notifications', { userId: 'usr_1', notificationId: 'notif_99' });
  const lastGetCmd = recordedCommands[recordedCommands.length - 1];
  assert(
    lastGetCmd instanceof GetCommand &&
    lastGetCmd.input.TableName === 'TraceBack_Notifications' &&
    lastGetCmd.input.Key.userId === 'usr_1' &&
    lastGetCmd.input.Key.notificationId === 'notif_99',
    'GetCommand uses complete composite key on TraceBack_Notifications'
  );

  // Update with composite key
  recordedCommands.length = 0;
  await ddb.update('notifications', { userId: 'usr_1', notificationId: 'notif_99' }, { read: true });
  const lastUpdateCmd = recordedCommands[recordedCommands.length - 1];
  assert(
    lastUpdateCmd instanceof UpdateCommand &&
    lastUpdateCmd.input.Key.userId === 'usr_1' &&
    lastUpdateCmd.input.Key.notificationId === 'notif_99',
    'UpdateCommand uses complete composite key on TraceBack_Notifications'
  );

  // Query notifications by userId
  recordedCommands.length = 0;
  await ddb.find('notifications', { userId: 'usr_1' });
  const lastNotifQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastNotifQuery instanceof QueryCommand &&
    lastNotifQuery.input.KeyConditionExpression.includes('#userId = :userId'),
    'Notifications query accesses user partition via KeyConditionExpression'
  );

  // -------------------------------------------------------------
  // 5. User-Specific Dispute Isolation (Task 6)
  // -------------------------------------------------------------
  console.log('\n--- 5. User Dispute Isolation via Scan Filter ---');
  recordedCommands.length = 0;
  await ddb.find('disputes', { participantUserId: 'usr_disputing_student', status: 'open' });
  const lastDisputeScan = recordedCommands[recordedCommands.length - 1];
  assert(
    lastDisputeScan instanceof ScanCommand &&
    lastDisputeScan.input.TableName === 'TraceBack_Disputes' &&
    lastDisputeScan.input.FilterExpression.includes('#submittedBy = :uid') &&
    lastDisputeScan.input.FilterExpression.includes('#claimant1.#id = :uid') &&
    lastDisputeScan.input.FilterExpression.includes('#status = :status'),
    'Disputes uses filtered Scan isolating participant user across submittedBy and claimant objects'
  );

  // -------------------------------------------------------------
  // 6. GSI Queries Verification (Task 7)
  // -------------------------------------------------------------
  console.log('\n--- 6. GSI Queries Verification ---');

  // Users: EmailIndex
  recordedCommands.length = 0;
  await ddb.find('users', { email: 'student@campus.ves.ac.in' });
  const lastUserQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastUserQuery instanceof QueryCommand &&
    lastUserQuery.input.IndexName === 'EmailIndex' &&
    lastUserQuery.input.KeyConditionExpression.includes('#email = :email'),
    'Users: queries EmailIndex for email lookup'
  );

  // Reports: UserReportsIndex
  recordedCommands.length = 0;
  await ddb.find('reports', { userId: 'usr_my_reports' });
  const lastUserReportQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastUserReportQuery instanceof QueryCommand &&
    lastUserReportQuery.input.IndexName === 'UserReportsIndex' &&
    lastUserReportQuery.input.KeyConditionExpression.includes('#userId = :userId') &&
    lastUserReportQuery.input.ScanIndexForward === false,
    'Reports: queries UserReportsIndex for user reports sorted descending'
  );

  // Reports: TypeStatusIndex
  recordedCommands.length = 0;
  await ddb.find('reports', { type: 'lost', status: 'active', category: 'Electronics' });
  const lastTypeReportQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastTypeReportQuery instanceof QueryCommand &&
    lastTypeReportQuery.input.IndexName === 'TypeStatusIndex' &&
    lastTypeReportQuery.input.KeyConditionExpression.includes('#type = :type') &&
    lastTypeReportQuery.input.FilterExpression.includes('#status = :status'),
    'Reports: queries TypeStatusIndex for public lost/found listings with status filter'
  );

  // Reports: CategoryStatusIndex
  recordedCommands.length = 0;
  await ddb.find('reports', { category: 'Electronics', status: 'active' });
  const lastCategoryReportQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastCategoryReportQuery instanceof QueryCommand &&
    lastCategoryReportQuery.input.IndexName === 'CategoryStatusIndex' &&
    lastCategoryReportQuery.input.KeyConditionExpression.includes('#category = :category AND #status = :status'),
    'Reports: queries CategoryStatusIndex when filtering by category and status without type'
  );

  // Matches: LostUserMatchesIndex & FoundUserMatchesIndex
  recordedCommands.length = 0;
  await ddb.find('matches', { userId: 'usr_matching_user' });
  const matchQueries = recordedCommands.filter(c => c instanceof QueryCommand);
  assert(
    matchQueries.length === 2 &&
    matchQueries.some(q => q.input.IndexName === 'LostUserMatchesIndex') &&
    matchQueries.some(q => q.input.IndexName === 'FoundUserMatchesIndex'),
    'Matches: executes parallel queries on LostUserMatchesIndex and FoundUserMatchesIndex'
  );

  // Claims: ClaimantClaimsIndex
  recordedCommands.length = 0;
  await ddb.find('claims', { claimantId: 'usr_claimant_user' });
  const lastClaimantQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastClaimantQuery instanceof QueryCommand &&
    lastClaimantQuery.input.IndexName === 'ClaimantClaimsIndex' &&
    lastClaimantQuery.input.KeyConditionExpression.includes('#claimantId = :claimantId'),
    'Claims: queries ClaimantClaimsIndex for user claims'
  );

  // Claims: ItemClaimsIndex
  recordedCommands.length = 0;
  await ddb.find('claims', { itemId: 'rep_found_item' });
  const lastItemClaimsQuery = recordedCommands[recordedCommands.length - 1];
  assert(
    lastItemClaimsQuery instanceof QueryCommand &&
    lastItemClaimsQuery.input.IndexName === 'ItemClaimsIndex' &&
    lastItemClaimsQuery.input.KeyConditionExpression.includes('#itemId = :itemId'),
    'Claims: queries ItemClaimsIndex for item claims'
  );

  // -------------------------------------------------------------
  // 7. CRUD Operations for all 6 entities (Task 1)
  // -------------------------------------------------------------
  console.log('\n--- 7. CRUD Operations for All 6 Entities ---');
  const collections = ['users', 'reports', 'matches', 'claims', 'disputes', 'notifications'];

  for (const col of collections) {
    recordedCommands.length = 0;
    const testData = col === 'notifications'
      ? { id: `test_${col}_id`, userId: 'usr_crud_test', title: 'Test Notif' }
      : { id: `test_${col}_id`, title: `Test ${col}` };

    // Create (PutCommand)
    await ddb.create(col, testData);
    const putCmd = recordedCommands.find(c => c instanceof PutCommand);
    assert(
      putCmd && putCmd.input.TableName.toLowerCase().includes(col.toLowerCase()),
      `CRUD [${col}]: Create dispatches PutCommand to correct table`
    );

    // Read (GetCommand)
    recordedCommands.length = 0;
    const keyToFind = col === 'notifications'
      ? { userId: 'usr_crud_test', notificationId: `test_${col}_id` }
      : `test_${col}_id`;
    await ddb.findById(col, keyToFind);
    const getCmd = recordedCommands.find(c => c instanceof GetCommand);
    assert(
      getCmd && getCmd.input.TableName.toLowerCase().includes(col.toLowerCase()),
      `CRUD [${col}]: FindById dispatches GetCommand`
    );

    // Update (UpdateCommand)
    recordedCommands.length = 0;
    await ddb.update(col, keyToFind, { status: 'updated_status' });
    const updateCmd = recordedCommands.find(c => c instanceof UpdateCommand);
    assert(
      updateCmd && updateCmd.input.TableName.toLowerCase().includes(col.toLowerCase()),
      `CRUD [${col}]: Update dispatches UpdateCommand`
    );

    // Delete (DeleteCommand)
    recordedCommands.length = 0;
    await ddb.delete(col, keyToFind);
    const deleteCmd = recordedCommands.find(c => c instanceof DeleteCommand);
    assert(
      deleteCmd && deleteCmd.input.TableName.toLowerCase().includes(col.toLowerCase()),
      `CRUD [${col}]: Delete dispatches DeleteCommand`
    );
  }

  // -------------------------------------------------------------
  // 8. Local JSON Fallback (Task 8)
  // -------------------------------------------------------------
  console.log('\n--- 8. Local JSON Fallback Mode ---');
  const initialAdapterType = adapter.getAdapterType();
  assert(initialAdapterType === 'local', 'Default environment resolves to local adapter');

  // Verify local adapter CRUD works
  const localTestReport = await adapter.create('reports', {
    title: 'Adapter Switch Test Item',
    type: 'lost',
    category: 'Electronics',
    userId: 'usr_adapter_test',
  });
  assert(localTestReport && localTestReport.id, 'Local adapter creates item in memory/file');

  const retrievedLocal = await adapter.findById('reports', localTestReport.id);
  assert(retrievedLocal && retrievedLocal.title === 'Adapter Switch Test Item', 'Local adapter retrieves created item');

  // Clean up
  await adapter.delete('reports', localTestReport.id);
  const deletedLocal = await adapter.findById('reports', localTestReport.id);
  assert(deletedLocal === null, 'Local adapter deletes created item');

  // -------------------------------------------------------------
  // 9. AWS Mode Clear Failure (No Silent Fallback)
  // -------------------------------------------------------------
  console.log('\n--- 9. AWS Mode Clear Failure (No Silent Fallback) ---');
  const failingClient = {
    send: async () => {
      const err = new Error('ResourceNotFoundException: Cannot do operations on a non-existent table.');
      err.name = 'ResourceNotFoundException';
      throw err;
    }
  };

  const failingDdb = new DynamoDbAdapter(failingClient);
  let caughtExplicitError = false;
  let caughtErrorMsg = '';

  try {
    await failingDdb.findById('users', 'usr_nonexistent');
  } catch (err) {
    caughtExplicitError = true;
    caughtErrorMsg = err.message;
  }

  assert(
    caughtExplicitError && caughtErrorMsg.includes('ResourceNotFoundException'),
    'AWS DynamoDB mode throws error explicitly rather than silently falling back to local JSON data',
    caughtErrorMsg
  );

  // Credentials failure test
  const credentialFailingClient = {
    send: async () => {
      const err = new Error('UnrecognizedClientException: The security token included in the request is invalid.');
      err.name = 'UnrecognizedClientException';
      throw err;
    }
  };

  const credFailingDdb = new DynamoDbAdapter(credentialFailingClient);
  let caughtCredError = false;
  try {
    await credFailingDdb.create('users', { id: 'usr_test', email: 'test@campus.ac.in' });
  } catch (err) {
    caughtCredError = true;
  }

  assert(caughtCredError, 'AWS DynamoDB mode fails loudly when credentials fail, preserving security boundaries');

  console.log('\n====================================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = runTests;
