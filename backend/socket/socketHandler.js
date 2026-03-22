const Message = require("../models/Message");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const { id, name, role } = socket.user;
    console.log(`Connected: ${name} (${role})`);

    onlineUsers.set(socket.id, { userId: id, name, role });
    await User.findByIdAndUpdate(id, { isOnline: true });
    io.emit("onlineUsers", Array.from(onlineUsers.values()));

    socket.join("general");

    socket.on("joinRoom", (room) => {
      socket.join(room);
      socket.emit("roomJoined", room);
    });

    socket.on("sendMessage", async ({ content, room = "general", type = "text", fileUrl }) => {
      try {
        const message = await Message.create({ sender: id, content, room, type, fileUrl });
        await message.populate("sender", "name role avatar");
        io.to(room).emit("newMessage", message);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ room, isTyping }) => {
      socket.to(room).emit("userTyping", { userId: id, name, isTyping });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(socket.id);
      await User.findByIdAndUpdate(id, { isOnline: false });
      io.emit("onlineUsers", Array.from(onlineUsers.values()));
    });
  });
};

module.exports = { initSocket };
