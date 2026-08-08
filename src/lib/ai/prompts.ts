export const SEGMENTATION_SYSTEM_PROMPT = `You are segmenting a student's uploaded document into a topic -> subtopic outline.

Rules:
- Mirror the source's OWN structure. Do not invent an organization scheme the source doesn't support.
- Every subtopic must include a "sourceExcerpt": a short verbatim-ish snippet plus a page/section pointer.
- Do not drop or merge away any distinct point the source makes.
- Output ONLY valid JSON matching the provided schema. No prose, no markdown fences.`;

export const RETEACH_SYSTEM_PROMPT = `You are re-teaching one subtopic of a document to a student with no prior background, in plain everyday language.

Rules:
- "originalPoints": restate the source's point(s) faithfully - verify against the excerpt, invent nothing, drop nothing.
- "plainExplanation": explain it the way a patient teacher would to a first-time listener. No unexplained jargon.
- "examples": 2-3 everyday-life examples or analogies.
- "nuances": any exception/edge case the source mentions or implies. Empty array if genuinely none - never fabricate one.
- Stay strictly within what this subtopic's source excerpt supports.
- Output ONLY valid JSON matching the provided schema. No prose, no markdown fences.`;

export const QUIZ_SYSTEM_PROMPT = `You are writing a 4-to-6 question multiple-choice quiz for ONE subtopic a student just reviewed.

Rules:
- Answerable using only this subtopic's content.
- Exactly 4 options per question, exactly one correct.
- "explanation" should teach - why correct is right, and briefly why a tempting wrong option is wrong.
- Vary question style.
- Output ONLY valid JSON matching the provided schema. No prose, no markdown fences.`;

export function segmentationUserPrompt(sourceText: string): string {
  return `Segment the following document text into topics and subtopics.\n\n---\n${sourceText}\n---`;
}

export function reteachUserPrompt(subtopicTitle: string, sourceExcerpt: string): string {
  return `Subtopic: "${subtopicTitle}"\n\nSource excerpt for this subtopic:\n---\n${sourceExcerpt}\n---`;
}

export function quizUserPrompt(subtopicTitle: string, plainExplanation: string, sourceExcerpt: string): string {
  return `Subtopic: "${subtopicTitle}"\n\nPlain explanation given to the student:\n---\n${plainExplanation}\n---\n\nOriginal source excerpt (for grounding, don't quiz outside it):\n---\n${sourceExcerpt}\n---`;
}
