const { StaticPool } = require("node-worker-threads-pool");
const path = require("path");
const os = require("os");

const cpuCount = 3;
const workerScript = path.join(__dirname, "./worker-test.js");

const pool = new StaticPool({
  size: cpuCount,
  task: workerScript,
  workerData: "workerdata",
});

console.log(pool);

async function main() {
  const res = await pool.exec("");
  console.log("result from worker");
  console.log(res);
  //pool.destroy;
}

main();

// pool.destroy();
