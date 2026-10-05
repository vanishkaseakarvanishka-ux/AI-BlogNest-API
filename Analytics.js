const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: ["post_view", "post_create", "post_update", "post_delete", "ai_request", "search"],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

analyticsSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);