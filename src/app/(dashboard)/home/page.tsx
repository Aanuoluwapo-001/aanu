import { redirect } from "next/navigation";
import { Library, Upload, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const QUICK_LINKS = [
  { href: "/library", label: "Your documents", icon: Library, description: "See everything you've uploaded and its progress." },
  { href: "/upload", label: "Upload something new", icon: Upload, description: "Add a document, image, or handout to re-teach." },
  { href: "/demo", label: "Try a sample document", icon: Sparkles, description: "See how Aanu explains and quizzes on a worked example." },
];

/**
 * The logged-in dashboard home — distinct from the public marketing
 * landing page at "/". This page never shows login/signup CTAs, since
 * anyone here is already authenticated.
 */
export default async function DashboardHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-8">
      <div>
        <p className="text-sm text-zinc-500">Welcome back</p>
        <h1 className="text-2xl font-bold text-aanu-accent">{user.email}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map(({ href, label, icon: Icon, description }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-xl bg-aanu-surface p-5 transition hover:ring-1 hover:ring-aanu-accent"
          >
            <div className="inline-flex w-fit rounded-lg bg-aanu-accent/10 p-2 text-aanu-accent">
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-zinc-100">{label}</p>
              <p className="mt-1 text-sm text-zinc-400">{description}</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
