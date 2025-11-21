const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

// Настройка multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/posts");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", (req, res) => {
  try {
    const posts = db
      .prepare(
        `SELECT posts.*, users.username
         FROM posts
         JOIN users ON posts.user_id = users.id
         ORDER BY posts.created_at DESC`
      )
      .all();

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создание поста
router.post("/create", upload.single("image"), (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: "Не авторизован" });

    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ error: "Текст обязателен" });

    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/posts/" + req.file.filename;
    }

    db.prepare("INSERT INTO posts (user_id, text, image) VALUES (?, ?, ?)").run(
      userId,
      text.trim(),
      imagePath
    );

    res.json({ message: "Пост создан" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
