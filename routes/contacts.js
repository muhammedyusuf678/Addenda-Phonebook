const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const authMiddleware = require("../middleware/auth");

const mongoose = require("mongoose");
const User = require("../models/User");
const Contact = require("../models/Contact");

//Get all of logged in users contacts.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("contacts");
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
      user.contacts.push(contactToSave);
      user = await user.save();

      res
        .status(200)
        .json({ message: "Contacted Added Successfully", contactToSave });
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
  const contact_id = mongoose.Types.ObjectId(req.query.contactid);
  try {
    const aggregateResult = await User.aggregate([
      {
        $project: {
          name: "$name",
          email: "$email",
          hasContact: {
            $in: [contact_id, "$contacts"],
          },
        },
      },
    ]);

    //filter out the other users who have the same contact
    const usersWithContact = aggregateResult.filter(function (el) {
      return el.hasContact == true && el._id != req.user.id;
    });
    // console.log(aggregateResult);
    res.json(usersWithContact);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ msg: "Server Error in retrieving contacts from database" });
  }
});

//Update Contact
// router.put("/:id", authMiddleware, async (req, res) => {
//   const { name, email, phone, type } = req.body;

//   //Build a contact object with whichever fields were changed
//   const contactFields = {};
//   if (name) contactFields.name = name;
//   if (email) contactFields.email = email;
//   if (phone) contactFields.phone = phone;
//   if (type) contactFields.type = type;

//   try {
//     //find contact you want to update
//     let contact = await Contact.findById(req.params.id);
//     if (!contact) {
//       return res.status(404).json({ msg: "Contact not found" });
//     }

//     //Make sure user owns contact (no hack by postman or curl http client)
//     //contact.user is mongo object not string
//     if (contact.user.toString() !== req.user.id) {
//       return res.status(401).json({ msg: "Not Authorized" });
//     }

//     contact = await Contact.findByIdAndUpdate(
//       req.params.id,
//       { $set: contactFields },
//       { new: true }
//     ); //if contact doesnt exist, create it
//     res.json(contact);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Message");
//   }
// });

//Delete Contact
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     //find contact you want to update
//     let contact = await Contact.findById(req.params.id);
//     if (!contact) {
//       return res.status(404).json({ msg: "Contact not found" });
//     }

//     //Make sure user owns contact (no hack by postman or curl http client)
//     //contact.user is mongo object not string
//     if (contact.user.toString() !== req.user.id) {
//       return res.status(401).json({ msg: "Not Authorized" });
//     }

//     await Contact.findByIdAndRemove(req.params.id);
//     res.json({ msg: "Contact Removed" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Message");
//   }
// });

module.exports = router;
