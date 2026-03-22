const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ["academic","exam","holiday","general","fee","event"], default: "general" },
  priority: { type: String, enum: ["normal","important","urgent"], default: "normal" },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attachmentUrl: { type: String },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);