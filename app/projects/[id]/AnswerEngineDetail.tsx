"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { type Project } from "@/lib/projects";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

const A = "#60a5fa";

// ── animated counter ─────────────────────────────────────────────
function useCounter(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
}

// ── animated feature importance bar ──────────────────────────────
function FeatureBar({ label, pct, delay = 0 }: { label: string; pct: number; delay?: number }) {
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => setW(pct), delay);
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className="w-48 shrink-0 font-mono text-xs text-right" style={{ color: "rgba(255,255,255,0.60)" }}>
        {label}
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${A}, ${A}55)` }}
        />
      </div>
      <div className="w-9 font-mono text-xs shrink-0" style={{ color: `${A}90` }}>{pct}%</div>
    </div>
  );
}

// ── static data ───────────────────────────────────────────────────
const PHASES = [
  { name: "HyDE Router",      tool: "Llama-3.1-8B",           color: "#8b5cf6", desc: "Decomposes the query into ES keyword terms and a hypothetical Qdrant document embed, so both retrieval paths receive specialised inputs." },
  { name: "Hybrid Search",    tool: "Qdrant + Elasticsearch",  color: "#3b82f6", desc: "Dense cosine ANN (Qdrant) and BM25 sparse search (ES) run concurrently via asyncio.gather() — two representations of relevance in parallel." },
  { name: "RRF Fusion",       tool: "Rank Fusion  k=60",       color: "#06b6d4", desc: "Reciprocal Rank Fusion normalises incompatible score scales into a single ranked candidate list without requiring score calibration." },
  { name: "XGBoost Rerank",   tool: "LambdaMART · rank:ndcg",  color: A,         desc: "A 9-feature quality matrix re-orders the top candidates in under 15ms — penalising low-readability and rewarding citation velocity." },
  { name: "CRAG Bouncer",     tool: "Llama-3.1-8B + Tavily",   color: "#f59e0b", desc: "Validates whether the retrieved context actually answers the query before generation. Incorrect context triggers a live Tavily web fallback." },
  { name: "Stream Synthesis",  tool: "Llama-3.3-70B via Groq",  color: "#34d399", desc: "Inline-cited answer streamed token-by-token via Server-Sent Events. Time to first token consistently under 150ms on Groq LPU hardware." },
];

const DATABASES = [
  {
    name: "Qdrant",
    type: "Vector DB",
    color: A,
    role: "Dense semantic search",
    config: "1024-dim COSINE · port 6333 / 6334 (REST / gRPC)",
    why: "HNSW graphs for approximate nearest-neighbour search over 1024-dimensional embedding space. Elasticsearch has no equivalent ANN primitive.",
  },
  {
    name: "Elasticsearch",
    type: "Inverted Index",
    color: "#f59e0b",
    role: "BM25 sparse keyword search",
    config: "v8.13.0 · single-node · 512 MB JVM heap",
    why: "BM25 anchors exact terminology. A paper titled 'transformer' ranks correctly for 'transformer architecture' even if its dense embedding drifts toward nearby topics.",
  },
  {
    name: "Redis",
    type: "Key-Value Cache",
    color: "#f87171",
    role: "Semantic cache + dedup queue",
    config: "v7 Alpine · --save 60 1 · AOF disabled",
    why: "Sub-millisecond lookups for repeated queries. Both Qdrant and ES are too heavy for a caching layer — Redis serves cached answers in ~0.5ms.",
  },
];

const FEATURES = [
  { label: "doc_readability",        pct: 94, delay: 0   },
  { label: "citation_velocity",      pct: 79, delay: 90  },
  { label: "semantic_lexical_ratio", pct: 71, delay: 180 },
  { label: "title_body_divergence",  pct: 63, delay: 270 },
  { label: "dense_score",            pct: 51, delay: 360 },
  { label: "exact_match_title",      pct: 44, delay: 450 },
  { label: "sparse_score",           pct: 38, delay: 540 },
  { label: "query_intent",           pct: 30, delay: 630 },
  { label: "h_index",                pct: 22, delay: 720 },
];

const CHALLENGES = [
  {
    tag: "Networking",
    title: "IPv6 Loopback Routing Timeout",
    problem: "Python's asyncio defaulted to routing 'localhost' through the IPv6 address (::1), while Docker mapped ES and Qdrant ports to the IPv4 loopback (127.0.0.1). Every database client silently timed out with no error — the requests were going to the wrong interface.",
    fix: "Hard-pinned all async database clients to 127.0.0.1 explicitly, bypassing macOS's IPv6 black hole entirely. A one-character change that took four hours to find.",
  },
  {
    tag: "LLM Fragility",
    title: "Groq JSON Mode Causing 400 Crashes",
    problem: "Enabling strict API-level JSON mode triggered 400 json_validate_failed errors whenever Llama prepended markdown code fences (```json) around its output. The HyDE router was crashing on roughly every third query.",
    fix: "Removed the API enforcer. Set temperature=0.0 for near-determinism and used re.search(r'\\{.*\\}', output, re.DOTALL) to surgically extract JSON from any surrounding text. Parse stability went from ~65% to 100%.",
  },
  {
    tag: "Concurrency",
    title: "XGBoost OpenMP vs asyncio Segfault",
    problem: "Integrating the XGBoost ranker into the FastAPI event loop caused an immediate Segmentation Fault on launch. XGBoost's C++ OpenMP multi-threading and Python's asyncio event loop were contesting memory allocation simultaneously on Apple Silicon.",
    fix: "Neutered XGBoost's threading at runtime: os.environ['KMP_DUPLICATE_LIB_OK'] = 'True' and model.set_param({'nthread': 1}). Sub-15ms inference is still achieved sequentially — 50 trees is fast enough.",
  },
  {
    tag: "Memory",
    title: "PyTorch MPS Backend OOM During Ingestion",
    problem: "Embedding large batches on macOS MPS (Metal Performance Shaders) caused accumulated memory allocations to hit the unified memory watermark mid-ingestion. The pipeline crashed with RuntimeError at around 40% completion.",
    fix: "Reduced encoding batch_size from 128 to 32 and called torch.mps.empty_cache() after every batch. Ingestion now completes stably at 100% — the MPS allocator releases memory predictably at batch boundaries.",
  },
  {
    tag: "Infrastructure",
    title: "Elasticsearch Client-Server Version Mismatch",
    problem: "The system Anaconda Python used elasticsearch-py v9.x, which appended 'compatible-with=9' headers to every request. ES 8.13.0 in Docker rejected these with media_type_header_exception. All ES writes were silently failing.",
    fix: "Pinned all ingestion scripts to .venv/bin/python3 where elasticsearch-py v8.13.0 was installed. Recovered already-loaded Qdrant vectors by migrating their payloads directly into ES via a one-off migration script — avoiding 15,000+ re-downloads.",
  },
];

