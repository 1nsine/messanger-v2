const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const upload = require("../middleware/uploadAvatar");

// REGISTER
router.post("/register", (req, res) => {
  try {
    const { phone, firstName, lastName, email, password } = req.body;
    console.log(req.body);

    // Проверка обязательных полей
    if (!phone || !firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: "Все поля обязательны для заполнения" });
    }

    // Проверка существующего email
    const existingEmail = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    // Получаем последний username
    const last = db
      .prepare(
        "SELECT username FROM users WHERE username LIKE 'id%' ORDER BY id DESC LIMIT 1"
      )
      .get();

    let nextNumber = 99999; // стартовое значение

    if (last) {
      const num = parseInt(last.username.replace("id", ""), 10);
      nextNumber = num + 1;
    }

    const username = `id${nextNumber}`;

    // Хешируем пароль
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Создаём пользователя
    const stmt = db.prepare(`
      INSERT INTO users (phone, firstName, lastName, username, email, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      phone,
      firstName,
      lastName,
      username,
      email,
      hashedPassword
    );

    const userId = result.lastInsertRowid;

    // Устанавливаем сессию
    req.session.user = {
      id: userId,
      username,
      phone,
      firstName,
      lastName,
      email,
    };

    return res.status(201).json({
      message: "Регистрация успешна",
      username,
      id: userId,
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  console.log(req.body); // login — это либо email, либо phone
  if (!login || !password) {
    return res.status(400).json({ message: "Все поля обязательны!" });
  }

  // Ищем пользователя по email или phone
  const user = db
    .prepare("SELECT * FROM users WHERE email = ? OR phone = ?")
    .get(login, login);

  if (!user)
    return res.status(400).json({ message: "Неверный логин или пароль" });

  const match = await bcrypt.compare(password, user.password);

  console.log(match);
  if (!match)
    return res.status(400).json({ message: "Неверный логин или пароль" });

  // Устанавливаем сессию
  console.log(user);
  req.session.user = user;

  res.json({
    message: "Успешная авторизация! Вы будете перенаправлены на главную",
    redirect: "/", // клиент может использовать для навигации
  });
});

// Получение данных текущего пользователя
router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ user: null });
  res.json({ user: req.session.user });
});

router.post("/update-password", (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: "Не авторизован" });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: "Оба поля обязательны" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    // Проверка старого пароля
    const match = bcrypt.compareSync(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: "Старый пароль неверен" });

    // Хешируем новый пароль
    const hashed = bcrypt.hashSync(newPassword, 10);

    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
      hashed,
      userId
    );

    res.json({ message: "Пароль успешно обновлён" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
