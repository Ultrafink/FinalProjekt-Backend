import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;

    // Проверка пустых полей
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    if (!username)
      return res.status(400).json({ message: "Username is required" });

    if (!fullName)
      return res.status(400).json({ message: "Full name is required" });

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    // Проверка правильности email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    // Проверяем, есть ли такой email уже
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Проверяем username
    const existsUser = await User.findOne({ username });
    if (existsUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      username,
      fullName,
      password: hashedPassword,
    });

    await user.save();

    return res.json({ message: "User registered successfully" });

  } catch (error) {
    console.log("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔥 Ищем по email ИЛИ username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMe = async (req, res) => {
  try {
    res.json(req.user); // user уже получен в middleware
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- Восстановление пароля ---

// Отправка запроса на восстановление пароля
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Генерируем JWT-токен с коротким сроком действия (например 15 минут)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // В реальном приложении: отправка email с этим токеном
    // Для учебного проекта просто возвращаем токен
    res.json({ message: "Reset token generated", resetToken });
  } catch (err) {
    console.log("Request password reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Сброс пароля по токену
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password are required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.log("Reset password error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
