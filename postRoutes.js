const express = require("express");
const { body, validationResult } = require("express-validator");
const Post = require("../models/Post");
const Analytics = require("../models/Analytics");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      posts
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("category", "name");

    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.views += 1;
    await post.save();

    await Analytics.create({
      event: "post_view",
      post: post._id,
      user: req.user?._id
    });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  [
    body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("content").trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
    body("category").isMongoId().withMessage("Valid category is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        excerpt: req.body.excerpt,
        keywords: req.body.keywords || [],
        category: req.body.category,
        status: req.body.status || "draft",
        author: req.user._id,
        aiGenerated: Boolean(req.body.aiGenerated)
      });

      await Analytics.create({ event: "post_create", user: req.user._id, post: post._id });

      res.status(201).json({ success: true, post });
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const owner = post.author.toString() === req.user._id.toString();
    if (!owner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot edit this post" });
    }

    const allowed = ["title", "content", "excerpt", "keywords", "category", "status"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    await post.save();
    await Analytics.create({ event: "post_update", user: req.user._id, post: post._id });

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const owner = post.author.toString() === req.user._id.toString();
    if (!owner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot delete this post" });
    }

    await post.deleteOne();
    await Analytics.create({ event: "post_delete", user: req.user._id, post: post._id });

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/all", protect, adminOnly, async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email role")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;