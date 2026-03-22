const express = require("express");
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");
const router = express.Router();

// AI Chat Summary using Anthropic API
router.post("/summarize", protect, async (req, res) => {
  try {
    const { room = "general", limit = 50 } = req.body;

    const messages = await Message.find({ room })
      .populate("sender", "name role")
      .sort("-createdAt")
      .limit(limit);

    if (messages.length === 0)
      return res.json({ summary: "No messages to summarize yet." });

    const transcript = messages
      .reverse()
      .map(m => `${m.sender?.name} (${m.sender?.role}): ${m.content}`)
      .join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: `You are summarizing a college campus chat. Give a clear, concise summary of the key topics discussed, any important announcements, questions asked, and decisions made. Keep it under 150 words.\n\nChat transcript:\n${transcript}`,
        }],
      }),
    });

    const data = await response.json();
    const summary = data.content?.[0]?.text || "Could not generate summary.";
    res.json({ summary, messageCount: messages.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
