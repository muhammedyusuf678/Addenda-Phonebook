//get all other users who have the same contact
router.get("/test", authMiddleware, async (req, res) => {
  const contact_id = mongoose.Types.ObjectId(req.query.contactid);
  try {
    const aggregateResult = await User.aggregate([
      {
        $project: {
          name: "$name",
          email: "$email",
          hasContact: {
            $in: [contact_id, "$contacts"],
          },
        },
      },
    ]);

    //filter out the other users who have the same contact
    const usersWithContact = aggregateResult.filter(function (el) {
      return el.hasContact == true && el._id != req.user.id;
    });
    // console.log(aggregateResult);
    res.json(usersWithContact);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ msg: "Server Error in retrieving contacts from database" });
  }
});



try {
  const aggregateResult = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.user.id) } },
    {
      $project: {
        // contactsCount: { $size: "$contacts" },
        // second_contactsCount: { $size: "$second_contacts" },
        contacts: {
          $slice: ["$contacts", contactsSkip, contactsLimit],
        },
        second_contacts: {
          $slice: [
            "$second_contacts",
            second_contactsSkip,
            second_contactsLimit,
          ],
        },
      },
    },
  ]);

  //populate result of aggregate
  await Contact.populate(aggregateResult, {
    path: "contacts",
  });
  await User.populate(aggregateResult, {
    path: "second_contacts",
    select: "-password -contacts -second_contacts",
  });

  //there will always be only one item in aggregateResult as mongo ID is unique
  const result = aggregateResult[0];

  const contactsTotalPages = Math.ceil(
    result.contactsCount / contactsLimit
  );
  const second_contactsTotalPages = Math.ceil(
    result.second_contactsCount / second_contactsLimit
  );
  console.log("RESULT:");
  console.log(result);
  res.json({
    contacts: result.contacts,
    second_contacts: result.second_contacts,
    contactsPagination: {
      currentPage: contactsPage,
      limit: contactsLimit,
      totalPages: contactsTotalPages,
    },
    second_contactsPagination: {
      currentPage: second_contactsPage,
      limit: second_contactsLimit,
      totalPages: second_contactsTotalPages,
    },
  });
