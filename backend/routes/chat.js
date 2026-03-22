const express = require("express");
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.get("/:room", protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate("sender", "name role avatar")
      .sort("createdAt")
      .limit(100);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
