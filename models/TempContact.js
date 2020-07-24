const mongoose = require("mongoose");

const ContactSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["In Progress", "Completed"], //can be anyone
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);
