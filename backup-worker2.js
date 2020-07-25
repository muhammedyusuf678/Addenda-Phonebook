"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const TempContact = require("../models/TempContact");

const { connectDB, closeDB } = require("../config/db");

const { parentPort, workerData } = require("worker_threads");

const { threadId } = workerData;
const dbConnection = connectDB(`worker ${threadId}:`);

workerTask(threadId);

async function workerTask(threadId) {
  //Fetch the list of the users who already have this tempContact in their contacts
  console.log("worker: picking a temp contact");
  const tempContact = await getATempContact();
  console.log(tempContact);

  let usersWithContact = await getUsersWithContact(tempContact);

  //Append list to the second_contacts list of the loggedIn User
  usersWithContact.forEach((element) => {
    //add to second contacts only if user not already there (maybe by another mutual contact)
    if (!tempContact.user.second_contacts.includes(element._id)) {
      tempContact.user.second_contacts.push(element._id);
    }
  });

  let savedUser = await tempContact.user.save();
  //mark the document status as completed
  tempContact.status = "Completed";
  await tempContact.save();
  parentPort.postMessage({
    status: "Completed",
  });
  console.log(savedUser);

  closeDB(mongoose, `worker ${threadId}:`);
}

async function getATempContact() {
  try {
    const tempContact = await TempContact.findOneAndUpdate(
      { status: "Not Started" },
      { $set: { status: "In Progress" } },
      { new: true }
    )
      .populate("user", "-password")
      .populate("contact");
    return tempContact;
  } catch (err) {
    console.error(err.message);
    throw new Error(
      "Worker: Error in retrieving temp contact to process from database"
    );
  }
}

async function getUsersWithContact(tempContact) {
  parentPort.postMessage("in getUsersWithContact");
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
    console.error(`error in worker thread: ${err.message}`);
    throw new Error(err.message);
  }
}
