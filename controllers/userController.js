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
   🔹 ОБНОВЛЕНИЕ АВАТАРА
=========================== */
export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

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
=========================== */
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const userDoc = await User.findOne({ username }).select("-password");
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const postsCount = await Post.countDocuments({ author: userDoc._id });

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

/* ===========================
   🔹 FOLLOW / UNFOLLOW (TOGGLE)
   POST /users/u/:id/follow
=========================== */
export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;

    if (String(targetId) === String(meId)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const [me, target] = await Promise.all([
      User.findById(meId),
      User.findById(targetId),
    ]);

    if (!me || !target) return res.status(404).json({ message: "User not found" });

    const isFollowing = (me.following || []).some(
      (id) => String(id) === String(targetId)
    );

    if (isFollowing) {
      await Promise.all([
        User.findByIdAndUpdate(meId, { $pull: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $pull: { followers: meId } }),
      ]);
    } else {
      await Promise.all([
        User.findByIdAndUpdate(meId, { $addToSet: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $addToSet: { followers: meId } }),
      ]);
    }

    const updatedMe = await User.findById(meId).select("-password");
    return res.json(updatedMe);
  } catch (err) {
    console.log("Toggle follow error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
