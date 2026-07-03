"use client";
import Link from "next/link";
import { type Project } from "@/lib/projects";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

export default function ProjectDetail({ project }: { project: Project }) {
  const a = project.accent;

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 0%, #061a12 0%, #030d09 60%)" }}>
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Breadcrumb */}
        <FadeIn direction="left" delay={0}>
          <div className="flex items-center gap-2 text-sm mb-10">
            <Link href="/projects" className="transition-colors" style={{ color: `${a}80` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = a}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${a}80`}>
              ← Projects
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/55">{project.title}</span>
          </div>
        </FadeIn>

        {/* Header */}
        <FadeIn direction="up" delay={0.05}>
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ color: a, borderColor: `${a}40`, background: `${a}10` }}>
                {project.badge}
              </span>
              <span className="font-mono text-sm text-white/50">{project.date}</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">{project.title}</h1>
            <p className="text-lg text-white/70 leading-relaxed border-l-2 pl-4" style={{ borderColor: `${a}50` }}>
              {project.tldr}
            </p>
          </div>
        </FadeIn>

        {/* Tech stack */}
        <FadeIn delay={0.1}>
          <div className="mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.chips.map(c => (
                <span key={c} className="px-3 py-1 rounded-full font-mono text-sm border"
                  style={{ background: `${a}0c`, borderColor: `${a}30`, color: `${a}dd` }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Links */}
        <FadeIn delay={0.12}>
          <div className="flex gap-3 mb-14 flex-wrap">
            {project.videoUrl && (
              <a href={project.videoUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: a, color: "#000" }}>
                ▶ Watch Demo
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200"
                style={{ borderColor: `${a}40`, color: a }}>
                View on GitHub ↗
              </a>
            )}
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="h-px w-full mb-14" style={{ background: `linear-gradient(90deg, ${a}30, transparent)` }} />

        {/* Content sections */}
        <StaggerChildren stagger={0.12} delay={0.1}>
          {project.sections.map((section, i) => (
            <StaggerItem key={i}>
              <div className="mb-14">
                <h2 className="text-xl font-bold text-white mb-4">{section.heading}</h2>

                {section.body && (
                  <div className="text-base text-white/70 leading-relaxed whitespace-pre-line mb-6">
                    {section.body}
                  </div>
                )}

                {section.code && (
                  <div className="rounded-xl overflow-hidden border mb-6" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#080e08" }}>
                    <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a120a" }}>
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/60" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <span className="w-3 h-3 rounded-full bg-green-500/60" />
                      </div>
                      <span className="font-mono text-xs text-white/35 ml-2">{section.code.title}</span>
                    </div>
                    <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto" style={{ color: "#86efac" }}>
                      {section.code.code}
                    </pre>
                  </div>
                )}

                {section.table && (
                  <div className="overflow-x-auto rounded-xl border mb-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: `${a}0c`, borderBottom: `1px solid ${a}25` }}>
                          {section.table.headers.map(h => (
                            <th key={h} className="px-5 py-3 text-left font-semibold text-sm" style={{ color: a }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-5 py-3 text-sm leading-relaxed"
                                style={{ color: ci === row.length - 1 ? `${a}dd` : "rgba(255,255,255,0.65)" }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.note && (
                  <div className="rounded-lg px-5 py-4 text-sm text-white/72 leading-relaxed border-l-2"
                    style={{ background: `${a}08`, borderColor: `${a}40` }}>
                    <span className="font-semibold" style={{ color: a }}>Note: </span>{section.note}
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Footer nav */}
        <div className="pt-8 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link href="/projects" className="text-sm font-semibold transition-colors" style={{ color: `${a}80` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = a}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${a}80`}>
            ← All Projects
          </Link>
          <Link href="/research" className="text-sm font-semibold transition-colors text-white/45 hover:text-white/75">
            Research →
          </Link>
        </div>
      </div>
    </div>
  );
}
