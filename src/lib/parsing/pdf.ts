import pdfParse from "pdf-parse";
import { Errors } from "@/lib/errors";

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedDocument {
  fullText: string;
  pages: ParsedPage[];
}

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const pages: ParsedPage[] = [];

    const result = await pdfParse(buffer, {
      pagerender: async (pageData: any) => {
        const textContent = await pageData.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        pages.push({ pageNumber: pages.length + 1, text });
        return text;
      },
    });

    const fullText = result.text.trim();
    return { fullText, pages };
  } catch (err) {
    throw Errors.parseFailed(err instanceof Error ? err.message : "unknown error");
  }
}

export function isLikelyScanned(doc: ParsedDocument, minCharsPerPage = 20): boolean {
  if (doc.pages.length === 0) return true;
  const avgCharsPerPage = doc.fullText.length / doc.pages.length;
  return avgCharsPerPage < minCharsPerPage;
}
