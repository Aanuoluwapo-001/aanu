"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "check-email">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("check-email");
  }

  if (status === "check-email") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-bold text-aanu-accent">Check your email</h1>
        <p className="max-w-sm text-sm text-zinc-400">
          We sent a confirmation link to <span className="text-zinc-200">{email}</span>.
          Click it to finish creating your account.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-aanu-surface p-6 shadow-lg"
        aria-labelledby="signup-heading"
      >
        <h1 id="signup-heading" className="mb-6 text-2xl font-bold text-aanu-accent">
          Create your Aanu account
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
          minLength={6}
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
          {status === "loading" ? "Creating account…" : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="text-aanu-accent hover:underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
