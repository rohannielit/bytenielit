const express = require("express");
const Attendance = require("../models/Attendance");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

// Mark attendance (teacher/admin)
router.post("/mark", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    const { records, subject, semester, branch, date } = req.body;
    const ops = records.map(({ studentId, status }) => ({
      updateOne: {
        filter: { student: studentId, subject, date: new Date(date) },
        update: { $set: { student: studentId, subject, semester, branch, date, status, markedBy: req.user.id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: "Attendance marked" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get attendance for a student
router.get("/my", protect, async (req, res) => {
  try {
    const { subject, semester } = req.query;
    const filter = { student: req.user.id };
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    const records = await Attendance.find(filter).sort("-date");

    // Calculate percentage per subject
    const summary = {};
    records.forEach(r => {
      if (!summary[r.subject]) summary[r.subject] = { total: 0, present: 0 };
      summary[r.subject].total++;
      if (r.status === "present" || r.status === "late") summary[r.subject].present++;
    });

    res.json({ records, summary });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all attendance (teacher/admin)
router.get("/all", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    const { subject, date, semester } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (date) filter.date = new Date(date);
    if (semester) filter.semester = semester;
    const records = await Attendance.find(filter).populate("student","name rollNumber").sort("-date");
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
