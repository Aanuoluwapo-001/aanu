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

// Single provider touchpoint. All Gemini API calls go through this file —
// nothing outside lib/ai/ should reference GEMINI_API_KEY or the Gemini
// endpoint directly, so swapping providers again later only means editing
// this file.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = (streaming: boolean) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${
    streaming ? "streamGenerateContent" : "generateContent"
  }?key=${GEMINI_API_KEY}`;

const MAX_RETRIES = 2;

// ---------- Gemini request/response types ----------
// Minimal local types for the Gemini REST shape — no SDK dependency, since
// we call the endpoint directly via fetch per the integration spec.

interface GeminiInlineImagePart {
  inline_data: {
    mime_type: string;
    data: string; // base64, no data: URL prefix
  };
}

interface GeminiTextPart {
  text: string;
}

type GeminiPart = GeminiTextPart | GeminiInlineImagePart;

interface GeminiRequestBody {
  contents: { role: "user"; parts: GeminiPart[] }[];
  systemInstruction?: { parts: GeminiTextPart[] };
}

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

interface GeminiResponseBody {
  candidates?: GeminiCandidate[];
  error?: { code?: number; message?: string; status?: string };
}

/** Optional image input for multimodal calls (see note on image reteaching below). */
export interface ImageInput {
  mimeType: string;
  /** Base64-encoded image data, no "data:" URL prefix. */
  base64Data: string;
}

/**
 * Calls the Gemini API with a system+user prompt (and optional image parts),
 * expects a raw JSON object back in the text response, validates it against
 * `schema`, and retries on malformed/invalid JSON — LLM output is never
 * trusted blindly, same policy as before.
 */
async function callAndValidate<T>(
  system: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  images?: ImageInput[]
): Promise<T> {
  if (!GEMINI_API_KEY) {
    throw Errors.aiRequestFailed("GEMINI_API_KEY is not set.");
  }

  const parts: GeminiPart[] = [{ text: userPrompt }];
  if (images) {
    for (const image of images) {
      parts.push({ inline_data: { mime_type: image.mimeType, data: image.base64Data } });
    }
  }

  const body: GeminiRequestBody = {
    contents: [{ role: "user", parts }],
    systemInstruction: { parts: [{ text: system }] },
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await fetch(GEMINI_ENDPOINT(false), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: GeminiResponseBody = await response.json();

      if (!response.ok || data.error) {
        // Gemini's error shape differs from Anthropic's — surface its message
        // directly rather than assuming Anthropic's { error: { message } } shape.
        throw new Error(data.error?.message ?? `Gemini request failed with status ${response.status}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No text content in Gemini response");
      }

      const cleaned = text.replace(/```json\s*|```/g, "").trim();
      const parsedJson = JSON.parse(cleaned);
      return schema.parse(parsedJson);
    } catch (err) {
      lastError = err;
      // fall through and retry
    }
  }

  console.error("Gemini JSON validation failed after retries:", lastError);
  throw Errors.aiInvalidJson(MAX_RETRIES + 1);
}

/** Step 1: split extracted source text into a topic -> subtopic outline. */
export async function segmentDocument(sourceText: string): Promise<SegmentationResult> {
  return callAndValidate(SEGMENTATION_SYSTEM_PROMPT, segmentationUserPrompt(sourceText), SegmentationResultSchema);
}

/**
 * Step 2: reteach one subtopic in plain language, grounded in its excerpt.
 * Pass `images` to reteach directly from a scanned page/photo via Gemini's
 * multimodal input instead of OCR'd text — see the architecture note in the
 * project README on when this path is used vs. the OCR text pipeline.
 */
export async function reteachSubtopic(
  subtopicTitle: string,
  sourceExcerpt: string,
  images?: ImageInput[]
): Promise<ReteachResult> {
  return callAndValidate(
    RETEACH_SYSTEM_PROMPT,
    reteachUserPrompt(subtopicTitle, sourceExcerpt),
    ReteachResultSchema,
    images
  );
}

/** Step 3: generate a 4-6 question quiz for one subtopic. */
export async function generateQuiz(
  subtopicTitle: string,
  plainExplanation: string,
  sourceExcerpt: string
): Promise<QuizResult> {
  return callAndValidate(
    QUIZ_SYSTEM_PROMPT,
    quizUserPrompt(subtopicTitle, plainExplanation, sourceExcerpt),
    QuizResultSchema
  );
}

/**
 * Used by the "flag this as wrong" correction loop: re-runs reteach for a
 * single subtopic, optionally with the student's correction note appended
 * so the regeneration targets what they flagged.
 */
export async function regenerateSubtopic(
  subtopicTitle: string,
  sourceExcerpt: string,
  studentNote?: string
): Promise<ReteachResult> {
  const notePrefix = studentNote
    ? `A student flagged the previous explanation as missing or misrepresenting something. Their note: "${studentNote}"\n\n`
    : "";
  return callAndValidate(
    RETEACH_SYSTEM_PROMPT,
    notePrefix + reteachUserPrompt(subtopicTitle, sourceExcerpt),
    ReteachResultSchema
  );
}
