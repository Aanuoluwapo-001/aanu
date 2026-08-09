import type { SupabaseClient } from "@supabase/supabase-js";

export type FileType = "pdf" | "docx" | "txt" | "image" | "other";

export const MAX_FILE_SIZE_MB = 70;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface DocumentRow {
  id: string;
  user_id: string;
  original_filename: string;
  storage_path: string;
  file_type: FileType;
  mime_type: string;
  uploaded_at: string;
  processing_status: "pending" | "parsing" | "segmenting" | "explaining" | "quizzing" | "ready" | "failed";
  processing_error: string | null;
}

/**
 * Buckets a file into a broad internal category for parsing/routing.
 * This NEVER rejects a file — any MIME type/extension is accepted per the
 * "accept any file type" requirement; unrecognized types fall into "other"
 * and are stored, even if the current parsing pipeline can't yet extract
 * text from them (that's a parsing-layer limitation, not an upload one).
 */
export function detectFileType(filename: string, mimeType: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (ext === "docx" || mimeType.includes("wordprocessingml")) return "docx";
  if (ext === "txt" || mimeType === "text/plain") return "txt";
  if (mimeType.startsWith("image/")) return "image";
  return "other";
}

/**
 * Uploads a file into the user's own folder in the "documents" storage
 * bucket, then creates the matching `documents` table row. Both steps rely
 * on RLS policies that check the path/user_id belongs to the caller.
 * Accepts any MIME type — only a size ceiling is enforced here.
 */
export async function uploadDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<DocumentRow> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
  }

  const fileType = detectFileType(file.name, file.type);
  const uniquePrefix = crypto.randomUUID();
  const storagePath = `${userId}/${uniquePrefix}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file, { upsert: false });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      original_filename: file.name,
      storage_path: storagePath,
      file_type: fileType,
      mime_type: file.type || "application/octet-stream",
      processing_status: "pending",
    })
    .select()
    .single();

  if (insertError || !data) {
    // Roll back the storage upload if the DB insert failed, so we don't
    // leave an orphaned file with no matching row.
    await supabase.storage.from("documents").remove([storagePath]);
    throw new Error(`Could not save document record: ${insertError?.message ?? "unknown error"}`);
  }

  return data as DocumentRow;
}

/** Lists all documents belonging to the current user, most recent first. */
export async function listDocuments(supabase: SupabaseClient): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load documents: ${error.message}`);
  }

  return (data ?? []) as DocumentRow[];
}

/**
 * Deletes a document: removes the file from Supabase Storage, then deletes
 * its `documents` row. Related `topics`/`subtopics`/`quizzes`/`user_progress`
 * rows are removed automatically via the ON DELETE CASCADE foreign keys
 * already defined in supabase/migrations/0001_init.sql — no separate
 * cascade logic is needed here.
 */
export async function deleteDocument(
  supabase: SupabaseClient,
  documentId: string,
  storagePath: string
): Promise<void> {
  const { error: storageError } = await supabase.storage.from("documents").remove([storagePath]);
  if (storageError) {
    throw new Error(`Could not delete file from storage: ${storageError.message}`);
  }

  const { error: dbError } = await supabase.from("documents").delete().eq("id", documentId);
  if (dbError) {
    throw new Error(`Could not delete document record: ${dbError.message}`);
  }
}
