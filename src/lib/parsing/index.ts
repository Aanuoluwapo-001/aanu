import { parsePdf, isLikelyScanned } from "./pdf";
import { parseDocx } from "./docx";
import { ocrPageImages, parseImageOcr } from "./ocr";
import { rasterizePdfPages } from "./rasterize";
import { Errors } from "@/lib/errors";
import type { ParsedDocument } from "./pdf";

export type SupportedFileType = "pdf" | "docx" | "txt" | "image";

export async function parseFile(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<ParsedDocument> {
  switch (fileType) {
    case "pdf": {
      const textLayerResult = await parsePdf(buffer);

      if (!isLikelyScanned(textLayerResult)) {
        if (!textLayerResult.fullText) throw Errors.emptyExtractedText();
        return textLayerResult;
      }

      const pageImages = await rasterizePdfPages(buffer);
      return ocrPageImages(pageImages);
    }
    case "docx":
      return parseDocx(buffer);
    case "txt": {
      const fullText = buffer.toString("utf-8").trim();
      if (!fullText) throw Errors.emptyExtractedText();
      return { fullText, pages: [{ pageNumber: 1, text: fullText }] };
    }
    case "image":
      return parseImageOcr([buffer]);
    default:
      throw Errors.unsupportedFileType(fileType);
  }
}

export type { ParsedDocument, ParsedPage } from "./pdf";
export { isLikelyScanned } from "./pdf";
