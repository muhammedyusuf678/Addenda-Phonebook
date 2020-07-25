const jwt = require("jsonwebtoken");
const config = require("config");

//decodes JWT token and puts decoded data into request
module.exports = function (req, res, next) {
  //get token sent by client from header.
  const token = req.header("x-auth-token");

  //check if token exists
  if (!token) {
    //unauthorized
    return res.status(401).json({ msg: "No token. Authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    //jwt payload is put into decoded once verified
    req.user = decoded.user;
    next();
  } catch (err) {
    //Unauthorized status code
    res
      .status(401)
      .json({ msg: "Token is not a valid jwt token. cannot be decrypted" });
  }
};
