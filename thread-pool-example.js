const Pool = require("worker-threads-pool");
const os = require("os");

// this is how we can get the count of cpu's the computer has,
// using a larger number may result in the app crushing
const cpuCount = os.cpus().length;
const pool = new Pool({ max: 5 });
console.log(pool.size);
console.log(cpuCount);
// for (let i = 0; i < 100; i++) {
//   setTimeout(function () {
//     pool.acquire("/my/worker.js", function (err, worker) {
//       if (err) throw err;
//       console.log(`started worker ${i} (pool size: ${pool.size})`);
//       worker.on("exit", function () {
//         console.log(`worker ${i} exited (pool size: ${pool.size})`);
//       });
//     });
//   }, 1000);
// }
