require('dotenv').config();
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoDbDocClient, dynamoTableNames } = require('../config/aws');

async function inspectTables() {
  console.log('--- Scanning All 6 Live DynamoDB Tables ---');

  for (const [entity, tableName] of Object.entries(dynamoTableNames)) {
    try {
      const res = await dynamoDbDocClient.send(new ScanCommand({ TableName: tableName }));
      const items = res.Items || [];
      console.log(`\n======================================================`);
      console.log(`Table: ${tableName} (${items.length} records)`);
      console.log(`======================================================`);

      items.forEach((it, idx) => {
        let summary = '';
        if (entity === 'users') {
          summary = `userId: ${it.userId} | name: ${it.name} | email: ${it.email} | role: ${it.role}`;
        } else if (entity === 'reports') {
          summary = `reportId: ${it.reportId} | type: ${it.type} | title: ${it.title} | userId: ${it.userId} | status: ${it.status}`;
        } else if (entity === 'matches') {
          summary = `matchId: ${it.matchId} | lostItemId: ${it.lostItemId} | foundItemId: ${it.foundItemId} | lostUserId: ${it.lostUserId} | foundUserId: ${it.foundUserId} | score: ${it.overallScore}% | status: ${it.status}`;
        } else if (entity === 'claims') {
          summary = `claimId: ${it.claimId} | itemId: ${it.itemId} | claimantId: ${it.claimantId} | claimantName: ${it.claimantName} | status: ${it.status}`;
        } else if (entity === 'disputes') {
          summary = `disputeId: ${it.disputeId} | itemId: ${it.itemId} | submittedBy: ${it.submittedBy} | status: ${it.status}`;
        } else if (entity === 'notifications') {
          summary = `userId: ${it.userId} | notifId: ${it.notificationId} | type: ${it.type} | title: ${it.title} | read: ${it.read}`;
        }
        console.log(`[${idx + 1}] ${summary}`);
      });
    } catch (err) {
      console.error(`Error scanning ${tableName}:`, err.message);
    }
  }
}

inspectTables()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal inspection error:', err);
    process.exit(1);
  });
