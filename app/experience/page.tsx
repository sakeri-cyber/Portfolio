"use client";
import { useEffect, useRef, useState } from "react";

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => setWidth(pct), 100);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} className="h-1 rounded-full overflow-hidden mt-1" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
    </div>
  );
}

const ROLES = [
  {
    role: "AI Engineer · Research Assistant",
    company: "University of Birmingham",
    location: "Birmingham, UK (Remote)",
    date: "Feb 2026 – Apr 2026",
    summary: "Re-architected a biomedical AI assistant that was timing out on API calls and haemorrhaging LLM token costs due to raw context transfer.",
    bullets: [
      { text: "Async job queue + email notification system to prevent API gateway timeouts; migrated Node.js backend to Django for a cleaner async model." },
      { text: "Claude 3.5 Sonnet semantic router to classify queries and dispatch between a Neo4j knowledge graph and the BIOMNI biomedical agent — eliminating hard-coded keyword routing." },
      { text: "Dynamic schema pruning + TOON compression on Neo4j context payloads — reduced token costs by 90% and cut latency from 2 minutes to 15 seconds.", highlight: "90% token cost reduction" },
      { text: "LLM-as-judge few-shot testing pipeline: synthetic evaluation dataset and production quality gate; designed for future REINFORCE fine-tuning of local models." },
    ],
    metrics: [{ label: "Token cost reduction", pct: 90 }, { label: "Latency: 2min → 15s", pct: 87 }],
    tags: ["Claude 3.5 Sonnet", "Neo4j", "Django", "LLM-as-Judge", "TOON Compression", "Async Python"],
  },
  {
    role: "Machine Learning Engineer",
    company: "Sharechat (Mohalla Tech)",
    location: "Livestream Team · Bangalore, India",
    date: "Apr 2023 – Jul 2024",
    summary: "Owned the full ML lifecycle for the Livestream notification stack — from feature engineering to model training to production inference — on a platform with 180M+ MAU.",
    bullets: [
      { text: "XGBoost notification ranking system: engineered custom user-content affinity features and conducted A/B tests yielding a 17% CTR gain and 2.75% lift in user time spent.", highlight: "17% CTR gain" },
      { text: "Go monolith migration: moved inference models from Python/FastAPI microservices to a GoLang monolith, reducing median inference latency by 87% by eliminating Python GIL contention and HTTP overhead.", highlight: "87% latency reduction" },
      { text: "Data integrity infrastructure: aggregated model features using Tardis; built Redash dashboards and Monte Carlo-powered Slack alerting — maintained 95% data integrity across training pipelines.", highlight: "95% data integrity" },
      { text: "Training pipeline monitoring: set up observability for model drift, feature distribution shifts, and inference latency regressions." },
    ],
    metrics: [{ label: "Latency reduction (Python → Go)", pct: 87 }, { label: "CTR gain", pct: 17 }, { label: "Data integrity", pct: 95 }],
    tags: ["XGBoost", "GoLang", "FastAPI", "A/B Testing", "Tardis", "Monte Carlo", "Redash"],
  },
  {
    role: "Analyst — Product & Strategy",
    company: "Sharechat (Mohalla Tech)",
    location: "Livestream Team · Bangalore, India",
    date: "Oct 2021 – Apr 2023",
    summary: "First role post-IIT Kanpur. Drove quantitative product strategy for the Livestream team across 14 languages for a team of 100+ members.",
    bullets: [
      { text: "Advanced A/B testing framework: designed and executed large-scale experiments using Eppo and BigQuery, driving product launches and go-to-market strategy." },
      { text: "User profitability analysis: evaluated interaction patterns to optimise content discovery, reducing churn among power users and driving a 12% growth in GMV.", highlight: "12% GMV growth" },
      { text: "Self-serve dashboarding: built Redash dashboards that enabled non-technical stakeholders to slice product metrics without engineering support." },
      { text: "Cross-functional campaign analytics: collaborated with marketing and sales teams using Retool and Postman to enable data-backed campaign strategies." },
    ],
    metrics: [{ label: "GMV / revenue growth", pct: 12 }],
    tags: ["BigQuery", "Eppo", "Redash", "Retool", "Product Strategy", "Quantitative Analysis"],
  },
];

const ACCENT = "#a78bfa";

