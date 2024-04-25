const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//CONNECTING DB
const db = require('./db');

// IMPORT ROUTE FILE
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//USE ROUTES
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

const port= process.env.PORT || 3000
app.listen(port, () => console.log("Server is Running on port 3000"));