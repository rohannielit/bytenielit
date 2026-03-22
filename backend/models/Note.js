const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  branch: { type: String },
  type: { type: String, enum: ["note","assignment","pyq","other"], default: "note" },
  fileUrl: { type: String },
  filePublicId: { type: String },
  fileName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);
