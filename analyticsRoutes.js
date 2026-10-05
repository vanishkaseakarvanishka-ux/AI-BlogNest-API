const express = require("express");
const Analytics = require("../models/Analytics");
const Post = require("../models/Post");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", protect, adminOnly, async (req, res, next) => {
  try {
    const [posts, views, events] = await Promise.all([
      Post.countDocuments(),
      Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Analytics.aggregate([
        { $group: { _id: "$event", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      summary: {
        totalPosts: posts,
        totalViews: views[0]?.total || 0,
        events
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/events", protect, adminOnly, async (req, res, next) => {
  try {
    const events = await Analytics.find()
      .populate("user", "name email")
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

module.exports = router;