"use client";

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-bold text-red-400">Something went wrong loading your documents</h1>
      <p className="max-w-sm text-sm text-zinc-400">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-aanu-accent px-4 py-2 font-semibold text-aanu-bg"
      >
        Try again
      </button>
    </main>
  );
}
