const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");
const connectDB = async (source) => {
  try {
    //connect to database
    mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    mongoose.connection.on("connected", function () {
      console.log(source + ": Mongoose connected to " + db);
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

const closeDB = async (mon) => {
  //close database connection
  await mon.connection.close();
};

module.exports = { connectDB, closeDB };
