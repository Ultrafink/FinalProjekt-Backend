import express from "express";
import multer from "multer";
import { createPost, getFeed } from "../controllers/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Настройка Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Создать пост
router.post("/", authMiddleware, upload.single("image"), createPost);

// Получить все посты
router.get("/", authMiddleware, getFeed);

export default router;
