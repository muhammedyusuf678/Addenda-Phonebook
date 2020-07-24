"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { connectDB, closeDB } = require("./config/db");
//Connect Database
connectDB("Testing File");

const User = require("./models/User");
const Contact = require("./models/Contact");
const TempContact = require("./models/TempContact");

async function clearDB() {
  try {
    await User.remove({});
    await Contact.remove({});
    await TempContact.remove({});
    console.log("DB cleared");
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}

async function seedDB() {
  let tempUser;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("testpassword", salt);
  for (var i = 1; i <= 5; i++) {
    tempUser = new User({
      name: `user${i}`,
      email: `user${i}@gmail.com`,
      password: password,
    });
    await tempUser.save();
    console.log(`created user${i}`);
  }
}

async function main() {
  await clearDB();
  await seedDB();
}

main();
