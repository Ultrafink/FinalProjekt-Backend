import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMe,
  updateMe,
  getUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);

// публичный профиль
router.get("/:username", authMiddleware, getUserProfile);

export default router;
