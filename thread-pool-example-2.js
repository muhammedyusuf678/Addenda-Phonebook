const { StaticPool } = require("node-worker-threads-pool");

const staticPool = new StaticPool({
  size: 4,
  task: (n) => n + 1,
});

staticPool.exec(1).then((result) => {
  console.log("result from thread pool:", result); // result will be 2.
});

staticPool.exec(2).then((result) => {
  console.log("result from thread pool:", result); // result will be 2.
});
