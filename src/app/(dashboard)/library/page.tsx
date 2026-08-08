import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listDocuments } from "@/lib/data/documents";

const STATUS_LABELS: Record<string, string> = {
  pending: "Waiting to process",
  parsing: "Reading file…",
  segmenting: "Finding topics…",
  explaining: "Writing explanations…",
  quizzing: "Generating quiz…",
  ready: "Ready",
  failed: "Something went wrong",
};

export default async function LibraryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let documents: Awaited<ReturnType<typeof listDocuments>> = [];
  let loadError: string | null = null;

  try {
    documents = await listDocuments(supabase);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load your documents.";
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-aanu-accent">Your documents</h1>
          <p className="text-sm text-zinc-500">Logged in as {user.email}</p>
        </div>
        <a
          href="/demo"
          className="rounded-md border border-aanu-accent px-4 py-2 font-semibold text-aanu-accent hover:bg-aanu-accent hover:text-aanu-bg"
        >
          View sample
        </a>
        <a
          href="/upload"
          className="rounded-md bg-aanu-accent px-4 py-2 font-semibold text-aanu-bg hover:bg-aanu-accentDark"
        >
          + Upload
        </a>
      </div>

      {loadError ? (
        <div role="alert" className="rounded-lg bg-red-950/50 p-4 text-sm text-red-400">
          <p>{loadError}</p>
          <p className="mt-1 text-red-300">Try refreshing the page.</p>
        </div>
      ) : documents.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No documents yet.{" "}
          <a href="/upload" className="text-aanu-accent hover:underline">
            Upload your first one
          </a>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg bg-aanu-surface p-4"
            >
              <div>
                <p className="font-medium text-zinc-100">{doc.original_filename}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(doc.uploaded_at).toLocaleString()}
                </p>
              </div>
              <span className="text-sm text-aanu-accent">
                {STATUS_LABELS[doc.processing_status] ?? doc.processing_status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
