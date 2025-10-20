const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");
const requireAdmin = require("../middleware/requireAdmin");

// POST /api/reports - submit a report
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });
    const r = new Report({ reporter: req.user.id, content });
    await r.save();
    res.status(201).json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reports - admin view
router.get("/", auth, requireAdmin, async (req, res) => {
  const list = await Report.find().populate("reporter", "name email");
  res.json(list);
});

// PUT /api/reports/:id/resolve - admin resolves
router.put("/:id/resolve", auth, requireAdmin, async (req, res) => {
  const r = await Report.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });
  r.status = "resolved";
  await r.save();
  res.json({ message: "Report resolved" });
});

module.exports = router;