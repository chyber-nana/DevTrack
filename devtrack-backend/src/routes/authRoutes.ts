import { Router } from "express";
import {
  register,
  login,
  getMe,
} from "../controllers/authController.js";
import {
  authenticate,
  type AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

router.get(
  "/protected",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "You accessed a protected route!",
      user: req.user,
    });
  }
);

export default router;