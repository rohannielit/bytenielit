const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

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

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET","POST"], credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/api/health", (req, res) => res.json({ status: "ByteNIELIT API running 🚀" }));

initSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 ByteNIELIT server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB error:", err));