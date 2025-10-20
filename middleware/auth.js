const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // Accept "Authorization: Bearer <token>" or plain token
    const authHeader = req.header("Authorization") || req.header("authorization") || "";
    let token = "";
    if (authHeader && typeof authHeader === "string") {
      if (authHeader.toLowerCase().startsWith("bearer ")) token = authHeader.split(" ")[1];
      else token = authHeader;
    }

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    const secret = process.env.JWT_SECRET || "changeme";
    const decoded = jwt.verify(token, secret);

    // JWT payloads in this project are { user: { id, role } } — support both shapes
    const userPayload = decoded.user || decoded;
    if (!userPayload || !userPayload.id) return res.status(401).json({ message: "Invalid token payload" });

    const user = await User.findById(userPayload.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.isBlocked) return res.status(403).json({ message: "User is blocked" });

    // Attach the DB user and a lightweight user object to the request
    req.user = { id: user.id, role: user.role };
    req.currentUser = user; // full mongoose document for handlers that need extra checks
    next();
  } catch (err) {
    console.error("[auth] token verification error:", err.message || err);
    return res.status(401).json({ message: "Token invalid" });
  }
};
