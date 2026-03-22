const express = require("express");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");
const router = express.Router();

// Save FCM token for a user
router.post("/token", protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.json({ message: "FCM token saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send push notification (admin/teacher only)
router.post("/send", protect, requireRole("admin", "teacher"), async (req, res) => {
  try {
    const { title, body, targetRole } = req.body;

    const filter = targetRole ? { role: targetRole, fcmToken: { $exists: true, $ne: "" } } : { fcmToken: { $exists: true, $ne: "" } };
    const users = await User.find(filter).select("fcmToken name");
    const tokens = users.map(u => u.fcmToken).filter(Boolean);

    if (tokens.length === 0)
      return res.json({ message: "No registered devices found", sent: 0 });

    // Send via FCM HTTP v1 (batch)
    const results = await Promise.allSettled(
      tokens.map(token =>
        fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: token,
            notification: { title, body },
            data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
          }),
        })
      )
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    res.json({ message: `Notification sent to ${sent} devices`, sent, total: tokens.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
