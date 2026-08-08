"use client";

import { useId, useState } from "react";

interface FlagSubtopicProps {
  subtopicTitle: string;
  /**
   * Called with the student's note when they submit a flag. Wire this to
   * `regenerateSubtopic()` from lib/ai/reteach.ts once the AI key is live —
   * for now (no key yet) it just simulates the queued state.
   */
  onFlag?: (note: string) => Promise<void>;
}

export function FlagSubtopic({ subtopicTitle, onFlag }: FlagSubtopicProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "queued" | "error">("idle");
  const textareaId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      if (onFlag) {
        await onFlag(note);
      } else {
        // No AI key wired up yet — simulate the queued state so the UI
        // and flow can be reviewed before the real pipeline exists.
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setStatus("queued");
    } catch {
      setStatus("error");
    }
  }

  if (status === "queued") {
    return (
      <p role="status" className="text-sm text-aanu-accent">
        Thanks — this subtopic is queued to be re-explained. Check back shortly.
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="self-start text-sm text-zinc-500 hover:text-aanu-warn hover:underline"
      >
        This explanation missed or got something wrong →
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-aanu-surface p-4"
      aria-label={`Flag an issue with ${subtopicTitle}`}
    >
      <label htmlFor={textareaId} className="text-sm font-medium text-zinc-200">
        What did the explanation for "{subtopicTitle}" miss or get wrong?
      </label>
      <textarea
        id={textareaId}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        required
        rows={3}
        placeholder="e.g. It skipped the exception mentioned on page 44..."
        className="rounded-md border border-zinc-700 bg-aanu-bg px-3 py-2 text-sm text-zinc-100 focus:border-aanu-accent focus:outline-none"
      />
      {status === "error" && (
        <p role="alert" className="text-sm text-red-400">
          Couldn't submit that — please try again.
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "submitting" || note.trim().length === 0}
          className="rounded-md bg-aanu-accent px-4 py-2 text-sm font-semibold text-aanu-bg disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit and re-explain"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
