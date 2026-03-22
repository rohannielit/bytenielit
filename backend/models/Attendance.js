const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  branch: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present","absent","late"], default: "present" },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
