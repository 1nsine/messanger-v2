const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated } = require("../middlewares/auth");

// Отправка запроса на дружбу
router.post("/request", isAuthenticated, (req, res) => {
  const { friendId } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO friends (user_id, friend_id) VALUES (?, ?)
    `);
    stmt.run(req.session.user.id, friendId);
    res.json({ message: "Запрос отправлен" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Принятие запроса
router.post("/accept", isAuthenticated, (req, res) => {
  const { friendId } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE friends SET status = 'accepted'
      WHERE user_id = ? AND friend_id = ?
    `);
    stmt.run(friendId, req.session.user.id);
    res.json({ message: "Запрос принят" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Список друзей
router.get("/", isAuthenticated, (req, res) => {
  const friends = db
    .prepare(
      `
      SELECT u.id, u.firstName, u.lastName, u.avatar
      FROM friends f
      JOIN users u ON 
        (u.id = f.user_id OR u.id = f.friend_id) AND u.id != ?
      WHERE (f.user_id = ? OR f.friend_id = ?) AND status = 'accepted'
    `
    )
    .all(req.session.user.id, req.session.user.id, req.session.user.id);
  res.json({ friends });
});

module.exports = router;
