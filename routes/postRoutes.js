import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  createPost,
  getMyPosts,
  getExplorePosts,
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

// ---------- Posts ----------
router.post("/", authMiddleware, upload.single("image"), createPost);
router.get("/me", authMiddleware, getMyPosts);
router.get("/", authMiddleware, getExplorePosts);

router.get("/:id", authMiddleware, getPostById);
router.delete("/:id", authMiddleware, deletePost);

// ---------- Likes ----------
router.post("/:id/like", authMiddleware, toggleLike);

// ---------- Comments ----------
router.post("/:id/comments", authMiddleware, addComment);
router.post("/:postId/comments/:commentId/like", authMiddleware, toggleCommentLike);

export default router;
