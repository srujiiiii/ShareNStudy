require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/bookshare";

async function seed() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  const adminEmail = process.env.PRIMARY_ADMIN_EMAIL || "admin@bookshare.local";
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    console.log("Admin already exists:", adminEmail);
    process.exit(0);
  }
  const password = process.env.PRIMARY_ADMIN_PASSWORD || "admin123";
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  admin = new User({
    name: "Initial Admin",
    email: adminEmail,
    password: hashed,
    role: "admin",
    phone: "",
    isPrimaryAdmin: true
  });
  await admin.save();
  console.log("Created admin:", adminEmail, "password:", password);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });