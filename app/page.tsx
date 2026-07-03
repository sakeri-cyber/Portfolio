"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

/* ── animated count-up ── */
function useCounter(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(step); else setVal(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { val, ref };
}

function Metric({ count, suffix, label, sub }: { count: number; suffix: string; label: string; sub: string }) {
  const { val, ref } = useCounter(count);
  return (
    <div ref={ref}
      className="relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 cursor-default group"
      style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.12)" }}>
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(90deg,transparent,#00e5ff,transparent)" }} />
      <div className="font-mono text-3xl font-bold text-cyan-400 leading-none">{val}{suffix}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/55">{label}</div>
      <div className="mt-1 font-mono text-xs text-white/35">{sub}</div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-block px-2.5 py-1 rounded-md font-mono text-xs border transition-all duration-200 cursor-default hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/[0.07]"
      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.70)" }}>
      {label}
    </span>
  );
}

const LINES = [
  "Building production ML pipelines since 2021",
  "Hybrid retrieval | LTR | Corrective RAG",
  "GNN + MARL for multi-agent systems",
  "87% latency reduction in production",
];

const STACK = [
  { group: "Core Languages",              chips: ["Python", "GoLang", "Rust", "C / C++", "SQL"] },
  { group: "AI · ML · Deep Learning",     chips: ["PyTorch", "Triton", "XGBoost", "LangGraph", "PyTorch Geometric", "SentenceTransformers", "DeepEval", "REINFORCE / MARL"] },
  { group: "Infrastructure · Data · MLOps", chips: ["FastAPI", "gRPC", "Docker", "Qdrant", "Elasticsearch", "Redis", "BigQuery", "Kafka", "Flink", "DuckDB", "PySpark"] },
  { group: "Quantitative · Analysis",     chips: ["A/B Testing", "Statistical Inference", "Time-Series Analysis", "Pandas / NumPy / SciPy", "Tableau · Redash"] },
];

const FEATURED = [
  { id: "codaf",         title: "CODAF — MSc Thesis",    tldr: "GNN + MARL for multi-agent task allocation",          stack: "PyG · GraphSAGE · REINFORCE · SDBench" },
  { id: "answer-engine", title: "Agentic Answer Engine",  tldr: "6-phase hybrid retrieval → LTR → CRAG streaming",     stack: "Qdrant · ES · XGBoost · Llama-3.3-70B" },
  { id: "papeer",        title: "Papeer",                 tldr: "Production agentic RAG with continuous DeepEval CI",  stack: "LangGraph · Qdrant · Tavily · SQLite" },
  { id: "bid-o-matic",   title: "Bid-O-Matic",            tldr: "GSP auction simulator with RL bid shading",           stack: "PySpark · XGBoost · DLRM · REINFORCE" },
];

