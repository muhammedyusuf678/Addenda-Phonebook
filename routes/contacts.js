const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const contactValidator = require("../middleware/input_validation/contacts");

const { workerPool, numOfThreads } = require("../lib/worker-thread-pool");

const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");
const TempContact = require("../models/TempContact");

//Get all contacts of logged in user.
router.get(
  "/",
  [contactValidator.validate("getContacts"), authMiddleware],
  async (req, res) => {
    const {
      contactsPage,
      second_contactsPage,
      contactsLimit,
      second_contactsLimit,
    } = req.query;
    //calulate number of records to skip based on page number and limit
    const contactsSkip = (contactsPage - 1) * contactsLimit;
    const second_contactsSkip =
      (second_contactsPage - 1) * second_contactsLimit;

    try {
      //use aggregate query to get total number of contacts and second_contacts for user
      const aggregateResult = await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(req.user._id) } },
        {
          $project: {
            contactsCount: { $size: "$contacts" },
            second_contactsCount: { $size: "$second_contacts" },
          },
        },
      ]);
      //get user document and populate only the fields included in pagination
      const result = await User.findById(req.user._id)
        .populate({
          path: "contacts",
          select: "-__v" /*remove unwanted fields */,
          model: "Contact",
          options: {
            sort: { name: 1 },
            skip: contactsSkip,
            limit: contactsLimit,
          },
        })
        .populate({
          path: "second_contacts",
          select:
            "-password -contacts -second_contacts -__v" /*remove unwanted fields from second_contact */,
          model: "User",
          options: {
            sort: { name: 1 },
            skip: second_contactsSkip,
            limit: second_contactsLimit,
          },
        });
      //check if user with this id (decoded from JWT) does not exist
      if (!result) {
        //bad request
        return res.status(400).json({
          error: true,
          message: "User with ID decoded from JWT does not exist",
        });
      }

      //calculate totalNumber of pages possible
      const contactsTotalPages = Math.ceil(
        aggregateResult[0].contactsCount / contactsLimit
      );
      const second_contactsTotalPages = Math.ceil(
        aggregateResult[0].second_contactsCount / second_contactsLimit
      );

      //serialize response to JSON and send
      res.status(200).json({
        contacts: result.contacts,
        second_contacts: result.second_contacts,
        contactsPagination: {
          currentPage: contactsPage,
          limit: contactsLimit,
          totalPages: contactsTotalPages,
        },
        second_contactsPagination: {
          currentPage: second_contactsPage,
          limit: second_contactsLimit,
          totalPages: second_contactsTotalPages,
        },
        error: false,
      });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ msg: "Server Error in retrieving contacts from database" });
    }
  }
);

//Create Contact for currently logged in user
router.post(
  "/",
  [contactValidator.validate("createContact"), authMiddleware],
  async (req, res) => {
    const { name, email } = req.body;
    try {
      let user = req.user; //retrieved from database in authMiddleware
      //check if user with this id (decoded from JWT) does not exist
      if (!user) {
        //bad request
        return res.status(400).json({
          error: true,
          message: "User with ID decoded from JWT does not exist",
        });
      }
      //check if there is an existing contact document with same email
      let contact = await Contact.findOne({ email }).select("-__v");
      let contactToSave;
      //if contact does not already exist in database
      if (!contact) {
        console.log(
          "This contact does not exist in database. Creating new contact document and adding reference to user"
        );
        //create new contact
        const newContact = new Contact({
          name,
          email,
        });
        contactToSave = await newContact.save();
      } else {
        console.log(
          "This contact exists in database. Adding reference to user"
        );
        //check if user already has a contact with this unique email. So no duplicates
        if (user.contacts.includes(contact._id)) {
          return res.status(200).json({
            message: "Contact with this email already exists for this user",
            error: false,
            contact,
          });
        }
        contactToSave = contact;
      }
      //add reference contact document to user
      user.contacts.push(contactToSave);
      user = await user.save();

      //create temp contact
      const newTempContact = new TempContact({
        contact: contactToSave,
        user,
        status: "Not Started",
      });
      //add temp contact to TempContact Collection
      const savedTempContact = await newTempContact.save();

      //This call will choose one idle worker in the pool to execute worker task
      //Defined in /lib
      console.log(
        "acquiring worker thread from pool to handle temp contact processing"
      );
      const resultFromWorker = await workerPool.exec();
      console.log("Result from worker");
      console.log(resultFromWorker);

      //serialize response with message, saved contact and new second_contacts added (returned by worker thread)
      res.status(201).json({
        message: "Contact and associated second contacts added successfully",
        error: false,
        savedContact: contactToSave,
        second_contactsAdded: JSON.parse(resultFromWorker.payload),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        message: "Server Error in creating contact and saving to database",
        error: true,
      });
    }
  }
);

process.on("SIGTERM", onServerShutdown);
process.on("SIGINT", onServerShutdown);

async function onServerShutdown() {
  try {
    for (let i = 0; i < numOfThreads; i++) {
      workerPool.exec("terminate");
    }
    workerPool.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(0);
  }
}

module.exports = router;
