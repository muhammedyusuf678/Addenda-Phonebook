const mongoose = require("mongoose");

const TempContactSchema = mongoose.Schema({
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Not Started", "In Progress", "Completed"], //can be anyone of these
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("TempContact", TempContactSchema);
