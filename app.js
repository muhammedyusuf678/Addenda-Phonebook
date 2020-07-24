const express = require("express");
const connectDB = require("./config/db");
const app = express();

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

//Define routes
app.use("/contacts", require("./routes/contacts"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));

app.get("/", async (req, res) => {
  res.json("Hello");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
