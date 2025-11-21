const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = db
      .prepare("SELECT * FROM users WHERE email = ? OR username = ?")
      .get(email, username);

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.prepare(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    ).run(username, email, hash);

    return res.json({ message: "Registered successfully" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };

  res.json({ message: "Logged in", user: req.session.user });
});

// ME
router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
