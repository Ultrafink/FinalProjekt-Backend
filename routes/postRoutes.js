import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getFeed,
  getMyPosts,
  getUserPosts,
  getPostById,
  createPost,
} from "../controllers/postController.js";

const router = express.Router();

/* ===========================
   🔹 Multer
=========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ===========================
   🔹 Роуты
=========================== */

// мой feed (Home)
router.get("/me", authMiddleware, getMyPosts);

// лента подписок (на будущее)
router.get("/feed", authMiddleware, getFeed);

// посты пользователя
router.get("/user/:username", authMiddleware, getUserPosts);

// один пост
router.get("/:id", authMiddleware, getPostById);

// создание поста
router.post("/", authMiddleware, upload.single("image"), createPost);

export default router;
