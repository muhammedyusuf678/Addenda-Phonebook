const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
  ],
  second_contacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //as per requirement in the task email
      required: true,
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
