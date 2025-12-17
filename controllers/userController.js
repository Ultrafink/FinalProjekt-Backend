import User from "../models/User.js";
import Post from "../models/Post.js";

/* ===========================
   🔹 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
=========================== */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Get me error:", err);
    res.status(500).json({ message: "Server error" });
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
        return res
          .status(400)
          .json({ message: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        website,
        about,
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.log("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   🔹 ПУБЛИЧНЫЙ ПРОФИЛЬ
=========================== */
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "_id")
      .populate("following", "_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Post.countDocuments({
      author: user._id,
    });

    res.json({
      user,
      stats: {
        posts: postsCount,
        followers: user.followers.length,
        following: user.following.length,
      },
    });
  } catch (err) {
    console.log("Get user profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
