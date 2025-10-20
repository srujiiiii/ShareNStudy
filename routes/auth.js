const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
require("dotenv").config();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log("[AUTH] POST /register - body:", req.body);
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, phone, role: "student" });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "changeme", { expiresIn: "7d" });

    const redirectTo = user.role === "admin" ? "/admin/admin-dashboard" : "/dashboard";
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, redirectTo });
  } catch (err) {
    console.error("[AUTH] /register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  console.log("[AUTH] POST /login - body:", req.body);
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role mismatch", userRole: user.role });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "changeme", { expiresIn: "7d" });

    const redirectTo = user.role === "admin" ? "/admin/admin-dashboard" : "/dashboard";
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, redirectTo });
  } catch (err) {
    console.error("[AUTH] /login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// PUT /api/auth/me
router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, college, course, interests, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (college) update.college = college;
    if (course) update.course = course;
    if (interests) update.interests = interests;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    console.error("[AUTH] PUT /me error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/auth/me
router.delete("/me", auth, async (req, res) => {
  try {
    const Book = require("../models/Book");
    const Request = require("../models/Request");

    await Book.deleteMany({ owner: req.user.id });
    await Request.deleteMany({ $or: [{ buyer: req.user.id }, { owner: req.user.id }] });
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Account and related data deleted" });
  } catch (err) {
    console.error("[AUTH] DELETE /me error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;