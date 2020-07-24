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
