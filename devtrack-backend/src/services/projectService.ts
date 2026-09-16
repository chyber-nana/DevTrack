import { db } from "../prisma/db.js";

export async function getAllProjects() {
  return db.orm.public.Project
    .orderBy((project) => project.id.asc())
    .all();
}

export async function updateProjectProgress(
  projectId: number,
  progress: number
) {
  if (progress < 0 || progress > 100) {
    throw new Error("INVALID_PROGRESS");
  }

  const project = await db.orm.public.Project
    .where({ id: projectId })
    .first();

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return db.orm.public.Project
    .where({ id: projectId })
    .update({
      progress,
    });
}