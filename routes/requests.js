const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

// POST /api/requests - send request for a book
router.post("/", auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.owner.toString() === req.user.id) return res.status(400).json({ message: "Cannot request own book" });

    const exists = await Request.findOne({ book: bookId, buyer: req.user.id, status: "pending" });
    if (exists) return res.status(400).json({ message: "Request already pending" });

    const request = new Request({ book: bookId, buyer: req.user.id, owner: book.owner });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/requests/inbox - requests received (owner)
router.get("/inbox", auth, async (req, res) => {
  const list = await Request.find({ owner: req.user.id }).populate("buyer", "name email").populate("book");
  res.json(list);
});

// GET /api/requests/outbox - requests sent (buyer)
router.get("/outbox", auth, async (req, res) => {
  const list = await Request.find({ buyer: req.user.id }).populate("owner", "name email").populate("book");
  res.json(list);
});

// PUT /api/requests/:id/accept
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const r = await Request.findById(req.params.id).populate("book");
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (r.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not allowed" });
    r.status = "accepted";
    await r.save();
    r.book.status = "reserved";
    await r.book.save();
    res.json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/requests/:id/decline
router.put("/:id/decline", auth, async (req, res) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (r.owner.toString() !== req.user.id && r.buyer.toString() !== req.user.id) return res.status(403).json({ message: "Not allowed" });
    r.status = "declined";
    await r.save();
    res.json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/requests/:id/cancel  (buyer cancels)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (r.buyer.toString() !== req.user.id) return res.status(403).json({ message: "Not allowed" });
    r.status = "cancelled";
    await r.save();
    res.json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/requests/:id/complete  (mark completed)
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const r = await Request.findById(req.params.id).populate("book");
    if (!r) return res.status(404).json({ message: "Request not found" });
    r.status = "completed";
    await r.save();
    if (r.book) {
      r.book.status = "sold";
      await r.book.save();
    }
    res.json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;