const mongoose = require("mongoose");
require('dotenv').config();

//DEFINED THE MONGODB CONNECTION URL
// const mongoURL = "mongodb://localhost:27017/voting";
const mongoURL = process.env.MONGODB_URL;

//SETTING UP MONOGODB CONNECTION
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//GETTING THE DEFAULT CONNECTION
const db = mongoose.connection;

//DEFINIG EVENT LISTENERS FOR DATABASE CONNECTION
db.on("connected", () => console.log("Connected to MongoDB server"));

db.on("disconnected", () => console.log("Disconnected from MongoDB server"));

db.on("error", (error) =>
  console.log("MongoDB server connection error: ", error)
);


module.exports = db;