export default function HomePage() {
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LINES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden"
      style={{ background: "radial-gradient(ellipse 100% 60% at 15% -5%, #0d2040 0%, #050a12 55%)" }}>

      {/* Aurora glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full"
          style={{ background: "#00e5ff", filter: "blur(100px)", opacity: 0.2, animation: "drift 12s ease-in-out infinite alternate" }} />
        <div className="absolute top-10 right-[-100px] w-[600px] h-[600px] rounded-full"
          style={{ background: "#1a4fff", filter: "blur(110px)", opacity: 0.14, animation: "drift 16s ease-in-out infinite alternate-reverse" }} />
        <div className="absolute bottom-[-100px] left-[30%] w-[500px] h-[500px] rounded-full"
          style={{ background: "#7c3aed", filter: "blur(130px)", opacity: 0.1, animation: "drift 22s ease-in-out infinite alternate" }} />
        <style>{`
          @keyframes drift {
            from { transform: translate(0,0) scale(1); }
            to   { transform: translate(70px, 50px) scale(1.18); }
          }
        `}</style>
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden
        style={{
          backgroundImage: "radial-gradient(rgba(0,229,255,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 30%, transparent 100%)",
        }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">

        {/* ── Hero ── */}
        <FadeIn direction="up">
          <div className="flex items-center gap-8 flex-wrap mb-12">
            <div className="relative flex-shrink-0">
              <Image src="/Github_Profile_Pic.png" alt="Rohan Sakeri" width={164} height={164}
                className="rounded-full object-cover"
                style={{ border: "2.5px solid #00e5ff", boxShadow: "0 0 40px rgba(0,229,255,0.18), 0 0 0 7px rgba(0,229,255,0.06)" }} />
              <span className="absolute bottom-2 right-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">Rohan Sakeri</h1>
              <div className="font-mono text-base text-cyan-400/80 mb-4">
                &gt; ML Engineer · LLM Orchestration · Recommender Systems
              </div>
              <div className="h-6 overflow-hidden mb-6">
                <div key={lineIdx} className="font-mono text-sm text-white/45">▸ {LINES[lineIdx]}</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/projects"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: "#00e5ff" }}>
                  View Projects
                </Link>
                <a href="mailto:rohan.sakeri17@gmail.com"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-cyan-400/10 active:scale-95"
                  style={{ borderColor: "rgba(0,229,255,0.35)", color: "#00e5ff" }}>
                  Contact Me
                </a>
                <a href="https://www.linkedin.com/in/rohan-sakeri-41062a1b5/" target="_blank" rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-white/5 active:scale-95"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}>
                  LinkedIn ↗
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* About */}
        <FadeIn delay={0.1}>
          <p className="text-base text-white/72 leading-relaxed max-w-3xl mb-14 pl-4"
            style={{ borderLeft: "2px solid rgba(0,229,255,0.25)" }}>
            Nearly 3 years of production experience at <strong className="text-white/85 font-semibold">Sharechat</strong> — a social platform with over{" "}
            <strong className="text-cyan-400 font-semibold">180 million monthly active users</strong>. Joint MSc in Data Science &amp; AI from{" "}
            <strong className="text-white/85 font-semibold">IIT Madras × University of Birmingham</strong> (Distinction). My work sits at the intersection of
            recommendation systems, LLM orchestration, and high-performance backend infrastructure.
          </p>
        </FadeIn>

        {/* Metrics */}
        <FadeIn>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5">Impact, By the Numbers</h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-16" stagger={0.07}>
          <StaggerItem><Metric count={87}  suffix="%" label="Latency Reduction" sub="Python → Go migration" /></StaggerItem>
          <StaggerItem><Metric count={17}  suffix="%" label="CTR Gain"          sub="XGBoost notification ranking" /></StaggerItem>
          <StaggerItem><Metric count={12}  suffix="%" label="Revenue Growth"    sub="GMV uplift · user profitability" /></StaggerItem>
          <StaggerItem><Metric count={90}  suffix="%" label="Token Cost Cut"    sub="TOON compression + schema pruning" /></StaggerItem>
          <StaggerItem><Metric count={200} suffix="ms" label="Retrieval Latency" sub="2-stage hybrid pipeline" /></StaggerItem>
        </StaggerChildren>

        {/* Tech Stack */}
        <FadeIn>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Technology Stack</h2>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-5 mb-16" stagger={0.08}>
          {STACK.map(({ group, chips }) => (
            <StaggerItem key={group}>
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{group}</div>
              <div className="flex flex-wrap gap-2">{chips.map(c => <Chip key={c} label={c} />)}</div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Featured Work */}
        <FadeIn>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Featured Work</h2>
        </FadeIn>
        <StaggerChildren className="grid sm:grid-cols-2 gap-4 mb-16" stagger={0.1}>
          {FEATURED.map(p => (
            <StaggerItem key={p.id}>
              <Link href={`/projects/${p.id}`}
                className="group relative rounded-2xl border p-5 flex flex-col gap-1 transition-all duration-300 hover:-translate-y-0.5 block"
                style={{ background: "rgba(0,229,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.25)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                <div className="font-bold text-base text-white/85 group-hover:text-white transition-colors">{p.title}</div>
                <div className="text-sm text-white/65 leading-relaxed">{p.tldr}</div>
                <div className="font-mono text-xs text-cyan-400/65 mt-1">{p.stack}</div>
                <div className="absolute right-4 top-4 text-white/20 group-hover:text-cyan-400/50 transition-colors text-sm">→</div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Education */}
        <FadeIn>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6">Education</h2>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-4 mb-14" stagger={0.1}>
          {[
            { degree: "Joint MSc · Data Science and Artificial Intelligence", inst: "IIT Madras × University of Birmingham", meta: "2024 – Jan 2026 · Grade: Distinction · Thesis: Co-Adaptive Allocation Framework (CODAF)" },
            { degree: "B.Tech · Chemical Engineering",                        inst: "Indian Institute of Technology, Kanpur", meta: "2016 – 2021 · GPA: 6.94 / 10" },
          ].map(e => (
            <StaggerItem key={e.inst}>
              <div className="rounded-r-xl pl-5 pr-5 py-4"
                style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid rgba(0,229,255,0.45)" }}>
                <div className="font-bold text-base text-white/85">{e.degree}</div>
                <div className="text-base text-cyan-400/80 font-medium mt-1">{e.inst}</div>
                <div className="font-mono text-xs text-white/50 mt-1.5">{e.meta}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Contact */}
        <FadeIn>
          <div className="text-center font-mono text-sm text-white/30">
            <span className="text-white/50">Let&apos;s talk:</span>{" "}
            <a href="mailto:rohan.sakeri17@gmail.com" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">rohan.sakeri17@gmail.com</a>
            {" · "}
            <a href="https://www.linkedin.com/in/rohan-sakeri-41062a1b5/" target="_blank" rel="noreferrer" className="hover:text-white/55 transition-colors">LinkedIn</a>
            {" · "}
            <a href="https://github.com/sakeri-cyber" target="_blank" rel="noreferrer" className="hover:text-white/55 transition-colors">GitHub</a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
