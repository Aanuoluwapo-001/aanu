"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadDocument, detectFileType } from "@/lib/data/documents";

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates a file client-side before ever touching the network. */
function validateFile(file: File): string | null {
  if (!detectFileType(file.name)) {
    return `"${file.name}" isn't a supported file type. Use PDF, DOCX, TXT, or an image (PNG/JPG/WEBP).`;
  }
  if (file.size === 0) {
    return `"${file.name}" appears to be empty.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}, which is over the ${MAX_FILE_SIZE_MB}MB limit. Try a smaller file or split it up.`;
  }
  return null;
}

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      setPendingFile(null);
      return;
    }

    setPendingFile(file);
    setStatus("uploading");
    setErrorMessage(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setStatus("error");
      setErrorMessage("You're not logged in. Please log in again.");
      return;
    }

    try {
      await uploadDocument(supabase, user.id, file);
      setStatus("done");
      router.push("/library");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting the same file after an error
  }

  function handleRetry() {
    setStatus("idle");
    setErrorMessage(null);
    setPendingFile(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-aanu-accent">Upload a document</h1>
      <p className="max-w-md text-center text-sm text-zinc-400">
        PDF, DOCX, TXT, or an image of a handout, up to {MAX_FILE_SIZE_MB}MB. Aanu
        will re-teach it back to you in plain language, topic by topic, with a
        quiz after each part.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (status !== "uploading") setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={status === "uploading" ? undefined : onDrop}
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        role="button"
        tabIndex={status === "uploading" ? -1 : 0}
        aria-disabled={status === "uploading"}
        aria-label="Upload a document by dragging it here or clicking to browse"
        onKeyDown={(e) => {
          if (status === "uploading") return;
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition ${
          status === "uploading" ? "cursor-wait opacity-70" : "cursor-pointer"
        } ${isDragging ? "border-aanu-accent bg-aanu-surface" : "border-zinc-700 bg-aanu-surface/50"}`}
      >
        {status === "uploading" && pendingFile ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-aanu-accent border-t-transparent"
              aria-hidden="true"
            />
            <p className="text-zinc-200">{pendingFile.name}</p>
            <p className="text-xs text-zinc-500">{formatBytes(pendingFile.size)}</p>
          </div>
        ) : (
          <p className="text-zinc-300">Drag a file here, or click to browse</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
          onChange={onFileChange}
          disabled={status === "uploading"}
          className="hidden"
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {status === "uploading" ? `Uploading ${pendingFile?.name}` : ""}
      </p>

      {status === "error" && errorMessage && (
        <div role="alert" className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-red-400">{errorMessage}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm text-aanu-accent hover:underline"
          >
            Try a different file
          </button>
        </div>
      )}

      <a href="/library" className="text-sm text-zinc-500 hover:text-aanu-accent hover:underline">
        Back to your documents
      </a>
    </main>
  );
}
