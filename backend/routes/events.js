const express = require("express");
const Event = require("../models/Event");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy","name").sort("date");
    res.json(events);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", protect, requireRole("admin","teacher"), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
