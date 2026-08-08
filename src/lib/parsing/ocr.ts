import { createWorker } from "tesseract.js";
import { Errors } from "@/lib/errors";
import type { ParsedDocument } from "./pdf";

export async function ocrPageImages(pageImages: Buffer[]): Promise<ParsedDocument> {
  const worker = await createWorker("eng");
  const pages: ParsedDocument["pages"] = [];

  try {
    for (const [i, pageImage] of pageImages.entries()) {
      const {
        data: { text },
      } = await worker.recognize(pageImage);
      pages.push({ pageNumber: i + 1, text: text.trim() });
    }
  } catch (err) {
    throw Errors.parseFailed(err instanceof Error ? err.message : "OCR failed");
  } finally {
    await worker.terminate();
  }

  const fullText = pages.map((p) => p.text).join("\n\n").trim();
  if (!fullText) throw Errors.emptyExtractedText();

  return { fullText, pages };
}

export async function parseImageOcr(buffers: Buffer[]): Promise<ParsedDocument> {
  return ocrPageImages(buffers);
}
