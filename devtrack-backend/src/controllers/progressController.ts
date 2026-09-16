import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { getUserProgress } from "../services/progressService.js";

export async function getProgress(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const progress = await getUserProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Failed to fetch progress:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
}