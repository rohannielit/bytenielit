const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  day: { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: String },
  room: { type: String },
  type: { type: String, enum: ["lecture","lab","tutorial"], default: "lecture" },
});

const timetableSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  branch: { type: String, required: true },
  slots: [slotSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);
