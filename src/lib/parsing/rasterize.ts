import { pdf } from "pdf-to-img";
import { Errors } from "@/lib/errors";

export async function rasterizePdfPages(buffer: Buffer, scale = 2): Promise<Buffer[]> {
  try {
    const document = await pdf(buffer, { scale });
    const pageImages: Buffer[] = [];

    for await (const image of document) {
      pageImages.push(image as Buffer);
    }

    if (pageImages.length === 0) {
      throw new Error("PDF produced no renderable pages");
    }

    return pageImages;
  } catch (err) {
    throw Errors.parseFailed(
      `Could not rasterize scanned PDF pages: ${err instanceof Error ? err.message : "unknown error"}`
    );
  }
}
