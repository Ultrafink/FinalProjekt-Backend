import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Делает абсолютный URL для /uploads/...
// (с защитой, если файл вдруг окажется в браузерной сборке и process будет undefined)
const toPublicUrl = (req, value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const envBase =
    (typeof process !== "undefined" && process?.env?.BASE_URL)
      ? process.env.BASE_URL
      : "";

  const base = envBase || `${req.protocol}://${req.get("host")}`;

  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
};

export const register = async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!username) return res.status(400).json({ message: "Username is required" });
    if (!fullName) return res.status(400).json({ message: "Full name is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const existsUser = await User.findOne({ username });
    if (existsUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, username, fullName, password: hashedPassword });
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

    // Ищем по email ИЛИ username (username приходит в поле email)
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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
        avatar: toPublicUrl(req, user.avatar),
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // Берём актуального юзера из БД без пароля
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: toPublicUrl(req, user.avatar),
      website: user.website || "",
      about: user.about || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.log("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Восстановление пароля ---

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // В учебном проекте возвращаем токен прямо в ответе
    res.json({ message: "Reset token generated", resetToken });
  } catch (err) {
    console.log("Request password reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

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
