"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const { connectDB, closeDB } = require("../config/db");

const { parentPort, workerData } = require("worker_threads");

const { id, user, contact } = workerData;

connectDB(`worker ${id}:`);
//_doc added by mongodb serialization
workerTask(user._doc, contact._doc);
closeDB(`worker ${id}:`);

async function workerTask(user, contact) {
  //Fetch the list of the users who already have this tempContact in their contacts
  let usersWithContact = await getUsersWithContact(contact);
  parentPort.postMessage({
    msg: "finished getUsersWithContact",
    usersWithContact,
  });
  //Append list to the second_contacts list of the loggedIn User
  user.second_contacts.push(usersWithContact);
  let savedUser = await user.save();
  //mark the document status as completed
  parentPort.postMessage({ status: "Completed", savedUser });
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
      return el.hasContact == true && el._id != req.user.id;
    });
    return usersWithContact;
  } catch (err) {
    console.error(`error in worker thread: ${err.message}`);
    throw new Error(err.message);
  }
}
