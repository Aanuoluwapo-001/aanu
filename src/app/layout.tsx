import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aanu — Upload it. Understand it. Keep it.",
  description: "Upload any document and Aanu re-teaches it back to you in plain language, topic by topic, with a quiz after every part.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
