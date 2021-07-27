// we'll use express, mongoose, dotenv, helmet, morgan
// dotenv for secure data saving in .env file. after
// using it we'll learn more about it.
// helmet used to make request and secure request to
// server.
// morgan is request login middleware. which req made,
// how long it took etc.

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}, () => {
  console.log("MongoDB is connected");
});


// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);


// listen
app.listen(8000, () => {
  console.log("Server is up and running");
});

// dLzxEJ7gLT15uqQY