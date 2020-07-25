const { check, validationResult } = require("express-validator");

module.exports.validate = (method) => {
  switch (method) {
    case "loginUser": {
      return async (req, res, next) => {
        await check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          .run(req);
        await check("password", "Password is required").exists().run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          //bad request
          return res.status(400).json({ errors: errors.array() });
        }

        next();
      };
    }
    case "registerUser": {
      return async (req, res, next) => {
        await check("name", "Please enter a valid name (only letters)")
          .not()
          .isEmpty()
          .run(req);
        await check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          .run(req);
        await check(
          "password",
          "Please enter a password with 6 or more characters"
        )
          .isLength({ min: 6 })
          .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          //bad request
          return res.status(400).json({ errors: errors.array() });
        }

        next();
      };
    }
  }
};