const INGESTION_CODE = `# Deterministic UUID — same paper + chunk = same UUID (idempotent)
chunk_id   = f"paper_{paper_id}_chunk_{chunk_index}"
chunk_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk_id))

# Context-injected embedding input (title signals which paper a chunk belongs to)
embed_text = f"Title: {paper['title']}\\n\\n{chunk_text}"
embedding  = model.encode([embed_text])[0].tolist()

# Parallel upsert to Qdrant + Elasticsearch in a single round-trip
await asyncio.gather(
    qdrant.upsert(COLLECTION, points=[PointStruct(
        id=chunk_uuid, vector=embedding,
        payload={"title": paper["title"], "text": chunk_text, ...}
    )]),
    es.bulk(operations=[
        {"index": {"_index": COLLECTION, "_id": chunk_uuid}},
        {"title": paper["title"], "text": chunk_text, ...},
    ]),
)`;

const XGBOOST_CODE = `features = {
    "query_intent":           float(intent_score),       # 0/1 factual vs conceptual
    "dense_score":            float(qdrant_score),        # cosine similarity [0,1]
    "sparse_score":           float(es_score),            # BM25 normalised [0,1]
    "doc_readability":        flesch_kincaid(text),       # dominant feature
    "exact_match_title":      float(query in title),      # binary signal
    "h_index":                float(paper["h_index"]),    # author authority
    "citation_velocity":      citations / max(age, 1),    # recency-weighted impact
    "title_body_divergence":  cosine(title_emb, body_emb),# coherence signal
    "semantic_lexical_ratio": dense_score / (sparse_score + 1e-9),
}`;

