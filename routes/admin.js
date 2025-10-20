const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const User = require("../models/User");
const Book = require("../models/Book");
const Request = require("../models/Request");
const bcrypt = require("bcryptjs");

// GET /api/admin/admins - list admins
router.get("/admins", auth, requireAdmin, async (req, res) => {
  const admins = await User.find({ role: "admin" }).select("-password");
  res.json(admins);
});

// POST /api/admin/admins - add admin (admin only)
router.post("/admins", auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email exists" });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password || "admin123", salt);
    const admin = new User({ name, email, phone, password: hashed, role: "admin", isPrimaryAdmin: false });
    await admin.save();
    res.status(201).json({ message: "Admin added" });
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/admins/:id - remove admin
router.delete("/admins/:id", auth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (id === req.user.id) return res.status(400).json({ message: "Cannot remove yourself" });

    // Ensure the requester is the primary admin
    const requester = req.currentUser || await User.findById(req.user.id);
    if (!requester || !requester.isPrimaryAdmin) {
      return res.status(403).json({ message: "Only the primary admin can remove admins" });
    }

    const u = await User.findById(id);
    if (!u || u.role !== "admin") return res.status(404).json({ message: "Admin not found" });
    // prevent deleting the primary admin
    if (u.isPrimaryAdmin) return res.status(400).json({ message: "Cannot remove the primary admin" });

    await User.findByIdAndDelete(id);
    res.json({ message: "Admin removed" });
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/books - list all books (admin)
router.get("/books", auth, requireAdmin, async (req, res) => {
  const books = await Book.find().populate("owner", "name email");
  res.json(books);
});

// DELETE /api/admin/books/:id - delete book (admin)
router.delete("/books/:id", auth, requireAdmin, async (req, res) => {
  const b = await Book.findById(req.params.id);
  if (!b) return res.status(404).json({ message: "Book not found" });
  b.status = "removed";
  await b.save();
  res.json({ message: "Book removed" });
});

// GET /api/admin/users - list users
router.get("/users", auth, requireAdmin, async (req, res) => {
  const users = await User.find({ role: "student" }).select("-password");
  res.json(users);
});

// PUT /api/admin/users/:id/block - block/unblock user
router.put("/users/:id/block", auth, requireAdmin, async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  u.isBlocked = !u.isBlocked;
  await u.save();
  res.json({ message: u.isBlocked ? "User blocked" : "User unblocked" });
});

module.exports = router;