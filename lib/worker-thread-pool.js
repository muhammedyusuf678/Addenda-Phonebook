const { StaticPool } = require("node-worker-threads-pool");
const path = require("path");
const os = require("os");

// get the count of cpu's the machine has to determine number of threads
const cpuCount = os.cpus().length;
const workerScript = path.join(__dirname, "./worker.js");

const pool = new StaticPool({
  size: cpuCount,
  task: workerScript,
});

module.exports = pool;
