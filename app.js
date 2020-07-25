const express = require("express");
const { connectDB, closeDB } = require("./config/db");
const app = express();

//Connect Database
connectDB("Main Thread");

//Init Middleware
app.use(express.json({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

//Define routes
app.use("/contacts", require("./routes/contacts"));
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));

// app.get("*", function (req, res) {});

app.use(function (req, res) {
  res.status(404).json({
    error: "Endpoint not found (404)",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
