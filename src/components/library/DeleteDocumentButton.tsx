"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteDocument } from "@/lib/data/documents";

interface DeleteDocumentButtonProps {
  documentId: string;
  storagePath: string;
  filename: string;
}

export function DeleteDocumentButton({ documentId, storagePath, filename }: DeleteDocumentButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isConfirming, setIsConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setStatus("deleting");
    setErrorMessage(null);
    try {
      await deleteDocument(supabase, documentId, storagePath);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not delete this document.");
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2" role="alertdialog" aria-label={`Confirm deleting ${filename}`}>
        <span className="text-xs text-zinc-400">Delete "{filename}"?</span>
        <button
          type="button"
          onClick={handleConfirmDelete}
          disabled={status === "deleting"}
          className="rounded-md bg-red-900 px-2 py-1 text-xs font-medium text-red-200 hover:bg-red-800 disabled:opacity-50"
        >
          {status === "deleting" ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsConfirming(false);
            setStatus("idle");
          }}
          disabled={status === "deleting"}
          className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </button>
        {status === "error" && errorMessage && (
          <span role="alert" className="text-xs text-red-400">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      aria-label={`Delete ${filename}`}
      className="rounded-md p-2 text-zinc-500 hover:bg-red-950/50 hover:text-red-400"
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
