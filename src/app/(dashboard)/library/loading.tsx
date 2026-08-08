export default function LibraryLoading() {
  return (
    <main className="flex min-h-screen flex-col gap-6 p-8" aria-busy="true" aria-label="Loading your documents">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 animate-pulse rounded bg-aanu-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-aanu-surface" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 animate-pulse rounded-md bg-aanu-surface" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-aanu-surface" />
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-aanu-surface" />
        ))}
      </ul>
    </main>
  );
}
