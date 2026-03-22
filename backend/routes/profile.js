const express = require("express");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Note = require("../models/Note");
const Complaint = require("../models/Complaint");
const { protect } = require("../middleware/auth");
const { upload, cloudinary } = require("../middleware/upload");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Get full profile with stats
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // Get stats
    const [attendanceRecords, notesCount, complaintsCount] = await Promise.all([
      Attendance.find({ student: req.user.id }),
      Note.countDocuments({ uploadedBy: req.user.id }),
      Complaint.countDocuments({ submittedBy: req.user.id }),
    ]);

    // Attendance summary
    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter(r => r.status === "present" || r.status === "late").length;
    const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    res.json({
      user,
      stats: {
        totalClasses,
        presentClasses,
        attendancePct,
        notesUploaded: notesCount,
        complaintsRaised: complaintsCount,
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update profile details
router.put("/", protect, async (req, res) => {
  try {
    const { name, rollNumber, branch, semester, phone, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, rollNumber, branch, semester, phone, bio },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Upload profile photo
router.post("/photo", protect, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");
    res.json({ avatar: user.avatar });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change password
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;