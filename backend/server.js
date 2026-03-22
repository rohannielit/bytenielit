const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Validate required env vars at startup
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`❌ FATAL: Missing environment variables: ${missing.join(", ")}`);
  console.error("Set these in your hosting platform's Environment/Config Vars section.");
  process.exit(1);
}

const authRoutes = require("./routes/auth");
const timetableRoutes = require("./routes/timetable");
const notesRoutes = require("./routes/notes");
const eventsRoutes = require("./routes/events");
const complaintsRoutes = require("./routes/complaints");
const attendanceRoutes = require("./routes/attendance");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/users");
const aiRoutes = require("./routes/ai");
const notificationRoutes = require("./routes/notifications");
const noticesRoutes = require("./routes/notices");
const profileRoutes = require("./routes/profile");

const { initSocket } = require("./socket/socketHandler");

const app = express();
const httpServer = http.createServer(app);

// Use wildcard CORS in production for flexibility; lock down CLIENT_URL in env for security
const allowedOrigin = process.env.CLIENT_URL || "*";

const io = new Server(httpServer, {
  cors: { origin: allowedOrigin, methods: ["GET", "POST"], credentials: true },
});

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => res.json({ status: "ByteNIELIT API running 🚀" }));

app.use("/api/auth", authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/profile", profileRoutes);

initSocket(io);

// Start HTTP server FIRST so Render's health check passes, then connect DB
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 ByteNIELIT server running on port ${PORT}`);
  // Connect to MongoDB after server is already listening
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      process.exit(1);
    });
});