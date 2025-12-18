import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWTSECRET);
    const user = await User.findById(decoded.id).select("-password");

    req.user = user ? { id: user._id.toString() } : null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
