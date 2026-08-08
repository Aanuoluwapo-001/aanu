import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { Errors } from "@/lib/errors";
import {
  SegmentationResultSchema,
  ReteachResultSchema,
  QuizResultSchema,
  type SegmentationResult,
  type ReteachResult,
  type QuizResult,
} from "./schemas";
import {
  SEGMENTATION_SYSTEM_PROMPT,
  RETEACH_SYSTEM_PROMPT,
  QUIZ_SYSTEM_PROMPT,
  segmentationUserPrompt,
  reteachUserPrompt,
  quizUserPrompt,
} from "./prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const MAX_RETRIES = 2;

async function callAndValidate<T>(
  system: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  maxTokens: number
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text block in model response");
      }

      const cleaned = textBlock.text.replace(/```json\s*|```/g, "").trim();
      const parsedJson = JSON.parse(cleaned);
      return schema.parse(parsedJson);
    } catch (err) {
      lastError = err;
    }
  }

  console.error("AI JSON validation failed after retries:", lastError);
  throw Errors.aiInvalidJson(MAX_RETRIES + 1);
}

export async function segmentDocument(sourceText: string): Promise<SegmentationResult> {
  return callAndValidate(SEGMENTATION_SYSTEM_PROMPT, segmentationUserPrompt(sourceText), SegmentationResultSchema, 4096);
}

export async function reteachSubtopic(subtopicTitle: string, sourceExcerpt: string): Promise<ReteachResult> {
  return callAndValidate(RETEACH_SYSTEM_PROMPT, reteachUserPrompt(subtopicTitle, sourceExcerpt), ReteachResultSchema, 2048);
}

export async function generateQuiz(subtopicTitle: string, plainExplanation: string, sourceExcerpt: string): Promise<QuizResult> {
  return callAndValidate(QUIZ_SYSTEM_PROMPT, quizUserPrompt(subtopicTitle, plainExplanation, sourceExcerpt), QuizResultSchema, 2048);
}

export async function regenerateSubtopic(subtopicTitle: string, sourceExcerpt: string, studentNote?: string): Promise<ReteachResult> {
  const notePrefix = studentNote
    ? `A student flagged the previous explanation as missing or misrepresenting something. Their note: "${studentNote}"\n\n`
    : "";
  return callAndValidate(RETEACH_SYSTEM_PROMPT, notePrefix + reteachUserPrompt(subtopicTitle, sourceExcerpt), ReteachResultSchema, 2048);
}
