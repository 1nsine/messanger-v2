const express = require("express");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const path = require("path");
const fs = require("fs");
const https = require("https");

// Читаем SSL сертификаты
const privateKey = fs.readFileSync(
  path.join(__dirname, "certs/server.key"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "certs/server.crt"),
  "utf8"
);

const credentials = { key: privateKey, cert: certificate };

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Разрешаем CORS только для фронтенда
app.use(
  cors({
    origin: "https://192.168.0.165:5173",
    credentials: true,
  })
);

// Сессии
app.use(
  session({
    secret: "super_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ error: "Server error", details: err.message });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", authRoutes);
app.use("/user", require("./routes/user"));
app.use("/posts", require("./routes/posts"));

// Создаём HTTPS сервер
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(5000, () => {
  console.log("HTTPS Server running on https://localhost:5000");
});
