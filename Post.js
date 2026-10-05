const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      minlength: 10
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 500
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", keywords: "text" });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);