import { Router } from "express";
import {
  getStudyDays,
  getTodayStudyDay,
} from "../controllers/studyDayController.js";

const router = Router();

router.get("/", getStudyDays);
router.get("/today", getTodayStudyDay);

export default router;