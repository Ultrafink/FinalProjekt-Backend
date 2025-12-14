import Post from "../models/Post.js";

// Создать пост
export const createPost = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const { caption } = req.body;

    const newPost = new Post({
      author: req.user.id,
      image: `/uploads/${req.file.filename}`,
      caption,
    });

    await newPost.save();

    res.json({ message: "Post created", post: newPost });
  } catch (err) {
    console.log("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Получить ленту
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
