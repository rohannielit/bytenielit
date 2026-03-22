const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const router = express.Router();

// Get all notices
router.get("/", protect, async (req, res) => {
  try {
    const { category, priority } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    const notices = await Notice.find(filter)
      .populate("postedBy", "name role")
      .sort("-createdAt");
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create notice
router.post("/", protect, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    const notice = await Notice.create({
      title, content, category, priority,
      postedBy: req.user.id,
    });
    await notice.populate("postedBy", "name role");
    res.status(201).json(notice);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Increment view count
router.patch("/:id/view", protect, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(notice);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete notice
router.delete("/:id", protect, requireRole("admin", "teacher"), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;