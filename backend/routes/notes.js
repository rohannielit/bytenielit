const express = require("express");
const Note = require("../models/Note");
const { protect, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { subject, semester, type, branch } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (type) filter.type = type;
    if (branch) filter.branch = branch;
    const notes = await Note.find(filter).populate("uploadedBy", "name role").sort("-createdAt");
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { title, description, subject, semester, branch, type, dueDate, tags } = req.body;
    const note = await Note.create({
      title, description, subject, semester, branch, type, dueDate,
      tags: tags ? tags.split(",") : [],
      fileUrl: req.file?.path,
      filePublicId: req.file?.filename,
      fileName: req.file?.originalname,
      uploadedBy: req.user.id,
    });
    await note.populate("uploadedBy", "name role");
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
