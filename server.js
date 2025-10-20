require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const booksRoutes = require("./routes/books");
const requestsRoutes = require("./routes/requests");
const adminRoutes = require("./routes/admin");
const reportsRoutes = require("./routes/reports");
const chatRoutes = require("./routes/chat");

const app = express();

// Security
app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static and uploads
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// API
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/requests", requestsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/chat", chatRoutes);

// Page routes
app.get("/", (req, res) => res.render("index"));
app.get("/register", (req, res) => res.render("register"));
app.get("/dashboard", (req, res) => res.render("dashboard"));
app.get("/donate", (req, res) => res.render("donate"));
app.get("/buy", (req, res) => res.render("buy"));
app.get("/myshelf", (req, res) => res.render("myshelf"));
app.get("/inbox", (req, res) => res.render("inbox"));
app.get("/outbox", (req, res) => res.render("outbox"));
app.get("/report", (req, res) => res.render("report"));
app.get("/profile", (req, res) => res.render("profile"));
app.get("/chat", (req, res) => res.render("chat"));

// Admin pages
app.get("/admin/admin-dashboard", (req, res) => res.render("admin/admin-dashboard"));
app.get("/admin/admins", (req, res) => res.render("admin/admins"));
app.get("/admin/books", (req, res) => res.render("admin/books"));
app.get("/admin/users", (req, res) => res.render("admin/users"));
app.get("/admin/reports", (req, res) => res.render("admin/reports"));

// Fallback for non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/css") || req.path.startsWith("/js")) return next();
  return res.render("index");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookshare";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    // socket.io
    const io = require("socket.io")(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      socket.on("join", (room) => { if (room) socket.join(room); });
      socket.on("message", (payload) => { if (payload && payload.room) io.to(payload.room).emit("message", payload); });
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });