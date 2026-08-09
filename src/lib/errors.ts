export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AppError";
  }

  toResponseBody() {
    return { error: { code: this.code, message: this.message } };
  }
}

export const Errors = {
  unsupportedFileType: (type: string) =>
    new AppError("UNSUPPORTED_FILE_TYPE", `File type "${type}" is not supported.`, 415),
  parseFailed: (detail: string) =>
    new AppError("PARSE_FAILED", `Could not extract text from the file: ${detail}`, 422),
  emptyExtractedText: () =>
    new AppError("EMPTY_EXTRACTED_TEXT", "No readable text was found in this file.", 422),
  aiInvalidJson: (attempt: number) =>
    new AppError("AI_INVALID_JSON", `Model returned malformed JSON (attempt ${attempt}).`, 502),
  aiRequestFailed: (detail: string) =>
    new AppError("AI_REQUEST_FAILED", `The AI request failed: ${detail}. Please try again.`, 502),
  fileTooLarge: (maxMb: number) =>
    new AppError("FILE_TOO_LARGE", `File exceeds the ${maxMb}MB limit.`, 413),
  notFound: (resource: string) => new AppError("NOT_FOUND", `${resource} not found.`, 404),
  forbidden: () => new AppError("FORBIDDEN", "You do not have access to this resource.", 403),
};
