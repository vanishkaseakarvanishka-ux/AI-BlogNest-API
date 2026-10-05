const express = require("express");
const { body, validationResult } = require("express-validator");
const Analytics = require("../models/Analytics");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/generate",
  protect,
  [body("topic").trim().isLength({ min: 3, max: 200 }).withMessage("Topic is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI is not configured. Add GEMINI_API_KEY to your .env file."
        });
      }

      const prompt = `Create a professional blog post about: ${req.body.topic}. Return a title, short excerpt, keywords, and well-structured content.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(502).json({
          success: false,
          message: data.error?.message || "AI provider request failed"
        });
      }

      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

      await Analytics.create({
        event: "ai_request",
        user: req.user._id,
        metadata: { topic: req.body.topic }
      });

      res.json({
        success: true,
        topic: req.body.topic,
        generatedContent: text
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;