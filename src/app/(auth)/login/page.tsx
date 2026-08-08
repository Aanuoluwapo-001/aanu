"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/library");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-aanu-surface p-6 shadow-lg"
        aria-labelledby="login-heading"
      >
        <h1 id="login-heading" className="mb-6 text-2xl font-bold text-aanu-accent">
          Log in to Aanu
        </h1>

        <label htmlFor="email" className="mb-1 block text-sm text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-zinc-700 bg-aanu-bg px-3 py-2 text-zinc-100 focus:border-aanu-accent focus:outline-none"
        />

        <label htmlFor="password" className="mb-1 block text-sm text-zinc-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-zinc-700 bg-aanu-bg px-3 py-2 text-zinc-100 focus:border-aanu-accent focus:outline-none"
        />

        {status === "error" && errorMessage && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-aanu-accent px-4 py-2 font-semibold text-aanu-bg transition hover:bg-aanu-accentDark disabled:opacity-60"
        >
          {status === "loading" ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          No account yet?{" "}
          <a href="/signup" className="text-aanu-accent hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
