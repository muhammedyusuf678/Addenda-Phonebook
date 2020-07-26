"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const TempContact = require("../models/TempContact");

const { connectDB, closeDB } = require("../config/db");

const { parentPort, workerData } = require("worker_threads");
const threadId = require("worker_threads").threadId;

//create database connection for this thread
connectDB(`Worker Thread ${threadId}`);

// Main thread will send message to tell worker thread running in pool to perform its task
parentPort.on("message", async (message) => {
  if (message == "terminate") {
    console.log(
      `Worker Thread ${threadId}: Terminating and Closing connections`
    );
    //close threads database connection
    await closeDB(mongoose);
    process.exit(0);
  }
  // Pick up a temp contact with status Not Started and mark as In progress
  const tempContact = await getATempContact();
  //If a temp contract task is not available
  if (tempContact == null) {
    // return message to main thread
    parentPort.postMessage({
      msg: "Could not find any unstarted task",
      payload: [],
    });
  } else {
    //Perform task
    const secondContactsAdded = await workerTask(tempContact);
    //serialize and send result to main thread
    parentPort.postMessage({
      msg: "Temp Contact Processed and Second Contacts Added sucessfully",
      payload: JSON.stringify(secondContactsAdded),
    });
  }
});

async function workerTask(tempContact) {
  //Fetch the list of the users who already have this tempContact in their contacts
  let usersWithContact = await getUsersWithContact(tempContact);
  //keep track of which second contacts are actually added (not already there)
  let secondContactsAdded = new Array();
  //Append list to the second_contacts list for the specified user
  usersWithContact.forEach((element) => {
    //add to second contacts only if user not already there (for ex: by another mutual contact)
    if (!tempContact.user.second_contacts.includes(element._id)) {
      tempContact.user.second_contacts.push(element._id);
      secondContactsAdded.push({
        _id: element._id,
        name: element.name,
        email: element.email,
      });
    }
  });
  //save the updated user document
  let savedUser = await tempContact.user.save();
  //mark the tempContact status as completed
  tempContact.status = "Completed";
  await tempContact.save();

  return secondContactsAdded;
}

async function getATempContact() {
  try {
    //find a tempContact with status Not Started and update it to In Progress
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
    console.error(
      `Worker Thread ${threadId} in getATempContact:` + err.message
    );
    throw new Error(
      `Worker Thread ${threadId}: Error in retrieving temp contact to process from database`
    );
  }
}

async function getUsersWithContact(tempContact) {
  try {
    //Use aggregate query search all users and see if they already have the contact
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

    //Filter out the other users who already have the contact
    const usersWithContact = aggregateResult.filter(function (el) {
      return el.hasContact == true && !el._id.equals(tempContact.user._id);
    });
    return usersWithContact;
  } catch (err) {
    console.error(
      `Worker Thread ${threadId} in getUsersWithContact:` + err.message
    );
    throw new Error(
      `Worker Thread ${threadId}: Error in getting list of users with temp contact`
    );
  }
}
