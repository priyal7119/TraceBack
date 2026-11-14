const app = require('../server');
const runTests = require('./testSuite');

const PORT = process.env.PORT || 5000;

// Wait 1 second for port to bind, then run tests
setTimeout(async () => {
  try {
    const success = await runTests();
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Test runner failed:', err);
    process.exit(1);
  }
}, 1200);
