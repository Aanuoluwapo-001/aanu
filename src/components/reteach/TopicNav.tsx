"use client";

import type { Topic } from "@/fixtures/sample-document";

interface TopicNavProps {
  topics: Topic[];
  activeSubtopicId: string;
  onSelect: (subtopicId: string) => void;
}

export function TopicNav({ topics, activeSubtopicId, onSelect }: TopicNavProps) {
  return (
    <nav aria-label="Document topics" className="flex flex-col gap-4">
      {topics.map((topic) => (
        <div key={topic.id}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {topic.title}
          </p>
          <ul className="flex flex-col gap-1">
            {topic.subtopics.map((sub) => {
              const isActive = sub.id === activeSubtopicId;
              return (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(sub.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "bg-aanu-accent text-aanu-bg font-medium"
                        : "text-zinc-300 hover:bg-aanu-surface"
                    }`}
                  >
                    {sub.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
