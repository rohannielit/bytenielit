const express = require("express");
const Timetable = require("../models/Timetable");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Get timetable
router.get("/", protect, async (req, res) => {
  try {
    const { semester, branch } = req.query;
    const filter = {};
    if (semester) filter.semester = Number(semester);
    if (branch) filter.branch = branch;
    const tt = await Timetable.findOne(filter).populate("createdBy", "name");
    res.json(tt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save/update timetable — allow admin, teacher AND student
router.post("/", protect, async (req, res) => {
  try {
    const { semester, branch, slots } = req.body;

    // Only admin and teacher can save
    if (!["admin","teacher"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only teachers and admins can edit timetable" });
    }

    let tt = await Timetable.findOne({ semester: Number(semester), branch });
    if (tt) {
      tt.slots = slots;
      tt.createdBy = req.user.id;
      await tt.save();
    } else {
      tt = await Timetable.create({
        semester: Number(semester),
        branch,
        slots,
        createdBy: req.user.id
      });
    }
    res.json(tt);
  } catch (err) {
    console.error("Timetable save error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;