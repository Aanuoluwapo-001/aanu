import { BookOpenCheck, Layers, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Topic by topic, nothing skipped",
    description:
      "Aanu breaks your document into topics and subtopics that mirror its own structure — no detail glossed over, no shortcuts.",
  },
  {
    icon: Sparkles,
    title: "Explained like a patient teacher",
    description:
      "Every subtopic gets a plain-language explanation, 2–3 everyday examples, and a 'don't miss this' callout for the tricky parts.",
  },
  {
    icon: BookOpenCheck,
    title: "Prove it with a quiz",
    description:
      "A short quiz after every subtopic, with real feedback — so you know you actually understood it, not just skimmed it.",
  },
  {
    icon: ShieldCheck,
    title: "Always traceable to the source",
    description:
      "Every explanation links back to the original excerpt it came from, so you can double-check the AI against your real document.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-aanu-bg text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-28 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(94,234,212,0.15),transparent_60%)]"
        />
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-aanu-accent">
          For students who want to actually understand it
        </p>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Upload it. <span className="text-aanu-accent">Understand it.</span> Keep it.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Drop in your lecture notes, a textbook chapter, or a past-question PDF.
          Aanu re-teaches it back to you in plain language — then quizzes you
          until it sticks.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-aanu-accent px-6 py-3 font-semibold text-aanu-bg transition hover:bg-aanu-accentDark"
          >
            Get started free
          </a>
          <a
            href="/demo"
            className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:border-aanu-accent hover:text-aanu-accent"
          >
            See a sample document
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="text-aanu-accent hover:underline">
            Log in
          </a>
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl bg-aanu-surface p-6">
            <div className="mb-4 inline-flex rounded-lg bg-aanu-accent/10 p-3 text-aanu-accent">
              <Icon size={24} aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
          </div>
        ))}
      </section>

      {/* Honesty note — matches Aanu's brand voice: warm, never overselling AI */}
      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <p className="text-sm text-zinc-500">
          Aanu's explanations are AI-generated. Every subtopic links back to
          the original excerpt it came from, so you can always check the
          simplified version against your real document.
        </p>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-xs text-zinc-600">
        Aanu — built as a learning project.
      </footer>
    </main>
  );
}
