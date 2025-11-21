const Database = require("better-sqlite3");
const db = new Database("database.db");

const fs = require("fs");
const schema = fs.readFileSync(__dirname + "/schema.sql", "utf8");

db.exec(schema);

module.exports = db;
