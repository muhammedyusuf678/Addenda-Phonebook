{
  $project: {
    list: {
      $filter: {
        input: "$contacts",
        as: "contactsArr",
        cond: {
          $in: [
            mongoose.Types.ObjectId(req.query.contactid),
            "$contacts",
          ],
        },
      },
    },
  },
},

      // const user = await User.findById(req.user.id)
      //   .select("-password")
      //   .populate("contacts")
      //   .populate(
      //     "second_contacts",
      //     "-password -contacts -second_contacts -__v"
      //   )
      //   .slice("contacts", sliceArr);

check("name", "Please enter a valid name (only letters)").trim()
        .not()
        .isEmpty()
        .bail()
        .custom((value) => {
          if (value.trim() == "") {
            throw new Error("Please enter a non-blank name");
          }
          return true;
        }),


        if (contact) {
          console.log(
            "This contact exists in database. Add reference to current user"
          );
          //user already has a contact with this unique email
          if (user.contacts.includes(contact._id)) {
            return res.status(200).json({
              message: "Contact with this email already exists",
              contact,
            });
          }
          user.contacts.push(contact);
          user = await user.save();
        } else {
        }