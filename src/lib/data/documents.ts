import type { SupabaseClient } from "@supabase/supabase-js";

export type FileType = "pdf" | "docx" | "txt" | "image";

export interface DocumentRow {
  id: string;
  user_id: string;
  original_filename: string;
  storage_path: string;
  file_type: FileType;
  uploaded_at: string;
  processing_status: "pending" | "parsing" | "segmenting" | "explaining" | "quizzing" | "ready" | "failed";
  processing_error: string | null;
}

/** Maps a browser File's extension to our stored file_type enum. */
export function detectFileType(filename: string): FileType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") return "image";
  return null;
}

/**
 * Uploads a file into the user's own folder in the "documents" storage
 * bucket, then creates the matching `documents` table row. Both steps rely
 * on RLS policies that check the path/user_id belongs to the caller.
 */
export async function uploadDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<DocumentRow> {
  const fileType = detectFileType(file.name);
  if (!fileType) {
    throw new Error(`Unsupported file type for "${file.name}". Use PDF, DOCX, TXT, or an image.`);
  }

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
      processing_status: "pending",
    })
    .select()
    .single();

  if (insertError || !data) {
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
