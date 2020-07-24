"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const TempContact = require("../models/TempContact");

const { connectDB, closeDB } = require("../config/db");

const { parentPort, workerData } = require("worker_threads");

const { threadId, userId, contactId } = workerData;
const dbConnection = connectDB(`worker ${threadId}:`);

workerTask(threadId, userId, contactId);

async function workerTask(threadId, userId, contactId) {
  let user = await User.findById(userId).select("-password");
  let contact = await Contact.findById(contactId);

  console.log(user);
  console.log(contact);
  //Fetch the list of the users who already have this tempContact in their contacts
  console.log("worker: picking a temp contact");
  const tempContact = await getATempContact();
  console.log(tempContact);
  let usersWithContact = await getUsersWithContact(contact);
  parentPort.postMessage({
    msg: "finished getUsersWithContact",
    usersWithContact,
  });
  //Append list to the second_contacts list of the loggedIn User
  usersWithContact.forEach((element) => {
    user.second_contacts.push(element._id);
  });
  parentPort.postMessage(JSON.stringify(user));
  let savedUser = await user.save();
  //mark the document status as completed
  parentPort.postMessage({ status: "Completed" });
  closeDB(mongoose, `worker ${threadId}:`);
}

async function getATempContact() {
  try {
    const tempContact = await TempContact.findOneAndUpdate(
      { status: "Not Started" },
      { $set: { status: "In Progress" } },
      { new: true }
    );
    return tempContact;
  } catch (err) {
    console.error(err.message);
    throw new Error(
      "Worker: Error in retrieving temp contact to process from database"
    );
  }
}

async function getUsersWithContact(contact) {
  parentPort.postMessage("in getUsersWithContact");
  try {
    const aggregateResult = await User.aggregate([
      {
        $project: {
          name: "$name",
          email: "$email",
          hasContact: {
            $in: [contact._id, "$contacts"],
          },
        },
      },
    ]);
    parentPort.postMessage("aggegate done");

    //filter out the other users who have the same contact
    const usersWithContact = aggregateResult.filter(function (el) {
      return el.hasContact == true && el._id != userId;
    });
    return usersWithContact;
  } catch (err) {
    console.error(`error in worker thread: ${err.message}`);
    throw new Error(err.message);
  }
}
