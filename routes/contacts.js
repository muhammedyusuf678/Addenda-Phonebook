const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { Worker } = require("worker_threads");
const authMiddleware = require("../middleware/auth");

const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const TempContact = require("../models/TempContact");

//Get all of logged in users contacts.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("contacts")
      .populate("second_contacts", "-password -contacts -second_contacts -__v");
    res.json({
      contacts: user.contacts,
      second_contacts: user.second_contacts,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ msg: "Server Error in retrieving contacts from database" });
  }
});

//Create Contact for currently logged in user
router.post(
  "/",
  [
    authMiddleware,
    [
      check("name", "Please enter a valid name (only letters)")
        .trim()
        .not()
        .isEmpty(),
      check("email", "Please enter a valid email").isEmail().normalizeEmail(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //bad request
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email } = req.body;
    try {
      let user = await User.findById(req.user.id).select("-password");
      //check if there is an existing contact document with same email
      let contact = await Contact.findOne({ email });
      let contactToSave;
      //if contact does not already exist in database
      if (!contact) {
        console.log(
          "This contact does not exist in database. Create new contact document and add reference to user"
        );
        //create new contact
        const newContact = new Contact({
          name,
          email,
        });
        contactToSave = await newContact.save();
      } else {
        console.log(
          "This contact exists in database. Add reference to current user"
        );
        //check if user already has a contact with this unique email
        if (user.contacts.includes(contact._id)) {
          return res.status(200).json({
            message: "Contact with this email already exists",
            contact,
          });
        }
        //save reference to existing contact document
        contactToSave = contact;
      }
      //save contact to user
      user.contacts.push(contactToSave);
      user = await user.save();

      //create temp contact
      const newTempContact = new TempContact({
        contact: contactToSave,
        user,
        status: "Not Started",
      });
      const savedTempContact = await newTempContact.save();

      res.status(200).json({
        message: "Contacted Added Successfully",
        savedContact: contactToSave,
        savedTempContact,
      });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .send("Server Error in creating contact and saving to database");
    }
  }
);

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

module.exports = router;
