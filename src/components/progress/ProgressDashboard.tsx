import type { Topic } from "@/fixtures/sample-document";
import { statusFor, type ProgressMap, type SubtopicProgress, type SubtopicStatus } from "@/lib/progress";

const STATUS_STYLES: Record<SubtopicStatus, { label: string; classes: string }> = {
  not_started: { label: "Not started", classes: "bg-zinc-700 text-zinc-300" },
  in_progress: { label: "In progress", classes: "bg-aanu-warn/20 text-aanu-warn" },
  mastered: { label: "Mastered", classes: "bg-green-900 text-green-400" },
};

interface ProgressDashboardProps {
  topics: Topic[];
  progress: ProgressMap;
  onSelectSubtopic: (subtopicId: string) => void;
}

export function ProgressDashboard({ topics, progress, onSelectSubtopic }: ProgressDashboardProps) {
  const allSubtopics = topics.flatMap((t) => t.subtopics.map((s) => ({ ...s, topicTitle: t.title })));

  const counts = allSubtopics.reduce(
    (acc, s) => {
      const status = statusFor(progress[s.id]);
      acc[status] += 1;
      return acc;
    },
    { not_started: 0, in_progress: 0, mastered: 0 } as Record<SubtopicStatus, number>
  );

  const weakest = allSubtopics
    .map((s) => ({ subtopic: s, entry: progress[s.id] }))
    .filter(
      (pair): pair is { subtopic: (typeof allSubtopics)[number]; entry: SubtopicProgress } =>
        !!pair.entry && pair.entry.attempts > 0
    )
    .sort((a, b) => {
      const ratioA = a.entry.bestScore / a.entry.totalQuestions;
      const ratioB = b.entry.bestScore / b.entry.totalQuestions;
      return ratioA - ratioB;
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Mastered" count={counts.mastered} colorClass="text-green-400" />
        <SummaryCard label="In progress" count={counts.in_progress} colorClass="text-aanu-warn" />
        <SummaryCard label="Not started" count={counts.not_started} colorClass="text-zinc-400" />
      </div>

      {weakest.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Weakest subtopics
          </h3>
          <ul className="flex flex-col gap-2">
            {weakest.map(({ subtopic: s, entry }) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelectSubtopic(s.id)}
                  className="flex w-full items-center justify-between rounded-lg bg-aanu-surface p-3 text-left hover:ring-1 hover:ring-aanu-accent"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{s.title}</p>
                    <p className="text-xs text-zinc-500">{s.topicTitle}</p>
                  </div>
                  <span className="text-sm text-zinc-300">
                    {entry.bestScore}/{entry.totalQuestions}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All subtopics
        </h3>
        <ul className="flex flex-col gap-2">
          {allSubtopics.map((s) => {
            const status = statusFor(progress[s.id]);
            const style = STATUS_STYLES[status];
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelectSubtopic(s.id)}
                  className="flex w-full items-center justify-between rounded-lg bg-aanu-surface p-3 text-left hover:ring-1 hover:ring-aanu-accent"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{s.title}</p>
                    <p className="text-xs text-zinc-500">{s.topicTitle}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.classes}`}>
                    {style.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function SummaryCard({ label, count, colorClass }: { label: string; count: number; colorClass: string }) {
  return (
    <div className="rounded-xl bg-aanu-surface p-4 text-center">
      <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    </div>
  );
}
