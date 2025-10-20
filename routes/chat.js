const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Request = require("../models/Request");
const auth = require("../middleware/auth");

// GET /api/chat/:requestId - get chat for a request
router.get("/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only buyer or owner can access
    const uid = req.user.id;
    if (request.buyer.toString() !== uid && request.owner.toString() !== uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let chat = await Chat.findOne({ request: requestId }).populate("messages.sender", "name email");
    if (!chat) {
      chat = new Chat({ request: requestId, messages: [], isOpen: true });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error("[chat] GET error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/chat/:requestId - add message
router.post("/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Message required" });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const uid = req.user.id;
    if (request.buyer.toString() !== uid && request.owner.toString() !== uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    let chat = await Chat.findOne({ request: requestId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found. Please open chat first." });
    }
    if (!chat.isOpen) return res.status(400).json({ message: "Chat is closed" });

    chat.messages.push({ sender: req.user.id, text });
    await chat.save();
    // Optionally populate sender for the response
    await chat.populate("messages.sender", "name email");
    res.json(chat);
  } catch (err) {
    console.error("[chat] POST error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/chat/:requestId/close - close chat
router.put("/:requestId/close", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const uid = req.user.id;
    if (request.buyer.toString() !== uid && request.owner.toString() !== uid) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const chat = await Chat.findOne({ request: requestId });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    chat.isOpen = false;
    await chat.save();
    res.json({ message: "Chat closed" });
  } catch (err) {
    console.error("[chat] CLOSE error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;