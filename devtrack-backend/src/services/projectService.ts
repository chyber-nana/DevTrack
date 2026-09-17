import { db } from '../prisma/db.js';
import { sql } from '../database/sql.js';
import { evaluateAchievements } from './achievementService.js';

export async function getAllProjects() {
  const projects = await db.orm.public.Project.orderBy((project) => project.id.asc()).all();
  const result = await sql.query(`SELECT id, "githubUrl", "demoUrl" FROM "project" ORDER BY id ASC`);
  const links = new Map(result.rows.map((row) => [row.id, row]));
  return projects.map((project) => ({
    ...project,
    githubUrl: links.get(project.id)?.githubUrl ?? null,
    demoUrl: links.get(project.id)?.demoUrl ?? null,
  }));
}

export async function updateProjectProgress(projectId: number, progress: number) {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) throw new Error('INVALID_PROGRESS');
  const project = await db.orm.public.Project.where({ id: projectId }).first();
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  const updated = await db.orm.public.Project.where({ id: projectId }).update({ progress });
  const users = await sql.query(`SELECT id FROM \"user\"`);
  for (const user of users.rows) await evaluateAchievements(Number(user.id));
  return (await getAllProjects()).find((item) => item.id === projectId) ?? updated;
}

export async function updateProjectLinks(projectId: number, githubUrl?: string | null, demoUrl?: string | null) {
  const exists = await sql.query(`SELECT id FROM "project" WHERE id = $1`, [projectId]);
  if (!exists.rowCount) throw new Error('PROJECT_NOT_FOUND');
  const result = await sql.query(
    `UPDATE "project" SET "githubUrl" = $2, "demoUrl" = $3, "updatedAt" = now() WHERE id = $1 RETURNING id, "githubUrl", "demoUrl"`,
    [projectId, githubUrl || null, demoUrl || null],
  );
  await evaluateAchievementsFromProjectProgress();
  return result.rows[0];
}

async function evaluateAchievementsFromProjectProgress() {
  const users = await sql.query(`SELECT id FROM "user"`);
  for (const user of users.rows) await evaluateAchievements(user.id);
}
