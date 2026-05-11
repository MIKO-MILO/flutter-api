const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("../routes/auth"));
app.use("/api", require("../routes/post"));

module.exports = app;