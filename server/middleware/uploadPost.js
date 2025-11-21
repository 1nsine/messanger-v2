const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Папка для загрузки
const uploadDir = path.join(__dirname, "..", "uploads", "posts");

// Создание папки, если нет
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Конфиг хранения
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  // Уникальное имя файла
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    cb(null, base + "-" + unique + ext);
  },
});

// Фильтрация файлов (только изображения/видео)
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "video/mp4",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Недопустимый тип файла"), false);
  }

  cb(null, true);
};

const uploadPost = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

module.exports = uploadPost;
