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

        {/* Project cards — terminal window style */}
        <StaggerChildren className="flex flex-col gap-5" stagger={0.1}>
          {visible.map(p => (
            <StaggerItem key={p.id}>
              <Link href={`/projects/${p.id}`}
                className="group block overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                style={{ borderRadius: "10px", background: "#070d0a", border: `1px solid ${p.accent}22` }}>

                {/* Terminal title bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{ background: "rgba(255,255,255,0.025)", borderColor: `${p.accent}12` }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full transition-all duration-200 group-hover:opacity-100 opacity-60"
                      style={{ background: "#ff5f56" }} />
                    <div className="w-2.5 h-2.5 rounded-full transition-all duration-200 group-hover:opacity-100 opacity-60"
                      style={{ background: "#ffbd2e" }} />
                    <div className="w-2.5 h-2.5 rounded-full transition-all duration-200 group-hover:opacity-100 opacity-60"
                      style={{ background: p.accent }} />
                  </div>
                  <div className="font-mono text-xs text-white/20 ml-1.5">~/projects/{p.id}</div>
                  <div className="ml-auto font-mono text-xs text-white/20">{p.date}</div>
                </div>

                {/* Terminal body */}
                <div className="p-6">
                  <div className="font-mono text-xs mb-3" style={{ color: `${p.accent}65` }}>
                    $ cat README.md
                  </div>
                  <div className="font-mono text-[11px] mb-1 uppercase tracking-wider" style={{ color: `${p.accent}55` }}>
                    [{p.badge}]
                  </div>
                  <h2 className="text-xl font-bold text-white/90 group-hover:text-white transition-colors mb-2">{p.title}</h2>
                  <p className="text-sm text-white/55 leading-relaxed mb-5">{p.tldr}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.chips.map(c => (
                      <span key={c} className="px-2.5 py-0.5 rounded font-mono text-xs border"
                        style={{ background: `${p.accent}08`, borderColor: `${p.accent}1e`, color: `${p.accent}aa` }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs" style={{ color: `${p.accent}55` }}>
                    <span>$</span>
                    <span>Read full writeup</span>
                    <span className="inline-block w-1.5 h-3.5 align-middle animate-pulse" style={{ background: `${p.accent}70` }} />
                  </div>
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
