const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, Date.now() + "-" + Math.random().toString(36).slice(2) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file || !file.mimetype) return cb(new Error("Invalid file"), false);
  if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"), false);
  cb(null, true);
};

const limits = { fileSize: 5 * 1024 * 1024 };

module.exports = multer({ storage, fileFilter, limits });