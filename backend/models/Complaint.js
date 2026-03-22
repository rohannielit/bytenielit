const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["academic","infrastructure","hostel","library","other"], default: "other" },
  status: { type: String, enum: ["pending","in-progress","resolved","rejected"], default: "pending" },
  priority: { type: String, enum: ["low","medium","high"], default: "medium" },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  response: { type: String },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
