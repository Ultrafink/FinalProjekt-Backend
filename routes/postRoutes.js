import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getFeed,
  getUserPosts,
  getPostById,
  createPost,
} from "../controllers/postController.js";

const router = express.Router();

// 🔹 Настройка Multer прямо здесь
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🔹 Роуты
router.get("/feed", authMiddleware, getFeed);
router.get("/user/:username", authMiddleware, getUserPosts);
router.get("/:id", authMiddleware, getPostById);

router.post("/", authMiddleware, upload.single("image"), createPost);

export default router;
