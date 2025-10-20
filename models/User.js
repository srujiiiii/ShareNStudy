const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  college: { type: String, default: "" },
  course: { type: String, default: "" },
  interests: { type: [String], default: [] }, // changed to array
  role: { type: String, enum: ["student","admin"], default: "student" },
  isBlocked: { type: Boolean, default: false },
  isPrimaryAdmin: { type: Boolean, default: false }, // identify the initial/primary admin
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);