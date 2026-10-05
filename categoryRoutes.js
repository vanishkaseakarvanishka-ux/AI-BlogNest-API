const express = require("express");
const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  [body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Category name is required")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const category = await Category.create({
        name: req.body.name,
        description: req.body.description || ""
      });

      res.status(201).json({ success: true, category });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ success: false, message: "Category already exists" });
      next(error);
    }
  }
);

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description },
      { new: true, runValidators: true }
    );

    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;