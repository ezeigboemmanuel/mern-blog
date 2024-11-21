const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: String,
    summary: String,
    content: String,
    coverImage: String,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
