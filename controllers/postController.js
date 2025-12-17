import Post from "../models/Post.js";

// 🔹 МОИ ПОСТЫ
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get my posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 ВСЯ ЛЕНТА (Explore)
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

// 🔹 СОЗДАНИЕ ПОСТА
export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { caption } = req.body;

    const post = new Post({
      author: req.user.id,
      image: `/uploads/${req.file.filename}`,
      caption,
    });

    await post.save();

    res.json(post);
  } catch (err) {
    console.log("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
