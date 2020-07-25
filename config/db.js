const mongoose = require("mongoose");
const config = require("config");
// const db = config.get("mongoURI");

const connectDB = async (source) => {
  try {
    mongoose.connect("mongodb://localhost:27017/phonebook", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    mongoose.connection.on("connected", function () {
      console.log(
        source +
          ": Mongoose connected to " +
          "mongodb://localhost:27017/phonebook"
      );
    });
    mongoose.connection.on("error", function (err) {
      console.log(source + ": Mongoose connection error: " + err);
    });
    mongoose.connection.on("disconnected", function () {
      console.log(source + ": Mongoose disconnected");
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const closeDB = async (db) => {
  db.connection.close(function () {});
};

module.exports = { connectDB, closeDB };
