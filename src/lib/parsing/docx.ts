import mammoth from "mammoth";
import { Errors } from "@/lib/errors";
import type { ParsedDocument } from "./pdf";

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    const fullText = htmlToPlainText(html);
    if (!fullText.trim()) throw Errors.emptyExtractedText();

    const sections = splitOnHeadings(html);

    return {
      fullText: fullText.trim(),
      pages: sections.map((text, i) => ({ pageNumber: i + 1, text })),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AppError") throw err;
    throw Errors.parseFailed(err instanceof Error ? err.message : "unknown error");
  }
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/(p|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function splitOnHeadings(html: string): string[] {
  const parts = html.split(/(?=<h[1-3][ >])/i).filter(Boolean);
  return parts.length > 0 ? parts.map(htmlToPlainText) : [htmlToPlainText(html)];
}
