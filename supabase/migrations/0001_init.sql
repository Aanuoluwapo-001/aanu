create extension if not exists "pgcrypto";

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_filename text not null,
  storage_path text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'txt', 'image')),
  uploaded_at timestamptz not null default now(),
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'parsing', 'segmenting', 'explaining', 'quizzing', 'ready', 'failed')),
  processing_error text
);
create index documents_user_id_idx on documents(user_id);

create table topics (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  title text not null,
  "order" integer not null
);
create index topics_document_id_idx on topics(document_id);

create table subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  source_excerpt text not null,
  plain_explanation text not null,
  examples jsonb not null default '[]',
  nuances jsonb not null default '[]',
  "order" integer not null
);
create index subtopics_topic_id_idx on subtopics(topic_id);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  subtopic_id uuid not null references subtopics(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index between 0 and 3),
  explanation text not null
);
create index quizzes_subtopic_id_idx on quizzes(subtopic_id);

create table user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  subtopic_id uuid not null references subtopics(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'mastered')),
  last_score numeric,
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, subtopic_id)
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  selected_index integer not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);
create index quiz_attempts_user_id_idx on quiz_attempts(user_id);

alter table documents enable row level security;
alter table topics enable row level security;
alter table subtopics enable row level security;
alter table quizzes enable row level security;
alter table user_progress enable row level security;
alter table quiz_attempts enable row level security;

create policy "documents_select_own" on documents for select using (auth.uid() = user_id);
create policy "documents_insert_own" on documents for insert with check (auth.uid() = user_id);
create policy "documents_update_own" on documents for update using (auth.uid() = user_id);
create policy "documents_delete_own" on documents for delete using (auth.uid() = user_id);

create policy "topics_select_own" on topics for select using (exists (
  select 1 from documents d where d.id = topics.document_id and d.user_id = auth.uid()));
create policy "topics_insert_own" on topics for insert with check (exists (
  select 1 from documents d where d.id = topics.document_id and d.user_id = auth.uid()));
create policy "topics_update_own" on topics for update using (exists (
  select 1 from documents d where d.id = topics.document_id and d.user_id = auth.uid()));
create policy "topics_delete_own" on topics for delete using (exists (
  select 1 from documents d where d.id = topics.document_id and d.user_id = auth.uid()));

create policy "subtopics_select_own" on subtopics for select using (exists (
  select 1 from topics t join documents d on d.id = t.document_id
  where t.id = subtopics.topic_id and d.user_id = auth.uid()));
create policy "subtopics_insert_own" on subtopics for insert with check (exists (
  select 1 from topics t join documents d on d.id = t.document_id
  where t.id = subtopics.topic_id and d.user_id = auth.uid()));
create policy "subtopics_update_own" on subtopics for update using (exists (
  select 1 from topics t join documents d on d.id = t.document_id
  where t.id = subtopics.topic_id and d.user_id = auth.uid()));
create policy "subtopics_delete_own" on subtopics for delete using (exists (
  select 1 from topics t join documents d on d.id = t.document_id
  where t.id = subtopics.topic_id and d.user_id = auth.uid()));

create policy "quizzes_select_own" on quizzes for select using (exists (
  select 1 from subtopics s join topics t on t.id = s.topic_id join documents d on d.id = t.document_id
  where s.id = quizzes.subtopic_id and d.user_id = auth.uid()));
create policy "quizzes_insert_own" on quizzes for insert with check (exists (
  select 1 from subtopics s join topics t on t.id = s.topic_id join documents d on d.id = t.document_id
  where s.id = quizzes.subtopic_id and d.user_id = auth.uid()));
create policy "quizzes_update_own" on quizzes for update using (exists (
  select 1 from subtopics s join topics t on t.id = s.topic_id join documents d on d.id = t.document_id
  where s.id = quizzes.subtopic_id and d.user_id = auth.uid()));
create policy "quizzes_delete_own" on quizzes for delete using (exists (
  select 1 from subtopics s join topics t on t.id = s.topic_id join documents d on d.id = t.document_id
  where s.id = quizzes.subtopic_id and d.user_id = auth.uid()));

create policy "progress_select_own" on user_progress for select using (auth.uid() = user_id);
create policy "progress_upsert_own" on user_progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on user_progress for update using (auth.uid() = user_id);

create policy "attempts_select_own" on quiz_attempts for select using (auth.uid() = user_id);
create policy "attempts_insert_own" on quiz_attempts for insert with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;

create policy "storage_select_own" on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage_insert_own" on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage_delete_own" on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
