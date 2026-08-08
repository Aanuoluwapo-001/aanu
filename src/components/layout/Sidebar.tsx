"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Library,
  Upload,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
} from "lucide-react";
import { socialLinks } from "@/config/social";

const NAV_LINKS = [
  { href: "/library", label: "Your documents", icon: Library },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/demo", label: "Sample document", icon: Sparkles },
];

const SOCIAL_ITEMS = [
  { key: "github", href: socialLinks.github, label: "GitHub", icon: Github },
  { key: "twitter", href: socialLinks.twitter, label: "X / Twitter", icon: Twitter },
  { key: "linkedin", href: socialLinks.linkedin, label: "LinkedIn", icon: Linkedin },
  { key: "instagram", href: socialLinks.instagram, label: "Instagram", icon: Instagram },
  {
    key: "email",
    href: socialLinks.email ? `mailto:${socialLinks.email}` : null,
    label: "Email",
    icon: Mail,
  },
].filter((item) => item.href);

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger toggle — fixed top-left, always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-40 rounded-md bg-aanu-surface p-2 text-zinc-200 hover:text-aanu-accent"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50"
        />
      )}

      {/* Slide-in panel */}
      <aside
        aria-label="Main menu"
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col justify-between bg-aanu-surface p-5 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-8 flex items-center justify-between">
            <a href="/library" className="text-lg font-bold text-aanu-accent">
              Aanu
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Primary">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-aanu-bg hover:text-aanu-accent"
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {SOCIAL_ITEMS.length > 0 && (
          <div className="border-t border-zinc-700 pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Contact / follow
            </p>
            <ul className="flex flex-col gap-1">
              {SOCIAL_ITEMS.map(({ key, href, label, icon: Icon }) => (
                <li key={key}>
                  <a
                    href={href!}
                    target={key === "email" ? undefined : "_blank"}
                    rel={key === "email" ? undefined : "noopener noreferrer"}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-aanu-bg hover:text-aanu-accent"
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
}
