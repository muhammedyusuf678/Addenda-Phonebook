const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const authMiddleware = require("../middleware/auth");
const userValidator = require("../middleware/input_validation/users");

const User = require("../models/User");

//get the currently logged in user from the jwt token data
router.get("/", authMiddleware, async (req, res) => {
  //user document retrieved from database and added to req by authMiddleware

  //serialize to json and send response
  res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
    error: false,
  });
});

//login user and get jwt token
router.post("/", userValidator.validate("loginUser"), async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: true, message: "Incorrect Email" });
    }
    //compare password to hashed password from db
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: true, message: "Incorrect Password" });
    }

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
