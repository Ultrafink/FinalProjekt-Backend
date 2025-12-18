import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getFeed,
  getMyPosts,
  getUserPosts,
  getPostById,
  createPost,
  getExplore,
  toggleLike,
  toggleCommentLike,
  addComment,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

/* ===========================
   🔹 Multer
=========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ===========================
   🔹 Роуты
=========================== */

// Explore (все посты) — важно: выше "/:id"
router.get("/explore", authMiddleware, getExplore);

// мой feed (у тебя это "мои посты")
router.get("/me", authMiddleware, getMyPosts);

// лента подписок (Home)
router.get("/feed", authMiddleware, getFeed);

// посты пользователя
router.get("/user/:username", authMiddleware, getUserPosts);

// лайки и комменты (должны быть выше "/:id")
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comments", authMiddleware, addComment);
router.post("/:id/comments/:commentId/like", authMiddleware, toggleCommentLike);
router.delete("/:id", authMiddleware, deletePost);

// один пост
router.get("/:id", authMiddleware, getPostById);

// создание поста
router.post("/", authMiddleware, upload.single("image"), createPost);

export default router;
