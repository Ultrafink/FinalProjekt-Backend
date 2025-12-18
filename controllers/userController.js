import User from "../models/User.js";
import Post from "../models/Post.js";

/* ===========================
   🔹 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
=========================== */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json(user);
  } catch (err) {
    console.log("Get me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ОБНОВЛЕНИЕ ПРОФИЛЯ
=========================== */
export const updateMe = async (req, res) => {
  try {
    const { username, website, about } = req.body;

    if (username) {
      const exists = await User.findOne({
        username,
        _id: { $ne: req.user.id },
      });

      if (exists) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, website, about },
      { new: true }
    ).select("-password");

    return res.json(updatedUser);
  } catch (err) {
    console.log("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ОБНОВЛЕНИЕ АВАТАРА (multipart/form-data)
   PATCH /users/me/avatar
=========================== */
export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    // server.js раздаёт папку uploads по /uploads, поэтому сохраняем так
    const avatar = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select("-password");

    return res.json(updatedUser);
  } catch (err) {
    console.log("Update avatar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ПУБЛИЧНЫЙ ПРОФИЛЬ ПО USERNAME
   (возвращает { user, stats } под твой ProfilePage)
=========================== */
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const userDoc = await User.findOne({ username }).select("-password");
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Post.countDocuments({ author: userDoc._id });

    // req.user будет только если ты повесил optionalAuthMiddleware на роут /users/:username
    const isMe = req.user && userDoc._id.toString() === req.user.id;

    const user = {
      _id: userDoc._id,
      username: userDoc.username,
      avatar: userDoc.avatar,
      about: userDoc.about,
      website: userDoc.website,
      isMe,
    };

    const stats = {
      posts: postsCount,
      followers: userDoc.followers?.length ?? 0,
      following: userDoc.following?.length ?? 0,
    };

    return res.json({ user, stats });
  } catch (err) {
    console.log("Get user profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
