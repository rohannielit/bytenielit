const express = require("express");
const Complaint = require("../models/Complaint");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { submittedBy: req.user.id } : {};
    if (req.query.status) filter.status = req.query.status;
    const complaints = await Complaint.find(filter)
      .populate("submittedBy", "name rollNumber")
      .populate("assignedTo", "name")
      .sort("-createdAt");
    res.json(complaints);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, submittedBy: req.user.id });
    res.status(201).json(complaint);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch("/:id/status", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    const { status, response, assignedTo } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, response, assignedTo },
      { new: true }
    ).populate("submittedBy","name").populate("assignedTo","name");
    res.json(complaint);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
