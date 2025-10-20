const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

// POST /api/books - create listing
router.post("/", auth, upload.array("images", 4), async (req, res) => {
  try {
    console.log("[BOOKS] /api/books POST - user:", req.user && req.user.id);
    console.log("[BOOKS] body:", req.body);
    console.log("[BOOKS] files:", (req.files || []).map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size, filename: f.filename })));

    const { title, author, subject, edition, condition, price, isDonation } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const imagePaths = (req.files || []).map(f => "/uploads/" + f.filename);

    const book = new Book({
      owner: req.user.id,
      title,
      author,
      subject,
      edition,
      condition,
      price: (isDonation === "true" || isDonation === true) ? 0 : Number(price || 0),
      isDonation: (isDonation === "true" || isDonation === true),
      images: imagePaths
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error("[BOOKS] POST error:", err);
    // Let centralized error handler format and send response
    next(err);
  }
});