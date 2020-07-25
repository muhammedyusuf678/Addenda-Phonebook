// function () {
//loop through pool
//close all db connections
// }

//get all other users who have the same contact
router.get("/test", authMiddleware, async (req, res) => {
  console.log("in main thread");

  //note: mongodb serializes user and contact objects retrieved when passing to worker thread
  let worker1 = createWorker("worker1");

  //Add error listener
  worker1.on("error", (err) => {
    console.error(`main thread: error from worker thread: ${err.message}`);
    throw err;
  });
  //add message listener
  worker1.on("message", (msg) => {
    console.log("message from worker");
    console.log(msg);
  });
});

function createWorker(threadId) {
  const worker = new Worker("./lib/worker.js", {
    workerData: { threadId },
  });

  return worker;
}
