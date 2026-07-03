import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Rohan Sakeri — ML Engineer",
  description: "Machine Learning Engineer — Recommender Systems, LLM Orchestration, and Production AI at Scale.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-white/25 font-mono">
          © 2026 Rohan Sakeri · Built with Next.js + Framer Motion
        </footer>
      </body>
    </html>
  );
}
