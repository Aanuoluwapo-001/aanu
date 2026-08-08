import type { Subtopic } from "@/fixtures/sample-document";
import { QuizBlock } from "@/components/quiz/QuizBlock";
import { FlagSubtopic } from "@/components/reteach/FlagSubtopic";

interface SubtopicViewProps {
  subtopic: Subtopic;
  onQuizSubmit?: (score: number, total: number) => void;
}

export function SubtopicView({ subtopic, onQuizSubmit }: SubtopicViewProps) {
  return (
    <article className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-zinc-100">{subtopic.title}</h2>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          In plain language
        </h3>
        <p className="text-zinc-200">{subtopic.plainExplanation}</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Everyday examples
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-zinc-300">
          {subtopic.examples.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul>
      </section>

      {subtopic.nuances.length > 0 && (
        <section className="rounded-lg border border-aanu-warn/40 bg-aanu-warn/10 p-4">
          <h3 className="mb-2 text-sm font-semibold text-aanu-warn">Don't miss this</h3>
          <ul className="list-disc space-y-1 pl-5 text-zinc-200">
            {subtopic.nuances.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <details className="rounded-lg bg-aanu-surface p-4">
        <summary className="cursor-pointer text-sm font-medium text-aanu-accent">
          View original source excerpt
        </summary>
        <p className="mt-3 text-sm text-zinc-400">{subtopic.sourceExcerpt}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
          {subtopic.originalPoints.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </details>

      <FlagSubtopic subtopicTitle={subtopic.title} />

      <QuizBlock questions={subtopic.quiz} onSubmit={onQuizSubmit} />
    </article>
  );
}
