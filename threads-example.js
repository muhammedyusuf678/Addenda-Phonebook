const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
if (isMainThread) {
  // This code is executed in the main thread and not in the worker.

  let contact = {
    contacts: ["5f1a0a15f77bfa4f16795be8"],
    second_contacts: [],
    _id: "5f1a09ecf77bfa4f16795be7",
    name: "user3",
    email: "user3@gmail.com",
    __v: 1,
  };
  console.log("main: create worker and send it contact");
  // Create the worker and send it data
  const worker = new Worker(__filename, {
    workerData: { id: "worker1", contact: { ...contact, type: "WorkerData" } },
  });
  // Listen for messages from the worker and print them.
  worker.on("message", (msg) => {
    console.log(msg);
  });

  worker.postMessage({ ...contact, type: "postMessage" });

  worker.on("error", (err) => {
    console.log("in main thread, error recieved from worker thread");
    console.log(err.message); //error message from thread
  });
} else {
  // This code is executed in the worker and not in the main thread.
  console.log("In worker thread console log");
  const { id, contact } = workerData;

  console.log(contact);
  //change contact status
  let processedContact = {
    ...contact,
    status: "Completed",
  };

  // Send a message to the main thread.
  parentPort.postMessage({ processedContact, msg: "The deed is done" });

  //listen for messages from parent
  parentPort.on("message", (msg) => {
    if (msg === "How are you?") {
      console.log("message from main:" + msg);
      parentPort.postMessage("I'm good homie");
      return;
    } else {
      console.log("worker: contact from post message");
      console.log(msg);
    }
  });

  // throw new Error("This is a thread error");
}
