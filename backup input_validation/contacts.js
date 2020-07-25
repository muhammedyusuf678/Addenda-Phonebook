const { check } = require("express-validator");

module.exports.validate = (method) => {
  switch (method) {
    case "getContacts": {
      return [
        check("contactsPage", "Please enter a valid integer for page number")
          .isInt()
          .toInt()
          .optional(),

        check(
          "second_contactsPage",
          "Please enter a valid integer for page number"
        )
          .isInt()
          .toInt(),

        check("contactsLimit", "Please enter a valid integer for page limt")
          .isInt()
          .toInt(),

        check(
          "second_contactsLimit",
          "Please enter a valid integer for page limt"
        )
          .isInt()
          .toInt(),
      ];
    }
    case "createContact": {
      return [
        check("name", "Please enter a valid name (only letters)")
          .trim()
          .not()
          .isEmpty(),
        check("email", "Please enter a valid email")
          .trim()
          .isEmail()
          .normalizeEmail(),
      ];
    }
  }
};
