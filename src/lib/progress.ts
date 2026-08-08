export type SubtopicStatus = "not_started" | "in_progress" | "mastered";

export interface SubtopicProgress {
  bestScore: number;
  totalQuestions: number;
  attempts: number;
}

export type ProgressMap = Record<string, SubtopicProgress>;

/** A subtopic counts as mastered at 80%+ on its best attempt. */
const MASTERY_THRESHOLD = 0.8;

export function statusFor(progress: SubtopicProgress | undefined): SubtopicStatus {
  if (!progress || progress.attempts === 0) return "not_started";
  const ratio = progress.bestScore / progress.totalQuestions;
  return ratio >= MASTERY_THRESHOLD ? "mastered" : "in_progress";
}

/** Records a new quiz attempt, keeping the best score seen so far. */
export function recordAttempt(
  progress: ProgressMap,
  subtopicId: string,
  score: number,
  total: number
): ProgressMap {
  const existing = progress[subtopicId];
  return {
    ...progress,
    [subtopicId]: {
      bestScore: existing ? Math.max(existing.bestScore, score) : score,
      totalQuestions: total,
      attempts: (existing?.attempts ?? 0) + 1,
    },
  };
}
