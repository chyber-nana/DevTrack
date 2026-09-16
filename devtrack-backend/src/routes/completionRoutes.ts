import { Router } from "express";
import {
  completeDay,
  uncompleteDay,
  getCompletions,
  resetCompletions,
} from "../controllers/completionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getCompletions);
router.post("/:studyDayId", authenticate, completeDay);
router.delete("/:studyDayId", authenticate, uncompleteDay);
router.delete(
  "/reset",
  authenticate,
  resetCompletions
);

export default router;