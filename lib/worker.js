"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const TempContact = require("../models/TempContact");

const { connectDB, closeDB } = require("../config/db");

const { parentPort, workerData } = require("worker_threads");
const threadId = require("worker_threads").threadId;

connectDB(`Worker Thread ${threadId}`);

// Main thread will send message to tell worker thread running in pool to execute
parentPort.on("message", async (message) => {
  if (message == "terminate") {
    closeDB(mongoose);
    process.exit(0);
  }
  // Pick up a temp contact with status Not Started and mark as In progress
  const tempContact = await getATempContact();
  if (tempContact == null) {
    // return message to main thread
    parentPort.postMessage({
      msg: "Could not find any unstarted task",
      payload: null,
    });
  } else {
    const secondContactsAdded = await workerTask();
    parentPort.postMessage({
      msg: "Temp Contact Processed and Second Contacts Added sucessfully",
      payload: secondContactsAdded,
    });
  }
});

async function workerTask() {
  //Fetch the list of the users who already have this tempContact in their contacts
  let usersWithContact = await getUsersWithContact(tempContact);
  let secondContactsAdded = new Array();
  //Append list to the second_contacts list for the specified user
  usersWithContact.forEach((element) => {
    //add to second contacts only if user not already there (for ex: by another mutual contact)
    if (!tempContact.user.second_contacts.includes(element._id)) {
      tempContact.user.second_contacts.push(element._id);
      secondContactsAdded.push(element);
    }
  });

  let savedUser = await tempContact.user.save();
  //mark the document status as completed
  tempContact.status = "Completed";
  await tempContact.save();

  return secondContactsAdded;
}

async function getATempContact() {
  try {
    const tempContact = await TempContact.findOneAndUpdate(
      { status: "Not Started" },
      { $set: { status: "In Progress" } },
      { new: true }
    )
      .populate({
        path: "user",
        select: "-password -__v" /*remove unwanted fields */,
        model: "User",
      })
      .populate({
        path: "contact",
        select: "-__v" /*remove unwanted fields */,
        model: "Contact",
      });
    return tempContact;
  } catch (err) {
    console.error(`Worker Thread ${threadId}` + err.message);
    throw new Error(
      `Worker Thread ${threadId}: Error in retrieving temp contact to process from database`
    );
  }
}

async function getUsersWithContact(tempContact) {
  try {
    const aggregateResult = await User.aggregate([
      {
        $project: {
          name: "$name",
          email: "$email",
          hasContact: {
            $in: [tempContact.contact._id, "$contacts"],
          },
        },
      },
    ]);

    //filter out the other users who have the same contact
    const usersWithContact = aggregateResult.filter(function (el) {
      return el.hasContact == true && !el._id.equals(tempContact.user._id);
    });
    return usersWithContact;
  } catch (err) {
    console.error(`Worker Thread ${threadId}` + err.message);
    throw new Error(
      `Worker Thread ${threadId}: Error in getting list of users with temp contact`
    );
  }
}
