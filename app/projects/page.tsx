"use client";
import { useState } from "react";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { StaggerChildren, StaggerItem, FadeIn } from "@/components/Motion";

const ACCENT = "#34d399";
const FILTERS = ["All", "ML Systems", "Research", "RAG / LLM", "RL / Agents"];

export default function ProjectsPage() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? PROJECTS : PROJECTS.filter(p => p.categories.includes(active));

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, #061a12 0%, #030d09 65%)" }}>
      <div className="max-w-4xl mx-auto px-6 py-16">

        <FadeIn direction="up">
          <div className="mb-2 font-mono text-sm" style={{ color: `${ACCENT}60` }}>projects /</div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Engineering Projects</h1>
          <p className="text-base text-white/60 mb-10 max-w-xl leading-relaxed">
            End-to-end builds ranging from multi-agent systems research to production retrieval pipelines. Each project is fully implemented and documented.
          </p>
        </FadeIn>

        {/* Filter bar */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-12">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActive(f)}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200"
                style={{
                  borderColor: active === f ? ACCENT : "rgba(255,255,255,0.12)",
                  background:  active === f ? `${ACCENT}18` : "transparent",
                  color:       active === f ? ACCENT : "rgba(255,255,255,0.5)",
                }}>
                {f}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Project cards — each links to detail page */}
        <StaggerChildren className="flex flex-col gap-5" stagger={0.1}>
          {visible.map(p => (
            <StaggerItem key={p.id}>
              <Link href={`/projects/${p.id}`}
                className="group block rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(52,211,153,0.08)]"
                style={{ background: "rgba(52,211,153,0.03)", borderColor: "rgba(52,211,153,0.12)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${p.accent}45`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.12)"}>

                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.badge}</span>
                  <span className="font-mono text-xs text-white/35">{p.date}</span>
                </div>

                <h2 className="text-xl font-bold text-white/90 group-hover:text-white transition-colors mb-2">{p.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed mb-5">{p.tldr}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {p.chips.map(c => (
                    <span key={c} className="px-2.5 py-1 rounded-full font-mono text-xs border"
                      style={{ background: `${p.accent}0c`, borderColor: `${p.accent}25`, color: `${p.accent}cc` }}>
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: `${p.accent}80` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = p.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${p.accent}80`}>
                  Read full writeup →
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Video note */}
        <FadeIn delay={0.2}>
          <div className="mt-14 rounded-xl p-5 border" style={{ background: `${ACCENT}06`, borderColor: `${ACCENT}20` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Coming Soon: Project Demo Videos</div>
            <p className="text-sm text-white/50 leading-relaxed">
              Short 2–3 min demo videos will be added per project. Format: problem statement → architecture walkthrough → live demo → results. Recording via Loom for clean embeds directly on each project page.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
