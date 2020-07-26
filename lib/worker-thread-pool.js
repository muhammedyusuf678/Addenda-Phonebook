const { StaticPool } = require("node-worker-threads-pool");
const path = require("path");
const os = require("os");

// get the count of cpu's the machine has to determine number of threads
const cpuCount = os.cpus().length;
// get absolute path of worker thread script
const workerScript = path.join(__dirname, "./worker.js");

// create static threadpool
const pool = new StaticPool({
  size: cpuCount,
  task: workerScript,
});

module.exports = { workerPool: pool, numOfThreads: cpuCount };
