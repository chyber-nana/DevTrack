import type { Request, Response } from "express";
import { getAllStudyDays, getTodayStudyDayRecord } from "../services/studyDayService.js";

export async function getStudyDays(
  _req: Request,
  res: Response
) {
  try {
    const studyDays = await getAllStudyDays();

    res.json({
      success: true,
      count: studyDays.length,
      data: studyDays,
    });
  } catch (error) {
    console.error("Failed to fetch study days:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch study days",
    });
  }
}

export async function getTodayStudyDay(
  _req: Request,
  res: Response
) {
  try {
    const studyDay = await getTodayStudyDayRecord();

    if (!studyDay) {
      return res.status(404).json({
        success: false,
        message: "No study day found for today",
      });
    }

    res.json({
      success: true,
      data: studyDay,
    });
  } catch (error) {
    console.error("Failed to fetch today's study day:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's study day",
    });
  }
}