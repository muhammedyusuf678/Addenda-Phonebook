const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");
const userValidator = require("../middleware/input_validation/users");

//register a user
router.post("/", userValidator.validate("registerUser"), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //check if there is an existing user with same email
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }
    user = new User({
      name,
      email,
      password,
      contacts: [],
      second_contacts: [],
    });
    //hash the password and store hashed password in user document
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };
    //create JWT token with user id
    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, error: false });
      }
    );
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: true, message: `Server Error: ${err.message}` });
  }
});

module.exports = router;
