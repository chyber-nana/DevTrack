import { db } from "../prisma/db.js";

export async function completeStudyDay(
  userId: number,
  studyDayId: number
) {
  // Check that the study day exists
  const studyDay = await db.orm.public.StudyDay
    .where({ id: studyDayId })
    .first();

  if (!studyDay) {
    throw new Error("STUDY_DAY_NOT_FOUND");
  }

  // Check if this user already completed it
  const existingCompletion = await db.orm.public.Completion
    .where({
      userId,
      studyDayId,
    })
    .first();

  if (existingCompletion) {
    throw new Error("ALREADY_COMPLETED");
  }

  // Create the completion
  const completion = await db.orm.public.Completion.create({
    userId,
    studyDayId,
  });

  return completion;
}

export async function uncompleteStudyDay(
  userId: number,
  studyDayId: number
) {
  const completion = await db.orm.public.Completion
    .where({
      userId,
      studyDayId,
    })
    .first();

  if (!completion) {
    throw new Error("COMPLETION_NOT_FOUND");
  }

await db.orm.public.Completion
  .where({ id: completion.id })
  .delete();

  return completion;
}

export async function getUserCompletions(userId: number) {
  const completions = await db.orm.public.Completion
    .where({ userId })
    .orderBy((completion) => completion.completedAt.asc())
    .all();

  const results = [];

  for (const completion of completions) {
    const studyDay = await db.orm.public.StudyDay
      .where({ id: completion.studyDayId })
      .first();

    results.push({
      ...completion,
      studyDay,
    });
  }

  return results;
}