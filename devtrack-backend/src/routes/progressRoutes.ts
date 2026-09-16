import { Router } from "express";
import { getProgress } from "../controllers/progressController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getProgress);

export default router;