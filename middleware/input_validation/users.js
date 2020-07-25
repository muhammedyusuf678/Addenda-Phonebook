const { check } = require("express-validator");

module.exports.validate = (method) => {
  switch (method) {
    case "loginUser": {
      return [
        check("email", "Please enter a valid email").trim().isEmail(),
        check("password", "Password is required").exists(),
      ];
    }
    case "registerUser": {
      return [
        check("name", "Please enter a valid name (only letters)")
          .not()
          .isEmpty(),
        check("email", "Please enter a valid email").trim().isEmail(),
        check(
          "password",
          "Please enter a password with 6 or more characters"
        ).isLength({ min: 6 }),
      ];
    }
  }
};
