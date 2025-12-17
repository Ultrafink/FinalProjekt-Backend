import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
  getFeed,
  getUserPosts,
  getPostById,
  createPost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/feed", authMiddleware, getFeed);
router.get("/user/:username", authMiddleware, getUserPosts);
router.get("/:id", authMiddleware, getPostById);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

export default router;
