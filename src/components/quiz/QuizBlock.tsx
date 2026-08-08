"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/fixtures/sample-document";

export function QuizBlock({
  questions,
  onSubmit,
}: {
  questions: QuizQuestion[];
  onSubmit?: (score: number, total: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce(
    (total, q, i) => total + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmit() {
    setSubmitted(true);
    onSubmit?.(score, questions.length);
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="rounded-xl bg-aanu-surface p-6">
      <h3 className="mb-4 text-lg font-semibold text-aanu-accent">Quick check</h3>

      {questions.map((q, qi) => (
        <fieldset key={qi} className="mb-6 border-none p-0">
          <legend className="mb-2 font-medium text-zinc-100">
            {qi + 1}. {q.question}
          </legend>
          <div className="flex flex-col gap-2">
            {q.options.map((option, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = oi === q.correctIndex;
              let stateClasses = "border-zinc-700 bg-aanu-bg";
              if (submitted && isSelected && isCorrect) stateClasses = "border-green-500 bg-green-950";
              else if (submitted && isSelected && !isCorrect) stateClasses = "border-red-500 bg-red-950";
              else if (submitted && isCorrect) stateClasses = "border-green-500";
              else if (isSelected) stateClasses = "border-aanu-accent bg-aanu-bg";

              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => selectAnswer(qi, oi)}
                  disabled={submitted}
                  aria-pressed={isSelected}
                  className={`rounded-md border px-4 py-2 text-left text-sm text-zinc-200 transition ${stateClasses}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p className="mt-2 text-sm text-zinc-400">
              <span className={answers[qi] === q.correctIndex ? "text-green-400" : "text-red-400"}>
                {answers[qi] === q.correctIndex ? "Correct. " : "Not quite. "}
              </span>
              {q.explanation}
            </p>
          )}
        </fieldset>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="rounded-md bg-aanu-accent px-4 py-2 font-semibold text-aanu-bg disabled:opacity-50"
        >
          Check answers
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-zinc-200" aria-live="polite">
            Score: <span className="font-semibold text-aanu-accent">{score}</span> / {questions.length}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-md border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:border-aanu-accent hover:text-aanu-accent"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