export default function ExperiencePage() {
  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 85% 0%, #12102a 0%, #080613 65%)" }}>
      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="mb-2 font-mono text-xs" style={{ color: `${ACCENT}60` }}>experience /</div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Professional Journey</h1>
        <p className="text-sm text-white/40 mb-12 max-w-xl">
          Three years building ML systems that serve hundreds of millions of users — from product analytics to production inference engines to LLM orchestration research.
        </p>

        {/* Timeline */}
        <div className="relative pl-6 border-l-2" style={{ borderColor: `${ACCENT}20` }}>
          {ROLES.map((role, i) => (
            <div key={i} className="relative mb-14 last:mb-0">
              {/* dot */}
              <div className="absolute -left-[1.45rem] top-1.5 w-3 h-3 rounded-full border-2"
                style={{ background: ACCENT, borderColor: ACCENT, boxShadow: `0 0 12px ${ACCENT}80` }} />

              <div className="rounded-xl p-6 transition-all duration-300"
                style={{ background: "rgba(167,139,250,0.025)", border: "1px solid rgba(167,139,250,0.1)" }}>
                {/* Header */}
                <div className="flex flex-wrap justify-between gap-2 mb-1">
                  <div>
                    <div className="font-bold text-base text-white">{role.role}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: ACCENT }}>{role.company}</div>
                    <div className="text-[11px] text-white/35 mt-0.5">{role.location}</div>
                  </div>
                  <div className="font-mono text-xs text-white/30 pt-0.5">{role.date}</div>
                </div>

                <p className="text-sm text-white/45 mt-3 mb-4 leading-relaxed">{role.summary}</p>

                {/* Bullets */}
                <ul className="flex flex-col gap-2 mb-5">
                  {role.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-sm text-white/55 leading-relaxed">
                      <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full" style={{ background: ACCENT }} />
                      <span>
                        {b.highlight
                          ? b.text.replace(b.highlight, `__BOLD__${b.highlight}__BOLD__`).split("__BOLD__").map((part, k) =>
                              k % 2 === 1 ? <strong key={k} className="text-white/80 font-semibold">{part}</strong> : part
                            )
                          : b.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Impact bars */}
                <div className="flex flex-col gap-2 mb-5">
                  {role.metrics.map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-[10px] text-white/30 mb-1">
                        <span>{m.label}</span><span>{m.pct}%</span>
                      </div>
                      <AnimatedBar pct={m.pct} color={ACCENT} />
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {role.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono"
                      style={{ background: `${ACCENT}0c`, border: `1px solid ${ACCENT}25`, color: ACCENT }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mt-16">
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: `${ACCENT}60` }}>Education</h2>

          <div className="flex flex-col gap-4">
            {[
              {
                degree: "Joint MSc · Data Science and Artificial Intelligence",
                inst: "IIT Madras × University of Birmingham",
                meta: "2024 – Jan 2026 · Grade: Distinction · Supervisor: Dr. Yue Feng",
                detail: "Dissertation: Co-Adaptive Allocation Framework (CODAF) — A novel GNN + MARL framework for dynamic task allocation in multi-agent systems, evaluated on Microsoft's SDBench medical diagnosis benchmark. Achieved 80.0% DSR (vs. 77.5% static baseline), 88.8% Oracle reasoning accuracy, and a 40% reduction in diagnostic path cost.",
                tags: ["PyTorch Geometric", "GraphSAGE", "REINFORCE", "LLM-as-Judge", "Multi-Agent Systems"],
              },
              {
                degree: "B.Tech · Chemical Engineering",
                inst: "Indian Institute of Technology, Kanpur",
                meta: "2016 – 2021 · GPA: 6.94 / 10",
                detail: null,
                tags: [],
              },
            ].map(e => (
              <div key={e.inst} className="rounded-r-xl pl-4 pr-5 py-4"
                style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15`, borderLeft: `3px solid ${ACCENT}60` }}>
                <div className="font-bold text-sm text-white/80">{e.degree}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: ACCENT }}>{e.inst}</div>
                <div className="font-mono text-[10px] text-white/30 mt-1">{e.meta}</div>
                {e.detail && <p className="text-xs text-white/40 mt-2 leading-relaxed">{e.detail}</p>}
                {e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {e.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono"
                        style={{ background: `${ACCENT}0c`, border: `1px solid ${ACCENT}25`, color: ACCENT }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-14">
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: `${ACCENT}60` }}>Achievements</h2>
          <div className="flex flex-col gap-3">
            {[
              "2nd Place — BEAR Challenge HPC Competition, University of Birmingham (hosted by NVIDIA)",
              "National Winner — Abacus & Mental Maths; represented India at the International Stage, Singapore",
              "Multi-event winner — Stage and Street Play Dramatics at national-level inter-college events across India",
            ].map(a => (
              <div key={a} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                <span style={{ color: ACCENT }}>★</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
