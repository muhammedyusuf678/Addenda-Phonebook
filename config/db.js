const mongoose = require("mongoose");
const config = require("config");
// const db = config.get("mongoURI");

const connectDB = async (msg) => {
  try {
    const dbConnection = mongoose.connect(
      "mongodb://localhost:27017/phonebook",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    mongoose.connection.on("connected", function () {
      console.log(msg);
      console.log(
        "Mongoose connected to " + "mongodb://localhost:27017/phonebook"
      );
    });
    mongoose.connection.on("error", function (err) {
      console.log(msg);
      console.log("Mongoose connection error: " + err);
    });
    mongoose.connection.on("disconnected", function () {
      console.log("Mongoose disconnected");
    });
    return dbConnection;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const closeDB = async (db, msg) => {
  db.connection.close(function () {
    console.log(msg + " disconnecting mongodb");
  });
};

module.exports = { connectDB, closeDB };
