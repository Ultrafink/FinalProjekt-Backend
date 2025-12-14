import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
