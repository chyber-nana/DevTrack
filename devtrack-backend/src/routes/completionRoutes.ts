import { Router } from "express";
import {
  completeDay,
  uncompleteDay,
  getCompletions,
} from "../controllers/completionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getCompletions);
router.post("/:studyDayId", authenticate, completeDay);
router.delete("/:studyDayId", authenticate, uncompleteDay);

export default router;