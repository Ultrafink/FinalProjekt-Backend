import Post from "../models/Post.js";
import User from "../models/User.js";

/* ===========================
   🔹 ЛЕНТА (ТОЛЬКО ПОДПИСКИ)
=========================== */
export const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);

    const posts = await Post.find({
      author: { $in: me.following },
    })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get feed error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ПОСТЫ ПОЛЬЗОВАТЕЛЯ
=========================== */
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get user posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ОДИН ПОСТ (МОДАЛКА)
=========================== */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.log("Get post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 СОЗДАНИЕ ПОСТА
=========================== */
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
      likes: [],
      comments: [],
    });

    await post.save();

    const populatedPost = await post.populate(
      "author",
      "username avatar"
    );

    res.json(populatedPost);
  } catch (err) {
    console.log("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
