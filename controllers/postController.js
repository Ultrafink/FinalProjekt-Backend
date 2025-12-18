import Post from "../models/Post.js";
import User from "../models/User.js";

// POST /posts
export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const caption = req.body.caption || "";

    const newPost = new Post({
      author: req.user.id,
      image: `uploads/${req.file.filename}`,
      caption,
      likes: [],
      comments: [],
    });

    await newPost.save();
    const populated = await newPost.populate("author", "username avatar");

    res.json(populated);
  } catch (err) {
    console.log("Create post error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /posts/feed
export const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user.id);

    const ids = [req.user.id, ...(me?.following || [])];

    const posts = await Post.find({ author: { $in: ids } })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get feed error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /posts/me
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get my posts error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /posts/user/:username
export const getUserPosts = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user.id })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("Get user posts error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /posts/:id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username avatar"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    console.log("Get post by id error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Post.deleteOne({ _id: post.id });
    res.json({ ok: true, id: post.id });
  } catch (err) {
    console.log("Delete post error", err);
    res.status(500).json({ message: "Server error" });
  }
};
