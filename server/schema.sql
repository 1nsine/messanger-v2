CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  avatar TEXT DEFAULT '/uploads/default.png',
  firstName TEXT,
  lastName TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
