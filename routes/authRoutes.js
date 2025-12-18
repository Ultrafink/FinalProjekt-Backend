import { Router } from "express";
import {
  register,
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Защищённый маршрут (нужен Authorization: Bearer <token>)
router.get("/me", authMiddleware, getMe);

// Восстановление пароля
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", resetPassword);

export default router;
