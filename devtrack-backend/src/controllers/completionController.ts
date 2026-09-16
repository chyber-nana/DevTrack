import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import {
  completeStudyDay,
  uncompleteStudyDay,
  getUserCompletions,
  deleteAllUserCompletions,
} from "../services/completionService.js";

export async function completeDay(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const studyDayId = Number(req.params.studyDayId);

    if (Number.isNaN(studyDayId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid study day ID",
      });
    }

    const completion = await completeStudyDay(
      userId,
      studyDayId
    );

    res.status(201).json({
      success: true,
      message: "Study day completed",
      data: completion,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "STUDY_DAY_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Study day not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "ALREADY_COMPLETED"
    ) {
      return res.status(409).json({
        success: false,
        message: "Study day already completed",
      });
    }

    console.error("Failed to complete study day:", error);

    res.status(500).json({
      success: false,
      message: "Failed to complete study day",
    });
  }
}

export async function uncompleteDay(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;
    const studyDayId = Number(req.params.studyDayId);

    if (Number.isNaN(studyDayId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid study day ID",
      });
    }

    const completion = await uncompleteStudyDay(
      userId,
      studyDayId
    );

    res.json({
      success: true,
      message: "Study day marked as incomplete",
      data: completion,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "COMPLETION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Completion not found",
      });
    }

    console.error("Failed to uncomplete study day:", error);

    res.status(500).json({
      success: false,
      message: "Failed to uncomplete study day",
    });
  }
}

export async function getCompletions(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const completions = await getUserCompletions(userId);

    res.json({
      success: true,
      count: completions.length,
      data: completions,
    });
  } catch (error) {
    console.error("Failed to fetch completions:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch completions",
    });
  }
}

export async function resetCompletions(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user!.userId;

    const deleted =
      await deleteAllUserCompletions(userId);

    res.json({
      success: true,
      message: "Progress reset successfully",
      deleted,
    });
  } catch (error) {
    console.error(
      "Failed to reset progress:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to reset progress",
    });
  }
}