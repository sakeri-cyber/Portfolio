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
                  {/* Notebook page card */}
                  <Link href={`/research/${p.id}`}
                    className="group relative block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(251,146,60,0.1)]"
                    style={{
                      borderRadius: "2px 12px 12px 12px",
                      border: `1px solid rgba(251,146,60,0.2)`,
                      borderLeft: "none",
                      background: `repeating-linear-gradient(transparent 0px, transparent 27px, rgba(251,146,60,0.055) 27px, rgba(251,146,60,0.055) 28px), #0d0a06`,
                      clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)",
                    }}>
                    {/* Dog-ear fold */}
                    <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
                      style={{ background: `linear-gradient(225deg, rgba(251,146,60,0.3) 50%, transparent 50%)` }} />
                    {/* Spiral binding strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-around py-5"
                      style={{ background: "rgba(0,0,0,0.28)", borderRight: `1px solid rgba(251,146,60,0.12)` }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border-2"
                          style={{ borderColor: `rgba(251,146,60,0.38)`, background: "#050a12" }} />
                      ))}
                    </div>
                    {/* Left margin rule */}
                    <div className="absolute left-10 top-0 bottom-0 w-px opacity-40"
                      style={{ background: ACCENT_READ }} />
                    {/* Content */}
                    <div className="pl-14 pr-5 py-5">
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${ACCENT_READ}90` }}>
                        {p.venue} · {p.year}
                      </div>
                      <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors mb-2 leading-snug">{p.title}</div>
                      <p className="text-sm text-white/55 leading-relaxed mb-4">{p.summary}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.tags.map(t => (
                          <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{ background: `${ACCENT_READ}0f`, border: `1px solid ${ACCENT_READ}25`, color: `${ACCENT_READ}cc` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: `${ACCENT_READ}70` }}>Read my notes →</span>
                    </div>
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
                  {/* Code editor window card */}
                  <Link href={`/research/${p.id}`}
                    className="group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(96,165,250,0.1)]"
                    style={{ borderRadius: "10px", border: `1px solid rgba(96,165,250,0.2)`, background: "#080c12" }}>
                    {/* Editor title bar */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                      style={{ background: "rgba(96,165,250,0.04)", borderColor: "rgba(96,165,250,0.12)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,95,87,0.55)" }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,189,46,0.55)" }} />
                        <div className="w-2.5 h-2.5 rounded-full group-hover:opacity-100 opacity-55 transition-opacity duration-300" style={{ background: ACCENT_IMPL }} />
                      </div>
                      <div className="font-mono text-xs ml-2" style={{ color: "rgba(96,165,250,0.35)" }}>
                        {p.id}.py
                      </div>
                    </div>
                    {/* Line-number gutter + content */}
                    <div className="flex">
                      <div className="flex-shrink-0 w-9 py-4 flex flex-col items-end pr-2 gap-[18px] select-none"
                        style={{ background: "rgba(96,165,250,0.02)", borderRight: "1px solid rgba(96,165,250,0.08)" }}>
                        {[1,2,3,4,5,6,7].map(n => (
                          <div key={n} className="font-mono text-[10px] leading-none" style={{ color: "rgba(96,165,250,0.22)" }}>{n}</div>
                        ))}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="font-mono text-xs mb-3" style={{ color: "rgba(96,165,250,0.45)" }}>
                          # {p.venue} · {p.year}
                        </div>
                        <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors mb-2 leading-snug">{p.title}</div>
                        <p className="text-sm text-white/55 leading-relaxed mb-4">{p.summary}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {p.tags.map(t => (
                            <span key={t} className="text-xs font-mono px-2 py-0.5 rounded"
                              style={{ background: `${ACCENT_IMPL}0c`, border: `1px solid ${ACCENT_IMPL}20`, color: `${ACCENT_IMPL}bb` }}>
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="font-mono text-xs" style={{ color: `${ACCENT_IMPL}55` }}>
                          See implementation →
                        </div>
                      </div>
                    </div>
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
