import { Router } from "express";
import {
  getProjects,
  updateProgress,
  updateLinks,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getProjects);
router.patch("/:projectId/progress", authenticate, updateProgress);
router.patch("/:projectId/links", authenticate, updateLinks);

export default router;