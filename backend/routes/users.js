const express = require("express");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch("/:id/role", protect, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
