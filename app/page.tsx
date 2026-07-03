"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

function useCounter(target: number, duration = 1800) {
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
        const progress = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
        else setVal(target);
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
      className="relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 hover:-translate-y-1 cursor-default group"
      style={{ background: "rgba(0,229,255,0.025)", border: "1px solid rgba(0,229,255,0.1)" }}>
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(90deg,transparent,#00e5ff,transparent)" }} />
      <div className="font-mono text-2xl font-bold text-cyan-400 leading-none">{val}{suffix}</div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">{label}</div>
      <div className="mt-0.5 font-mono text-[10px] text-white/25">{sub}</div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px] border transition-all duration-200 cursor-default hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.45)" }}>
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
  { group: "Core Languages",             chips: ["Python", "GoLang", "Rust", "C / C++", "SQL"] },
  { group: "AI · ML · Deep Learning",    chips: ["PyTorch", "Triton", "XGBoost", "LangGraph", "PyTorch Geometric", "SentenceTransformers", "DeepEval", "REINFORCE / MARL"] },
  { group: "Infrastructure · Data · MLOps", chips: ["FastAPI", "gRPC", "Docker", "Qdrant", "Elasticsearch", "Redis", "BigQuery", "Kafka", "Flink", "DuckDB", "PySpark"] },
  { group: "Quantitative · Analysis",    chips: ["A/B Testing", "Statistical Inference", "Time-Series Analysis", "Pandas / NumPy / SciPy", "Tableau · Redash"] },
];

const FEATURED = [
  { id: "codaf",         title: "CODAF — MSc Thesis",    tldr: "GNN + MARL for multi-agent task allocation",           stack: "PyG · GraphSAGE · REINFORCE · SDBench" },
  { id: "answer-engine", title: "Agentic Answer Engine",  tldr: "6-phase hybrid retrieval → LTR → CRAG streaming",      stack: "Qdrant · ES · XGBoost · Llama-3.3-70B" },
  { id: "papeer",        title: "Papeer",                 tldr: "Production agentic RAG with continuous DeepEval CI",   stack: "LangGraph · Qdrant · Tavily · SQLite" },
  { id: "bid-o-matic",   title: "Bid-O-Matic",            tldr: "GSP auction simulator with RL bid shading",            stack: "PySpark · XGBoost · DLRM · REINFORCE" },
];

