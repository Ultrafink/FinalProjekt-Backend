import express from "express";
import multer from "multer";
import {
  createPost,
  getFeed,
  getMyPosts,
} from "../controllers/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🔹 МОИ ПОСТЫ (HOME)
router.get("/me", authMiddleware, getMyPosts);

// 🔹 ВСЯ ЛЕНТА (EXPLORE)
router.get("/", authMiddleware, getFeed);

// 🔹 СОЗДАНИЕ ПОСТА
router.post("/", authMiddleware, upload.single("image"), createPost);

export default router;
