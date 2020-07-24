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

console.log("starting loop");
console.log(pool);
async function doLoop() {
  for (let i = 0; i < 3; i++) {
    (async () => {
      // This will choose one idle worker in the pool
      // to execute your heavy task without blocking
      // the main thread!
      const res = await pool.exec();
      console.log("####################" + JSON.stringify(res));
    })();
  }
}

async function main() {
  await doLoop();
  pool.destroy;
}

main();

// pool.destroy();
