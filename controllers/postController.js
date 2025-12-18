import Post from "../models/Post.js";
import User from "../models/User.js";

/* ===========================
   🔹 МОИ ПОСТЫ
=========================== */
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get my posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ЛЕНТА (ПОДПИСКИ)
=========================== */
export const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: { $in: me.following } })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar")
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
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get user posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ОДИН ПОСТ
=========================== */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    if (!post) return res.status(404).json({ message: "Post not found" });

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
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const { caption } = req.body;

    const post = new Post({
      author: req.user.id,
      image: `/uploads/${req.file.filename}`,
      caption,
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(populatedPost);
  } catch (err) {
    console.log("Create post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 EXPLORE (ВСЕ ПОСТЫ)
=========================== */
export const getExplore = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get explore error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 LIKE / UNLIKE (TOGGLE)
=========================== */
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.log("Toggle like error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ADD COMMENT
=========================== */
export const addComment = async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ author: req.user.id, text });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(populated);
  } catch (err) {
    console.log("Add comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 DELETE POST (ONLY AUTHOR)
=========================== */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.log("Delete post error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
