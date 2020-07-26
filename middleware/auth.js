const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

//decodes JWT token and puts decoded data into request
module.exports = async function (req, res, next) {
  //get token sent by client from header.
  const token = req.header("x-auth-token");

  //check if token exists
  if (!token) {
    //unauthorized
    return res
      .status(401)
      .json({ error: true, message: "No token. Authorization denied" });
  }

  try {
    //jwt payload is put into decoded once verified
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const user = await User.findById(decoded.user.id).select("-password -__v"); //remove unwanted fields
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    //Bad request status code
    res.status(400).json({
      error: true,
      message:
        "Token is not a valid jwt token and cannot be decryped. Or user with id decoded does not exist",
    });
  }
};
