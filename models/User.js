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
      ref: "User", //as per specification in the task email. Protected fields like second_contact's password and contacts are removed in backend
      required: true,
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
