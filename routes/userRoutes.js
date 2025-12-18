import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import { getMe, updateMe, getUserProfile } from "../controllers/userController.js";

const router = express.Router();

/* ===========================
   🔹 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ
=========================== */
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateMe);

/* ===========================
   🔹 ПУБЛИЧНЫЙ ПРОФИЛЬ
   (публичный, но если токен есть — добавит isMe)
=========================== */
router.get("/:username", optionalAuthMiddleware, getUserProfile);

export default router;
