const express = require("express");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/post/:postId", async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  [
    body("post").isMongoId().withMessage("Valid post is required"),
    body("text").trim().isLength({ min: 1, max: 1000 }).withMessage("Comment must be 1-1000 characters")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const comment = await Comment.create({
        post: req.body.post,
        user: req.user._id,
        text: req.body.text
      });

      const populated = await comment.populate("user", "name");
      res.status(201).json({ success: true, comment: populated });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot delete this comment" });
    }

    await comment.deleteOne();
    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;