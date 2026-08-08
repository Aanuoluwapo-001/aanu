"use client";

import { useState } from "react";
import type { Subtopic } from "@/fixtures/sample-document";
import { sampleDocument } from "@/fixtures/sample-document";
import { TopicNav } from "@/components/reteach/TopicNav";
import { SubtopicView } from "@/components/reteach/SubtopicView";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { recordAttempt, type ProgressMap } from "@/lib/progress";

const allSubtopics = sampleDocument.topics.flatMap((t) => t.subtopics);

if (allSubtopics.length === 0) {
  throw new Error("Sample document has no subtopics — check fixtures/sample-document.ts");
}

// Explicitly typed and asserted non-null here, once, right after the length
// check above proves it — TypeScript's control-flow narrowing doesn't carry
// across into the component function below, so we assert it at the source
// instead of re-deriving it (and re-triggering the same warning) inside.
const firstSubtopic: Subtopic = allSubtopics[0]!;

export default function DemoPage() {
  const [activeId, setActiveId] = useState(firstSubtopic.id);
  const [view, setView] = useState<"study" | "progress">("study");
  const [progress, setProgress] = useState<ProgressMap>({});

  const activeSubtopic = allSubtopics.find((s) => s.id === activeId)!;

  function handleQuizSubmit(subtopicId: string, score: number, total: number) {
    setProgress((prev) => recordAttempt(prev, subtopicId, score, total));
  }

  function goToSubtopic(subtopicId: string) {
    setActiveId(subtopicId);
    setView("study");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Sample document (no AI key needed)</p>
          <h1 className="text-2xl font-bold text-aanu-accent">{sampleDocument.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("study")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              view === "study" ? "bg-aanu-accent text-aanu-bg" : "bg-aanu-surface text-zinc-300"
            }`}
          >
            Study
          </button>
          <button
            type="button"
            onClick={() => setView("progress")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              view === "progress" ? "bg-aanu-accent text-aanu-bg" : "bg-aanu-surface text-zinc-300"
            }`}
          >
            Progress
          </button>
        </div>
      </div>

      {view === "study" ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <TopicNav topics={sampleDocument.topics} activeSubtopicId={activeId} onSelect={setActiveId} />
          <SubtopicView
            key={activeSubtopic.id}
            subtopic={activeSubtopic}
            onQuizSubmit={(score, total) => handleQuizSubmit(activeSubtopic.id, score, total)}
          />
        </div>
      ) : (
        <ProgressDashboard
          topics={sampleDocument.topics}
          progress={progress}
          onSelectSubtopic={goToSubtopic}
        />
      )}

      <p className="text-xs text-zinc-600">
        Progress shown here resets on page reload — this demo tracks it in memory only. Once documents
        are processed by the real AI pipeline, progress will be saved to your account permanently.
      </p>
    </main>
  );
}
