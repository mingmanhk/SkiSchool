
const { startWorkers } = require('../src/workers/index.ts'); // You might need ts-node to run this

// Simple entry point to start workers independently if deployed as a separate service
startWorkers();
