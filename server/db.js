const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Абсолютный путь к файлу базы (можно хранить вне папки сервера)
const dbPath = path.join(__dirname, "/database.db");

// Создание или открытие базы
const db = new Database(dbPath);

// Абсолютный путь к файлу схемы
const schemaPath = path.join(__dirname, "schema.sql");

// Чтение и выполнение схемы (если нужно)
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

console.log("SQLite база подключена:", dbPath);

module.exports = db;
