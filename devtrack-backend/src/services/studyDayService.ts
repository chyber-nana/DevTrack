import { db } from "../prisma/db.js";

export async function getAllStudyDays() {
  return db.orm.public.StudyDay
    .orderBy((studyDay) => studyDay.date.asc())
    .all();
}

export async function getTodayStudyDayRecord() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return db.orm.public.StudyDay
    .where({ date: today.toISOString() })
    .first();
}