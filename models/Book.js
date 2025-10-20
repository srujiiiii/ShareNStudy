const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  subject: { type: String, trim: true },
  edition: { type: String, trim: true },
  condition: { type: String, enum: ["New","Like New","Good","Fair","Poor"], default: "Good" },
  price: { type: Number, default: 0 },
  isDonation: { type: Boolean, default: false },
  images: [{ type: String }],
  status: { type: String, enum: ["available","reserved","sold","removed"], default: "available" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Book", BookSchema);