export default function HomePage() {
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LINES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, #0a1a2e 0%, #050a12 65%)" }}>
      {/* subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden
        style={{ backgroundImage: "radial-gradient(rgba(0,229,255,0.07) 1px,transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-16">

        {/* Hero */}
        <div className="flex items-center gap-7 flex-wrap mb-10">
          <div className="relative flex-shrink-0">
            <Image src="/Github_Profile_Pic.png" alt="Rohan Sakeri" width={156} height={156}
              className="rounded-full object-cover"
              style={{ border: "2px solid #00e5ff", boxShadow: "0 0 36px rgba(0,229,255,0.15), 0 0 0 6px rgba(0,229,255,0.05)" }} />
            <span className="absolute bottom-1 right-1 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Open
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">Rohan Sakeri</h1>
            <div className="font-mono text-sm text-cyan-400/70 mb-4">&gt; ML Engineer · LLM Orchestration · Recommender Systems</div>
            <div className="h-5 overflow-hidden mb-5">
              <div key={lineIdx} className="font-mono text-xs text-white/35 animate-in fade-in duration-500">▸ {LINES[lineIdx]}</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/projects" className="px-4 py-2 rounded-lg text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 active:scale-95" style={{ background: "#00e5ff" }}>
                View Projects
              </Link>
              <a href="mailto:rohan.sakeri17@gmail.com" className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 hover:bg-cyan-400/10 active:scale-95"
                style={{ borderColor: "rgba(0,229,255,0.3)", color: "#00e5ff" }}>
                Contact Me
              </a>
              <a href="https://www.linkedin.com/in/rohan-sakeri-41062a1b5/" target="_blank" rel="noreferrer"
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 hover:bg-white/5 active:scale-95"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>

        {/* About */}
        <p className="text-sm text-white/45 leading-relaxed max-w-3xl mb-12 border-l-2 border-cyan-400/20 pl-4">
          Nearly 3 years of production experience at <strong className="text-white/65 font-medium">Sharechat</strong> — a social platform with over{" "}
          <strong className="text-cyan-400 font-semibold">180 million monthly active users</strong>. Joint MSc in Data Science &amp; AI from{" "}
          <strong className="text-white/65 font-medium">IIT Madras × University of Birmingham</strong> (Distinction). My work sits at the intersection of
          recommendation systems, LLM orchestration, and high-performance backend infrastructure. I don&apos;t just build models — I architect systems that
          operate under real latency and scale constraints.
        </p>

        {/* Metrics */}
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">Impact, By the Numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-14">
          <Metric count={87}  suffix="%" label="Latency Reduction" sub="Python → Go migration" />
          <Metric count={17}  suffix="%" label="CTR Gain"          sub="XGBoost notification ranking" />
          <Metric count={12}  suffix="%" label="Revenue Growth"    sub="GMV uplift · user profitability" />
          <Metric count={90}  suffix="%" label="Token Cost Cut"    sub="TOON compression + schema pruning" />
          <Metric count={200} suffix="ms" label="Retrieval Latency" sub="2-stage hybrid pipeline" />
        </div>

        {/* Tech Stack */}
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-5">Technology Stack</h2>
        <div className="flex flex-col gap-5 mb-14">
          {STACK.map(({ group, chips }) => (
            <div key={group}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">{group}</div>
              <div className="flex flex-wrap gap-1.5">{chips.map(c => <Chip key={c} label={c} />)}</div>
            </div>
          ))}
        </div>

        {/* Featured Work */}
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-5">Featured Work</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-14">
          {FEATURED.map(p => (
            <Link key={p.id} href={`/projects#${p.id}`}
              className="group relative rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,229,255,0.06)]"
              style={{ background: "rgba(0,229,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,229,255,0.22)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"}>
              <div className="font-semibold text-sm text-white/75 group-hover:text-white transition-colors mb-1">{p.title}</div>
              <div className="text-[11px] text-white/35 mb-2 leading-relaxed">{p.tldr}</div>
              <div className="font-mono text-[10px] text-cyan-400/45">{p.stack}</div>
              <div className="absolute right-3 top-3 text-white/15 group-hover:text-cyan-400/40 transition-colors text-sm">→</div>
            </Link>
          ))}
        </div>

        {/* Education */}
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-5">Education</h2>
        <div className="flex flex-col gap-3 mb-14">
          {[
            { degree: "Joint MSc · Data Science and Artificial Intelligence", inst: "IIT Madras × University of Birmingham", meta: "2024 – Jan 2026 · Grade: Distinction · Thesis: Co-Adaptive Allocation Framework (CODAF)" },
            { degree: "B.Tech · Chemical Engineering", inst: "Indian Institute of Technology, Kanpur", meta: "2016 – 2021 · GPA: 6.94 / 10" },
          ].map(e => (
            <div key={e.inst} className="rounded-r-xl pl-4 pr-4 py-3"
              style={{ background: "rgba(0,229,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderLeft: "2px solid rgba(0,229,255,0.45)" }}>
              <div className="font-semibold text-sm text-white/75">{e.degree}</div>
              <div className="text-sm text-cyan-400/70 font-medium mt-0.5">{e.inst}</div>
              <div className="font-mono text-[10px] text-white/25 mt-1">{e.meta}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="text-center font-mono text-xs text-white/25">
          <span className="text-white/40">Let&apos;s talk:</span>{" "}
          <a href="mailto:rohan.sakeri17@gmail.com" className="text-cyan-400/60 hover:text-cyan-400 transition-colors">rohan.sakeri17@gmail.com</a>
          {" · "}
          <a href="https://www.linkedin.com/in/rohan-sakeri-41062a1b5/" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">LinkedIn</a>
          {" · "}
          <a href="https://github.com/sakeri-cyber" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  );
}
