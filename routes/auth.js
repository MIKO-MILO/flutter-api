const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const supabase = require("../config/supabase");
const auth = require("../middleware/auth");

router.get("/user", auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      status: 200,
      id: user.id,
      name: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Field tidak lengkap" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: name,
          email,
          password: hashedPassword,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    const token = jwt.sign(
      { id: data[0].id, email: data[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      status: 200,
      access_token: token,
      token_type: "Bearer",
      id: data[0].id,
      name: data[0].username,
      email: data[0].email,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      status: 200,
      access_token: token,
      token_type: "Bearer",
      id: user.id,
      name: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
