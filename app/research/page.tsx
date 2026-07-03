"use client";
import Link from "next/link";
import { PAPERS } from "@/lib/research";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

const ACCENT_READ = "#fb923c";
const ACCENT_IMPL = "#60a5fa";

export default function ResearchPage() {
  const reading = PAPERS.filter(p => p.track === "reading");
  const impl    = PAPERS.filter(p => p.track === "impl");

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 85% 0%, #1a0d06 0%, #100805 65%)" }}>
      <div className="max-w-5xl mx-auto px-6 py-16">

        <FadeIn direction="up">
          <div className="mb-2 font-mono text-sm" style={{ color: `${ACCENT_READ}60` }}>research /</div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Research &amp; Papers</h1>
          <p className="text-base text-white/60 mb-6 max-w-2xl leading-relaxed">
            Two tracks: critical reading and commentary on influential papers, and ground-up implementations that go from PDF to working optimised code.
          </p>
        </FadeIn>

        {/* Legend */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-6 mb-14">
            <div className="flex items-center gap-2.5 text-sm text-white/55">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: `${ACCENT_READ}50` }} />
              <span className="font-semibold" style={{ color: ACCENT_READ }}>Paper Club</span>
              — I read, critique, and discuss the idea
            </div>
            <div className="flex items-center gap-2.5 text-sm text-white/55">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: `${ACCENT_IMPL}50` }} />
              <span className="font-semibold" style={{ color: ACCENT_IMPL }}>Implementations</span>
              — I build it from scratch, nuts to bolts
            </div>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Reading column */}
          <div>
            <FadeIn delay={0.1}>
              <div className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: ACCENT_READ }}>
                <span>📖</span> Paper Club · Critical Reading
              </div>
            </FadeIn>
            <StaggerChildren className="flex flex-col gap-4" stagger={0.1} delay={0.15}>
              {reading.map(p => (
                <StaggerItem key={p.id}>
                  <Link href={`/research/${p.id}`}
                    className="group block rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: `${ACCENT_READ}06`, borderColor: `${ACCENT_READ}18` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT_READ}45`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT_READ}18`}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${ACCENT_READ}90` }}>
                      {p.venue} · {p.year}
                    </div>
                    <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors mb-2 leading-snug">{p.title}</div>
                    <p className="text-sm text-white/55 leading-relaxed mb-4">{p.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map(t => (
                        <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: `${ACCENT_READ}0f`, border: `1px solid ${ACCENT_READ}25`, color: `${ACCENT_READ}cc` }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: `${ACCENT_READ}70` }}>Read my notes →</span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>

          {/* Implementation column */}
          <div>
            <FadeIn delay={0.15}>
              <div className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: ACCENT_IMPL }}>
                <span>⚙️</span> Implementations · Nuts &amp; Bolts
              </div>
            </FadeIn>
            <StaggerChildren className="flex flex-col gap-4" stagger={0.1} delay={0.2}>
              {impl.map(p => (
                <StaggerItem key={p.id}>
                  <Link href={`/research/${p.id}`}
                    className="group block rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: `${ACCENT_IMPL}06`, borderColor: `${ACCENT_IMPL}18` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT_IMPL}45`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT_IMPL}18`}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${ACCENT_IMPL}90` }}>
                      {p.venue} · {p.year}
                    </div>
                    <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors mb-2 leading-snug">{p.title}</div>
                    <p className="text-sm text-white/55 leading-relaxed mb-4">{p.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map(t => (
                        <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: `${ACCENT_IMPL}0f`, border: `1px solid ${ACCENT_IMPL}25`, color: `${ACCENT_IMPL}cc` }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: `${ACCENT_IMPL}70` }}>See implementation →</span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </div>
    </div>
  );
}
