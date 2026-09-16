import { db } from "../prisma/db.js";

function dateOnly(value: string | Date) {
  return new Date(value).toISOString().split("T")[0];
}

function getDayDifference(dateA: string, dateB: string) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime();
  const b = new Date(`${dateB}T00:00:00Z`).getTime();

  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export async function getUserProgress(userId: number) {
  const studyDays = await db.orm.public.StudyDay.all();

  const completions = await db.orm.public.Completion.where({ userId })
    .orderBy((completion) => completion.completedAt.asc())
    .all();

  const totalDays = studyDays.length;
  const completedDays = completions.length;

  const overallProgress =
    totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);

  const plannedHours = studyDays.reduce(
    (total, studyDay) => total + studyDay.hours,
    0,
  );

  let completedHours = 0;

  for (const completion of completions) {
    const studyDay = await db.orm.public.StudyDay.where({
      id: completion.studyDayId,
    }).first();

    if (studyDay) {
      completedHours += studyDay.hours;
    }
  }

  // Get unique completed study dates in chronological order.
  const completedDates: string[] = [];

  for (const completion of completions) {
    const studyDay = await db.orm.public.StudyDay.where({
      id: completion.studyDayId,
    }).first();

    if (studyDay) {
      const date = dateOnly(studyDay.date);

      if (!completedDates.includes(date)) {
        completedDates.push(date);
      }
    }
  }

  completedDates.sort();

  // Calculate longest streak.
  let longestStreak = 0;
  let currentRun = 0;

  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      currentRun = 1;
    } else {
      const difference = getDayDifference(
        completedDates[i],
        completedDates[i - 1],
      );

      if (difference === 1) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // Calculate current streak.
  let currentStreak = 0;
  const today = dateOnly(new Date());

  if (completedDates.includes(today)) {
    currentStreak = 1;

    for (let i = completedDates.length - 1; i > 0; i--) {
      const difference = getDayDifference(
        completedDates[i],
        completedDates[i - 1],
      );

      if (difference === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const weeklyProgress = [];

  for (let week = 1; week <= 22; week++) {
    const weekDays = studyDays.filter((studyDay) => studyDay.week === week);

    const weekStudyDayIds = new Set(weekDays.map((studyDay) => studyDay.id));

    const completedWeekDays = completions.filter((completion) =>
      weekStudyDayIds.has(completion.studyDayId),
    );

    const totalWeekDays = weekDays.length;
    const completedWeekDayCount = completedWeekDays.length;

    const weekPercentage =
      totalWeekDays === 0
        ? 0
        : Math.round((completedWeekDayCount / totalWeekDays) * 100);

    const plannedWeekHours = weekDays.reduce(
      (total, studyDay) => total + studyDay.hours,
      0,
    );

    const completedWeekHours = completedWeekDays.reduce((total, completion) => {
      const studyDay = weekDays.find((day) => day.id === completion.studyDayId);

      return total + (studyDay?.hours ?? 0);
    }, 0);

    weeklyProgress.push({
      week,
      totalDays: totalWeekDays,
      completedDays: completedWeekDayCount,
      percentage: weekPercentage,
      plannedHours: plannedWeekHours,
      completedHours: completedWeekHours,
    });
  }

  const phaseProgress = [];

  const phases = [...new Set(studyDays.map((studyDay) => studyDay.phase))];

  for (const phase of phases) {
    const phaseDays = studyDays.filter((studyDay) => studyDay.phase === phase);

    const phaseStudyDayIds = new Set(phaseDays.map((studyDay) => studyDay.id));

    const completedPhaseDays = completions.filter((completion) =>
      phaseStudyDayIds.has(completion.studyDayId),
    );

    const totalPhaseDays = phaseDays.length;
    const completedPhaseDayCount = completedPhaseDays.length;

    const percentage =
      totalPhaseDays === 0
        ? 0
        : Math.round((completedPhaseDayCount / totalPhaseDays) * 100);

    const plannedPhaseHours = phaseDays.reduce(
      (total, studyDay) => total + studyDay.hours,
      0,
    );

    const completedPhaseHours = completedPhaseDays.reduce(
      (total, completion) => {
        const studyDay = phaseDays.find(
          (day) => day.id === completion.studyDayId,
        );

        return total + (studyDay?.hours ?? 0);
      },
      0,
    );

    phaseProgress.push({
      phase,
      totalDays: totalPhaseDays,
      completedDays: completedPhaseDayCount,
      percentage,
      plannedHours: plannedPhaseHours,
      completedHours: completedPhaseHours,
    });
  }

  const projects = await db.orm.public.Project.orderBy((project) =>
    project.id.asc(),
  ).all();

  const projectProgress = projects.map((project) => ({
    id: project.id,
    name: project.name,
    progress: project.progress,
  }));

  return {
    totalDays,
    completedDays,
    overallProgress,
    plannedHours,
    completedHours,
    currentStreak,
    longestStreak,
    weeklyProgress,
    phaseProgress,
    projectProgress,
  };
}
