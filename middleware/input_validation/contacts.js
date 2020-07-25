const { check, validationResult } = require("express-validator");

module.exports.validate = (method) => {
  switch (method) {
    case "getContacts": {
      return async (req, res, next) => {
        //check if present in query. All the below params are OPTIONAL
        if (req.query.contactsPage) {
          await check(
            "contactsPage",
            "Please enter a valid integer for page number"
          )
            .isInt()
            .toInt()
            .run(req);
        } else {
          req.query.contactsPage = 1; //set default value
        }

        if (req.query.contactsLimit) {
          await check(
            "contactsLimit",
            "Please enter a valid integer for page limit"
          )
            .isInt()
            .toInt()
            .run(req);
        } else {
          req.query.contactsLimit = 5; //set default value
        }

        if (req.query.second_contactsPage) {
          await check(
            "second_contactsPage",
            "Please enter a valid integer for page number"
          )
            .isInt()
            .toInt()
            .run(req);
        } else {
          req.query.second_contactsPage = 1; //set default value
        }

        if (req.query.second_contactsLimit) {
          await check(
            "second_contactsLimit",
            "Please enter a valid integer for page limt"
          )
            .isInt()
            .toInt()
            .run(req);
        } else {
          req.query.second_contactsLimit = 5; //set default value
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          //bad request
          return res.status(400).json({ errors: errors.array() });
        }

        next();
      };
    }
    case "createContact": {
      return async (req, res, next) => {
        await check("name", "Please enter a valid name (only letters)")
          .trim()
          .not()
          .isEmpty()
          .run(req);
        await check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          .normalizeEmail()
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
