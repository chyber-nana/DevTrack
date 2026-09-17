import type { Request, Response } from "express";
import {
  getAllProjects,
  updateProjectProgress,
  updateProjectLinks,
} from "../services/projectService.js";

export async function getProjects(
  _req: Request,
  res: Response
) {
  try {
    const projects = await getAllProjects();

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
}

export async function updateProgress(
  req: Request,
  res: Response
) {
  try {
    const projectId = Number(req.params.projectId);
    const progress = Number(req.body.progress);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (Number.isNaN(progress)) {
      return res.status(400).json({
        success: false,
        message: "Progress must be a number",
      });
    }

    const project = await updateProjectProgress(
      projectId,
      progress
    );

    res.json({
      success: true,
      message: "Project progress updated",
      data: project,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_PROGRESS"
    ) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    if (
      error instanceof Error &&
      error.message === "PROJECT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    console.error("Failed to update project progress:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update project progress",
    });
  }
}
export async function updateLinks(req: Request, res: Response) {
  const projectId = Number(req.params.projectId);
  if (Number.isNaN(projectId)) return res.status(400).json({ success: false, message: 'Invalid project ID' });
  const githubUrl = typeof req.body?.githubUrl === 'string' ? req.body.githubUrl.trim() : null;
  const demoUrl = typeof req.body?.demoUrl === 'string' ? req.body.demoUrl.trim() : null;
  const urlPattern = /^https?:\/\//i;
  if (githubUrl && !urlPattern.test(githubUrl)) return res.status(400).json({ success: false, message: 'GitHub URL must start with http:// or https://' });
  if (demoUrl && !urlPattern.test(demoUrl)) return res.status(400).json({ success: false, message: 'Demo URL must start with http:// or https://' });
  try {
    const project = await updateProjectLinks(projectId, githubUrl, demoUrl);
    res.json({ success: true, message: 'Project links updated', data: project });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') return res.status(404).json({ success: false, message: 'Project not found' });
    console.error('Failed to update project links:', error);
    res.status(500).json({ success: false, message: 'Failed to update project links' });
  }
}
