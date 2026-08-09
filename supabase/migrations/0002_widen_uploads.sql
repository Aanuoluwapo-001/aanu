-- ============================================================
-- Aanu — widen upload support: any file type, larger size limit,
-- track real MIME type for Gemini multimodal image input.
-- ============================================================

-- Add a column for the file's real MIME type (needed to pass images to
-- Gemini's multimodal input as inline_data with an accurate mime_type).
alter table documents add column if not exists mime_type text not null default 'application/octet-stream';

-- Widen the file_type category check to include "other" — uploads are no
-- longer restricted to a fixed whitelist; unrecognized types are still
-- accepted and stored under "other".
alter table documents drop constraint if exists documents_file_type_check;
alter table documents add constraint documents_file_type_check
  check (file_type in ('pdf', 'docx', 'txt', 'image', 'other'));

-- Raise the "documents" storage bucket's file size limit to 70MB
-- (73,400,320 bytes). No MIME type restriction was set on this bucket at
-- creation, so it already accepts any file type — only the size ceiling
-- needed raising.
update storage.buckets
set file_size_limit = 73400320
where id = 'documents';
