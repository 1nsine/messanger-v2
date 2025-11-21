const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// загрузка аватара
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/uploads/avatars")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post("/update", upload.single("avatar"), (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const userId = req.session.user.id;
    const { firstName, lastName, phone, email } = req.body;

    let avatarPath = req.session.user.avatar;

    if (req.file) {
      avatarPath = "/uploads/avatars/" + req.file.filename;
    }

    const stmt = db.prepare(`
      UPDATE users
      SET firstName = ?, lastName = ?, phone = ?, email = ?, avatar = ?
      WHERE id = ?
    `);

    stmt.run(firstName, lastName, phone, email, avatarPath, userId);

    // обновляем сессию
    req.session.user = {
      ...req.session.user,
      firstName,
      lastName,
      phone,
      email,
      avatar: avatarPath,
    };

    res.json({
      message: "Данные обновлены",
      user: req.session.user,
    });
  } catch (err) {
    console.log("Ошибка обновления профиля:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
