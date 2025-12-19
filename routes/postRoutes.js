import express from "express";
import multer from "multer";

import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  getMyPosts,
  getExplorePosts,
  getFeed,          // <-- добавь в контроллер
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  toggleCommentLike,
} from "../controllers/postController.js";

const router = express.Router();

// ---------- Multer ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ---------- Lists (СТАТИКА СНАЧАЛА) ----------
router.get("/me", authMiddleware, getMyPosts);
router.get("/feed", authMiddleware, getFeed);         // <-- чтобы /posts/feed не попадал в /:id
router.get("/explore", authMiddleware, getExplorePosts);

// ---------- Create ----------
router.post("/", authMiddleware, upload.single("image"), createPost);

// ---------- Likes / Comments (тоже статика раньше /:id) ----------
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comments", authMiddleware, addComment);
router.post("/:postId/comments/:commentId/like", authMiddleware, toggleCommentLike);

// ---------- Single post (ПАРАМЕТР В САМОМ НИЗУ) ----------
router.get("/:id", authMiddleware, getPostById);
router.delete("/:id", authMiddleware, deletePost);

export default router;
