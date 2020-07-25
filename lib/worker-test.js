"use strict";

const { parentPort, workerData } = require("worker_threads");
const threadId = require("worker_threads").threadId;
// Main thread will send message to tell worker thread running in pool to execute
parentPort.on("message", async (message) => {
  if (message == "terminate") {
    console.log("terminating worker thread");
    process.exit(0);
  } else {
    // parentPort.postMessage({
    //   msg: "Worker: This is just a random message" + workerData,
    // });
    parentPort.postMessage({ msg: `worker with id ${threadId}` + message });
  }
});
