"use strict";
const path = require("path");
// const mongoose = require("mongoose");

// const { connectDB, closeDB } = require("./config/db");
// //Connect Database
// connectDB("Testing File:");

// const Contact = require("./models/Contact");

// const contactEventEmitter = Contact.watch();

// contactEventEmitter.on("change", (change) =>
//   console.log(JSON.stringify(change))
// );

// const contact = new Contact({ name: "Thabo", email: "thabo@gmail.com" });
// contact.save();

console.log(__dirname + "/worker.js");
console.log(path.join(__dirname, "./sorter.js"));