// ── main component ────────────────────────────────────────────────
export default function AnswerEngineDetail({ project }: { project: Project }) {
  const m1 = useCounter(200);
  const m2 = useCounter(15);
  const m3 = useCounter(150);
  const m4 = useCounter(6);

  const [openChallenge, setOpenChallenge] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 0%, #061428 0%, #030a12 60%)" }}>
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Breadcrumb */}
        <FadeIn direction="left">
          <div className="flex items-center gap-2 text-sm mb-10">
            <Link
              href="/projects"
              className="transition-colors"
              style={{ color: `${A}70` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = A}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${A}70`}
            >
              ← Projects
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/55">{project.title}</span>
          </div>
        </FadeIn>

        {/* Header */}
        <FadeIn direction="up" delay={0.05}>
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ color: A, borderColor: `${A}40`, background: `${A}10` }}
              >
                {project.badge}
              </span>
              <span className="font-mono text-sm text-white/50">{project.date}</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">{project.title}</h1>
            <p className="text-lg text-white/75 leading-relaxed border-l-2 pl-4" style={{ borderColor: `${A}50` }}>
              {project.tldr}
            </p>
          </div>
        </FadeIn>

        {/* Tech stack */}
        <FadeIn delay={0.1}>
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {project.chips.map(c => (
                <span
                  key={c}
                  className="px-3 py-1 rounded-full font-mono text-sm border"
                  style={{ background: `${A}0c`, borderColor: `${A}30`, color: `${A}dd` }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* GitHub link */}
        <FadeIn delay={0.12}>
          <div className="flex gap-3 mb-12 flex-wrap">
            {/*
              TODO: uncomment when demo video is recorded and uploaded
              <a href={project.videoUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                style={{ background: A, color: "#000" }}>
                ▶ Watch Demo
              </a>
            */}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 hover:brightness-110"
                style={{ borderColor: `${A}40`, color: A, background: `${A}08` }}
              >
                View on GitHub ↗
              </a>
            )}
          </div>
        </FadeIn>

        <div className="h-px w-full mb-14" style={{ background: `linear-gradient(90deg, ${A}35, transparent)` }} />

        {/* ── METRICS ───────────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: `${A}55` }}>
            Performance at a Glance
          </div>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16" stagger={0.08}>
          {([
            { counter: m1, prefix: "<", suffix: "ms",      label: "Retrieval",        sub: "end-to-end hybrid" },
            { counter: m2, prefix: "<", suffix: "ms",      label: "XGBoost Infer",    sub: "50 trees · 9 feats" },
            { counter: m3, prefix: "<", suffix: "ms",      label: "Time to 1st Token", sub: "Groq LPU streaming" },
            { counter: m4, prefix: "",  suffix: " phases", label: "Pipeline Stages",   sub: "query → cited answer" },
          ] as const).map((m, i) => (
            <StaggerItem key={i}>
              <div
                ref={m.counter.ref}
                className="rounded-2xl p-4 text-center"
                style={{ background: `${A}08`, border: `1px solid ${A}18` }}
              >
                <div className="font-mono text-3xl font-bold" style={{ color: A }}>
                  {m.prefix}{m.counter.val}{m.suffix}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mt-2">{m.label}</div>
                <div className="font-mono text-[10px] text-white/35 mt-1">{m.sub}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── WHY STANDARD RAG FAILS ─────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>The Problem</div>
          <h2 className="text-2xl font-bold text-white mb-4">Why Standard RAG Fails</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            Standard RAG has four systematic failure modes. This engine addresses each explicitly — they are not edge cases, they are the default behaviour.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="overflow-x-auto rounded-xl border mb-16" style={{ borderColor: `${A}18` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${A}0c`, borderBottom: `1px solid ${A}22` }}>
                  {["Failure Mode", "What Goes Wrong", "This Engine's Fix"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: A }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Keyword mismatch",  '"neural net" ≠ "deep learning" in BM25',                        "Dense vector search captures semantic meaning beyond exact terms"],
                  ["Semantic drift",    "Dense search returns tangentially related documents",              "BM25 sparse search anchors exact terminology in parallel"],
                  ["Equal weighting",   "Old or unreadable documents ranked same as quality ones",         "XGBoost re-ranks using 9 quality signals incl. readability"],
                  ["Silent failure",    "Bad context passed to LLM → hallucination delivered with confidence", "CRAG bouncer validates context quality before any generation"],
                ].map(([mode, problem, fix], ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3 font-mono text-xs font-bold" style={{ color: A }}>{mode}</td>
                    <td className="px-5 py-3 text-white/60 text-sm">{problem}</td>
                    <td className="px-5 py-3 text-white/70 text-sm">{fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* ── 6-PHASE PIPELINE ───────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Architecture</div>
          <h2 className="text-2xl font-bold text-white mb-3">The 6-Phase Pipeline</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Every query is a multi-stage decision problem, not a lookup. Each phase is independently testable and swappable.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="flex flex-col mb-16">
            {PHASES.map((ph, i) => (
              <div key={i} className="flex gap-0">
                {/* Connector column */}
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 z-10"
                    style={{ background: `${ph.color}14`, border: `1.5px solid ${ph.color}45`, color: ph.color }}
                  >
                    {i + 1}
                  </div>
                  {i < PHASES.length - 1 && (
                    <div
                      className="w-px flex-1 my-1"
                      style={{ background: `linear-gradient(to bottom, ${ph.color}35, ${PHASES[i + 1].color}35)` }}
                    />
                  )}
                </div>
                {/* Card */}
                <div
                  className={`ml-4 rounded-xl p-4 flex-1 ${i < PHASES.length - 1 ? "mb-2" : ""}`}
                  style={{ background: `${ph.color}06`, border: `1px solid ${ph.color}18` }}
                >
                  <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                    <span className="font-bold text-base text-white/90">{ph.name}</span>
                    <span className="font-mono text-xs" style={{ color: `${ph.color}88` }}>{ph.tool}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{ph.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── THREE DATABASES ────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Infrastructure</div>
          <h2 className="text-2xl font-bold text-white mb-3">Why Three Databases?</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Each database is best-in-class for one job. No single database handles all three workloads optimally — this is a deliberate architectural choice, not complexity for its own sake.
          </p>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-4 mb-16" stagger={0.1}>
          {DATABASES.map(db => (
            <StaggerItem key={db.name}>
              <div className="rounded-2xl p-6" style={{ background: `${db.color}06`, border: `1px solid ${db.color}18` }}>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-white">{db.name}</span>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${db.color}10`, border: `1px solid ${db.color}25`, color: `${db.color}cc` }}
                  >
                    {db.type}
                  </span>
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: db.color }}>{db.role}</div>
                <div className="font-mono text-xs text-white/40 mb-3">{db.config}</div>
                <p className="text-sm text-white/65 leading-relaxed">{db.why}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── DATA INGESTION ─────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Data Layer</div>
          <h2 className="text-2xl font-bold text-white mb-4">Ingestion &amp; Chunking</h2>
          <div className="text-base text-white/70 leading-relaxed mb-6 space-y-4">
            <p>
              Papers are fetched from the ArXiv Atom API, chunked at{" "}
              <strong className="text-white/85">250 words with 50-word overlap</strong>, and embedded using
              the pplx-embed model. Each chunk is upserted to both Qdrant and Elasticsearch under the same
              UUID5 — a deterministic hash of the ArXiv ID and chunk index.
            </p>
            <p>
              UUID5 (not UUID4) is a critical choice: re-running the ingestion pipeline on the same papers
              produces the same UUIDs, so upserts overwrite rather than duplicate. The pipeline is{" "}
              <strong className="text-white/85">idempotent</strong> — safe to run as a CRON job without
              accumulating duplicates.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-xl overflow-hidden border mb-16" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#070d0d" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a1212" }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-white/45 ml-2">worker.py</span>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto" style={{ color: "#93c5fd" }}>
              {INGESTION_CODE}
            </pre>
          </div>
        </FadeIn>

        {/* ── EMBEDDING MODEL ───────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Embedding</div>
          <h2 className="text-2xl font-bold text-white mb-6">The Embedding Model</h2>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="overflow-x-auto rounded-xl border mb-16" style={{ borderColor: `${A}18` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${A}0c`, borderBottom: `1px solid ${A}22` }}>
                  {["Property", "Value", "Why It Matters"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: A }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Model",              "pplx-embed-context-v1-0.6B", "Perplexity's production retrieval model — trained on query-document pairs, not general text similarity"],
                  ["Parameters",         "600M",                         "Fits in ~2 GB VRAM; runs on CPU for small batches without GPU dependency"],
                  ["Output dims",        "1024",                         "High-dimensional = more expressive. 384-dim models lose semantic nuance at scale"],
                  ["Architecture",       "Transformer encoder",          "Bidirectional attention — full context understanding, not left-to-right only"],
                  ["Training objective", "Contrastive (query-doc pairs)","Explicitly trained to rank relevant documents higher — not just text similarity"],
                  ["Context injection",  "Title prepended to chunk",     '"Title: X\\n\\nContent: Y" — embedding knows which paper a chunk belongs to'],
                ].map(([prop, val, why], ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3 font-mono text-xs font-bold" style={{ color: A }}>{prop}</td>
                    <td className="px-5 py-3 font-mono text-xs text-white/70">{val}</td>
                    <td className="px-5 py-3 text-xs text-white/65 leading-relaxed">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* ── COLD START: LLM-AS-JUDGE ──────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>ML Training</div>
          <h2 className="text-2xl font-bold text-white mb-4">Solving Cold-Start with LLM-as-Judge</h2>
          <div className="text-base text-white/70 leading-relaxed mb-6 space-y-4">
            <p>
              Training a Learning-to-Rank model requires (query, document, relevance_label) triples. Production
              systems get these from user click-logs. A solo developer building from scratch has{" "}
              <strong className="text-white/85">zero labels</strong>.
            </p>
            <p>
              The solution: use the LLM itself as a judge. For each ingested paper, Llama-3.1-8B generates
              three query types (layman keyword, natural language, PhD-level technical), retrieves candidates,
              and grades each (query, candidate) pair on a 0–3 Likert scale. These synthetic labels train
              XGBoost. The LLM is a better ranker than RRF but 100× slower — so it generates the{" "}
              <strong className="text-white/85">training signal</strong> for a fast model.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-xl p-5 border mb-16" style={{ background: `${A}05`, borderColor: `${A}18` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: `${A}65` }}>
              Synthetic Training Pipeline
            </div>
            <div className="flex flex-col gap-3">
              {[
                ["1", "Query synthesis",    "Llama generates 3 queries per paper: keyword · natural language · PhD-level technical"],
                ["2", "Feature extraction", "9 features computed per candidate: readability, citation velocity, semantic ratio, etc."],
                ["3", "LLM judging",        "Llama grades each (query, candidate) pair 0–3 via chain-of-thought reasoning"],
                ["4", "DuckDB storage",     "Columnar DB streams rows to disk — no Pandas OOM crashes at 300k+ rows"],
                ["5", "XGBoost training",   "rank:ndcg objective, 50 trees, max_depth=4 — prevents overfit on synthetic data"],
              ].map(([n, title, desc]) => (
                <div key={n} className="flex gap-4 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: `${A}14`, color: A }}
                  >
                    {n}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white/85 mb-0.5">{title}</div>
                    <div className="text-sm text-white/60">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── XGBOOST LAMBDAMART ────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Re-Ranking</div>
          <h2 className="text-2xl font-bold text-white mb-4">XGBoost LambdaMART</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            The model does not predict relevance — it predicts <em className="text-white/85">relative ordering</em>.
            LambdaMART optimises NDCG directly by computing pseudo-gradients that represent how swapping two
            documents would change the ranking score. NDCG&apos;s log₂(i+1) denominator discounts lower positions, so
            getting the most relevant document to position 1 matters more than position 5.
          </p>
        </FadeIn>
        <FadeIn delay={0.04}>
          <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#070d0d" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a1212" }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-white/45 ml-2">ranker.py  —  9 features</span>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto" style={{ color: "#93c5fd" }}>
              {XGBOOST_CODE}
            </pre>
          </div>
        </FadeIn>
        <FadeIn delay={0.06}>
          <div className="rounded-xl p-6 border mb-4" style={{ background: `${A}04`, borderColor: `${A}15` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: `${A}65` }}>
              Feature Importance (Relative)
            </div>
            <div className="flex flex-col gap-3.5">
              {FEATURES.map(f => <FeatureBar key={f.label} {...f} />)}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="rounded-xl px-6 py-5 border-l-4 mb-16 font-mono text-sm space-y-2"
            style={{ background: "rgba(139,92,246,0.05)", borderColor: "#8b5cf660" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3 font-sans" style={{ color: "#a78bfa" }}>
              NDCG — the Optimisation Target
            </div>
            <div style={{ color: "#c4b5fd" }}>DCG@k  =  Σᵢ₌₁ᵏ  (2^rel_i − 1) / log₂(i + 1)</div>
            <div style={{ color: "#c4b5fd" }}>NDCG@k =  DCG@k / IDCG@k</div>
            <p className="text-xs text-white/45 mt-2 font-sans leading-relaxed">
              The log₂(i+1) penalty is what makes LambdaMART care more about rank 1 than rank 5.
              XGBoost fits 50 trees that learn to produce pseudo-gradients pushing the most
              relevant documents upward.
            </p>
          </div>
        </FadeIn>

        {/* ── CRAG BOUNCER ──────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Hallucination Prevention</div>
          <h2 className="text-2xl font-bold text-white mb-4">CRAG Bouncer</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Before any generation, Llama-3.1-8B evaluates whether the retrieved context actually answers the
            query. If flagged <strong className="text-white/85">Incorrect</strong>, the pipeline triggers a
            live Tavily web search and augments the context rather than hallucinating from insufficient material.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              {
                verdict: "✓  Correct",
                color: "#34d399",
                desc: "Context is sufficient and directly addresses the query.",
                action: "→ Llama-3.3-70B streams cited answer directly",
              },
              {
                verdict: "~  Ambiguous",
                color: "#f59e0b",
                desc: "Context partially addresses the query — some information present.",
                action: "→ Generate answer with explicit uncertainty caveats",
              },
              {
                verdict: "✗  Incorrect",
                color: "#f87171",
                desc: "Context is missing or off-topic for this query.",
                action: "→ Tavily web search → augment context → generate with web citations",
              },
            ].map(branch => (
              <div
                key={branch.verdict}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: `${branch.color}06`, border: `1px solid ${branch.color}25` }}
              >
                <div className="font-bold text-base" style={{ color: branch.color }}>{branch.verdict}</div>
                <p className="text-sm text-white/65 leading-relaxed flex-1">{branch.desc}</p>
                <div className="text-xs font-mono text-white/45 pt-3 border-t" style={{ borderColor: `${branch.color}20` }}>
                  {branch.action}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── ENGINEERING WAR STORIES ───────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Engineering Challenges</div>
          <h2 className="text-2xl font-bold text-white mb-4">Five Problems Solved</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            The kind that don&apos;t make it into tutorials.
          </p>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-3 mb-16" stagger={0.08}>
          {CHALLENGES.map((c, i) => (
            <StaggerItem key={i}>
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: `${A}04`, borderColor: `${A}14` }}
              >
                <button
                  onClick={() => setOpenChallenge(openChallenge === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer"
                >
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${A}10`, border: `1px solid ${A}25`, color: A }}
                  >
                    {c.tag}
                  </span>
                  <span className="font-semibold text-sm text-white/85 flex-1">{c.title}</span>
                  <span className="font-mono text-xs text-white/30 shrink-0">
                    {openChallenge === i ? "▾" : "▸"}
                  </span>
                </button>
                {openChallenge === i && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: `${A}10` }}>
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#f87171" }}>
                          Problem
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed">{c.problem}</p>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#34d399" }}>
                          Fix
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed">{c.fix}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── PERFORMANCE SUMMARY ──────────────────────────────────
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>
            Production Benchmarks
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">Performance Summary</h2>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {[
              { metric: "JSON parse stability",    value: "100%",    note: "Regex extraction + temperature=0.0 eliminated all 400 errors" },
              { metric: "Retrieval latency",        value: "<200ms",  note: "Qdrant + ES parallel search, RRF, XGBoost combined" },
              { metric: "LLM inference speed",      value: "<15ms",   note: "XGBoost 50 trees, nthread=1 on CPU, no GPU needed" },
              { metric: "Time to first token",      value: "<150ms",  note: "Groq LPU hardware, SSE streaming to browser" },
              { metric: "Ingestion idempotency",    value: "UUID5",   note: "Re-running on same corpus upserts, never duplicates" },
              { metric: "Cold-start training data", value: "DuckDB",  note: "Columnar streaming — 300k+ rows without Pandas OOM" },
            ].map(row => (
              <div
                key={row.metric}
                className="rounded-xl p-4"
                style={{ background: `${A}06`, border: `1px solid ${A}14` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: `${A}70` }}>{row.metric}</div>
                  <div className="font-mono text-sm font-bold" style={{ color: A }}>{row.value}</div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{row.note}</p>
              </div>
            ))}
          </div>
        </FadeIn> */}

        {/* ── FOOTER NAV ─────────────────────────────────────────── */}
        <div className="pt-8 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link
            href="/projects"
            className="text-sm font-semibold transition-colors"
            style={{ color: `${A}70` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = A}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${A}70`}
          >
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
