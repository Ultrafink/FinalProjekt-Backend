import express from "express";
import multer from "multer";

import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  getFeed,
  getExplore,
  getMyPosts,
  getUserPosts,
  getPostById,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("image"), createPost);

// ВАЖНО: статические маршруты ДО /:id
router.get("/feed", authMiddleware, getFeed);
router.get("/explore", authMiddleware, getExplore);
router.get("/me", authMiddleware, getMyPosts);
router.get("/user/:username", authMiddleware, getUserPosts);

// ДОЛЖЕН быть внизу, иначе перехватит /explore
router.get("/:id", authMiddleware, getPostById);

router.delete("/:id", authMiddleware, deletePost);

export default router;
