import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set on server");
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (err) {
    // чтобы понять, что именно на Render: TokenExpiredError / JsonWebTokenError invalid signature и т.д.
    console.error("Auth middleware error:", err?.name, err?.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
