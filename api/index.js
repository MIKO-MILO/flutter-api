const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware Debugging: Log setiap request yang masuk
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Route Debugging: Cek koneksi API
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "API KONEK BERHASIL!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/auth", require("../routes/auth"));
app.use("/api", require("../routes/post"));

module.exports = app;
