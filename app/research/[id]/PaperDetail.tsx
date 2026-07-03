"use client";
import Link from "next/link";
import { type Paper } from "@/lib/research";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

export default function PaperDetail({ paper }: { paper: Paper }) {
  const isImpl   = paper.track === "impl";
  const accent   = isImpl ? "#60a5fa" : "#fb923c";
  const trackBg  = isImpl ? "#0a0e18" : "#180d06";
  const trackLabel = isImpl ? "⚙️ Implementation · Nuts & Bolts" : "📖 Paper Club · Critical Reading";

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(ellipse 80% 50% at 80% 0%, ${isImpl ? "#060c1a" : "#1a0d06"} 0%, ${isImpl ? "#030712" : "#100805"} 60%)` }}>
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Breadcrumb */}
        <FadeIn direction="left">
          <div className="flex items-center gap-2 text-sm mb-10">
            <Link href="/research" className="transition-colors" style={{ color: `${accent}70` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = accent}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${accent}70`}>
              ← Research
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/55 truncate max-w-xs">{paper.title}</span>
          </div>
        </FadeIn>

        {/* Header */}
        <FadeIn direction="up" delay={0.05}>
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}>
                {trackLabel}
              </span>
              <span className="font-mono text-sm text-white/50">{paper.venue} · {paper.year}</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">{paper.title}</h1>
            <p className="text-lg text-white/75 leading-relaxed border-l-2 pl-4" style={{ borderColor: `${accent}50` }}>
              {paper.summary}
            </p>
          </div>
        </FadeIn>

        {/* Tags */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-14">
            {paper.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full font-mono text-sm border"
                style={{ background: `${accent}0c`, borderColor: `${accent}30`, color: `${accent}cc` }}>
                {t}
              </span>
            ))}
          </div>
        </FadeIn>

        <div className="h-px mb-14" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />

        {/* Sections */}
        <StaggerChildren stagger={0.12} delay={0.1}>
          {paper.sections.map((section, i) => (
            <StaggerItem key={i}>
              <div className="mb-14">
                <h2 className="text-xl font-bold text-white mb-4">{section.heading}</h2>

                <div className="text-base text-white/70 leading-relaxed whitespace-pre-line mb-6">
                  {section.body}
                </div>

                {section.code && (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.08)", background: trackBg }}>
                    <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/50" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <span className="w-3 h-3 rounded-full bg-green-500/50" />
                      </div>
                      <span className="font-mono text-xs text-white/50 ml-2">{section.code.title}</span>
                    </div>
                    <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto"
                      style={{ color: isImpl ? "#93c5fd" : "#fcd34d" }}>
                      {section.code.code}
                    </pre>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Footer */}
        <div className="pt-8 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link href="/research" className="text-sm font-semibold transition-colors" style={{ color: `${accent}70` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = accent}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${accent}70`}>
            ← All Research
          </Link>
        </div>
      </div>
    </div>
  );
}
