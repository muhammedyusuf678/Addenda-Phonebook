const { check, validationResult } = require("express-validator");

module.exports.validate = (method) => {
  switch (method) {
    case "loginUser": {
      return async (req, res, next) => {
        await check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          //sanitize
          .normalizeEmail()
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
          .bail()
          .custom((value) => {
            //regular expression for full name. First name mandatory, last name with 1 space optional. No numbers or special characters allowed
            if (/^[a-zA-Z]{1,}(?: [a-zA-Z]+)$/.test(value)) {
              return true;
            } else
              throw new Error(
                "Please enter a valid name with no numbers or special characters. Max 1 whitespace in between first name and last name (optional)"
              );
          })
          .run(req);
        await check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          //sanitize
          .normalizeEmail()
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
