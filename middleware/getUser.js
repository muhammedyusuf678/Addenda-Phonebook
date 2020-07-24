const jwt = require("jsonwebtoken");
const config = require("config");

//only for protected routes
module.exports = function (req, res, next) {
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    //jwt payload is put into decoded once verified
    req.user = decoded.user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ msg: "token is not a valid jwt token .. cannot be decrypted" });
  }
};
