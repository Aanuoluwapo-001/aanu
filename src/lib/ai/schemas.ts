import { z } from "zod";

export const SubtopicSkeletonSchema = z.object({
  title: z.string().min(1),
  sourceExcerpt: z.string().min(1),
});

export const TopicSkeletonSchema = z.object({
  title: z.string().min(1),
  subtopics: z.array(SubtopicSkeletonSchema).min(1),
});

export const SegmentationResultSchema = z.object({
  topics: z.array(TopicSkeletonSchema).min(1),
});
export type SegmentationResult = z.infer<typeof SegmentationResultSchema>;

export const ReteachResultSchema = z.object({
  originalPoints: z.array(z.string().min(1)).min(1),
  plainExplanation: z.string().min(1),
  examples: z.array(z.string().min(1)).min(2).max(3),
  nuances: z.array(z.string().min(1)),
});
export type ReteachResult = z.infer<typeof ReteachResultSchema>;

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const QuizResultSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(4).max(6),
});
export type QuizResult = z.infer<typeof QuizResultSchema>;
