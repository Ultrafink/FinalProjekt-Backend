import User from "../models/User.js";

// 🔹 Получить текущего пользователя
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    res.json(user);
  } catch (err) {
    console.log("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Обновить профиль
export const updateMe = async (req, res) => {
  try {
    const { username, website, about } = req.body;

    // если меняют username — проверяем уникальность
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
