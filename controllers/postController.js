import Post from "../models/Post.js";
import User from "../models/User.js";

// Подтягиваем автора поста + автора каждого комментария (username/fullName/avatar)
// populate заменяет ObjectId на документ из коллекции User. [web:1257]
const populatePost = (query) =>
  query
    .populate("author", "username fullName avatar")
    .populate("comments.author", "username fullName avatar"); // nested populate [web:1257]

const populatePosts = (query) =>
  query
    .populate("author", "username fullName avatar")
    .populate("comments.author", "username fullName avatar"); // nested populate [web:1257]

// --- Create ---
export const createPost = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const caption = req.body.caption || "";

    const post = await Post.create({
      author: req.user.id,
      image: `uploads/${req.file.filename}`,
      caption,
      likes: [],
      comments: [],
    });

    const populated = await populatePost(Post.findById(post._id));
    return res.json(populated);
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Lists ---
export const getMyPosts = async (req, res) => {
  try {
    const posts = await populatePosts(
      Post.find({ author: req.user.id }).sort({ createdAt: -1 })
    );
    return res.json(posts);
  } catch (err) {
    console.error("Get my posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const posts = await populatePosts(Post.find().sort({ createdAt: -1 }));
    return res.json(posts);
  } catch (err) {
    console.error("Get explore posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Фронт у тебя стучится в /posts/feed, поэтому эндпоинт обязан существовать.
// Пока нет логики "фида" — просто возвращаем то же, что explore.
export const getFeed = async (req, res) => {
  return getExplorePosts(req, res);
};

// --- Profile posts: /posts/user/:username ---
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await populatePosts(
      Post.find({ author: user._id }).sort({ createdAt: -1 })
    );

    return res.json(posts);
  } catch (err) {
    console.error("Get user posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Single ---
export const getPostById = async (req, res) => {
  try {
    const post = await populatePost(Post.findById(req.params.id));
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err) {
    console.error("Get post by id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await post.deleteOne();
    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Likes ---
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = String(req.user.id);
    const idx = post.likes.findIndex((id) => String(id) === userId);

    if (idx === -1) post.likes.push(req.user.id);
    else post.likes.splice(idx, 1);

    await post.save();

    // Чтобы фронт после лайка не терял populated поля
    const populated = await populatePost(Post.findById(post._id));
    return res.json(populated);
  } catch (err) {
    console.error("Toggle like error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Comments ---
export const addComment = async (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user.id, // важно: в schema поле author required
      text,
      likes: [],
      // createdAt/updatedAt не задаём — timestamps сделает сам [web:1665]
    });

    await post.save();

    // Возвращаем пост уже с username/avatar автора комментария
    const populated = await populatePost(Post.findById(post._id));
    return res.json(populated);
  } catch (err) {
    console.error("Add comment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // .id() ищет сабдокумент по _id в массиве сабдокументов [web:1596]
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = String(req.user.id);
    const idx = (comment.likes || []).findIndex((id) => String(id) === userId);

    if (idx === -1) comment.likes.push(req.user.id);
    else comment.likes.splice(idx, 1);

    await post.save();

    const populated = await populatePost(Post.findById(post._id));
    return res.json(populated);
  } catch (err) {
    console.error("Toggle comment like error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
