"use client";
import { useState } from "react";

const ACCENT = "#f472b6";

type Post = {
  date: string;
  category: string;
  title: string;
  teaser: string;
  tags: string[];
  track: "original" | "curated";
  source?: string;
  color: string;
  topColor: string;
  content?: string;
};

const POSTS: Post[] = [
  {
    track: "original",
    date: "Jun 2026",
    category: "RAG · Information Retrieval",
    title: "RAG at Production Scale: Why Hybrid Retrieval Isn't Enough",
    teaser: "LLM-as-judge synthetic labels to train XGBoost LambdaMART when you have zero relevance labels.",
    tags: ["RAG", "XGBoost", "LTR"],
    color: "#f472b6",
    topColor: "linear-gradient(90deg,#f472b6,#ec4899)",
    content: `When I set out to build the Answer Engine, the naive assumption was that hybrid retrieval is the hard part. Combine dense vector search (Qdrant) with sparse BM25 (Elasticsearch), fuse the scores with Reciprocal Rank Fusion, and you've solved relevance. That assumption lasted about 48 hours of testing.

**The Problem with Raw Fusion Scores**

RRF normalises dense cosine similarity and BM25 scores into a single ranking. But neither score means the same thing. A cosine score of 0.82 from a 1024-dimensional embedding trained on scientific text is not commensurate with a BM25 score of 14.3 from an inverted index. The fusion weights (k=60 in standard RRF) are arbitrary constants, not learned from feedback.

The result: the top-5 candidates were plausible, but the order was wrong. An abstract with a high BM25 score due to exact term overlap (irrelevant but keyword-dense) would beat a genuinely more relevant paper ranked 8th by the dense retriever.

**The Cold-Start Problem**

The obvious fix — train a Learning-to-Rank model — runs immediately into a cold-start wall. Supervised LTR (LambdaMART, etc.) needs labelled (query, document, relevance_score) triples. I had zero labels.

The solution: manufacture training data using the LLM as a judge. For each query: retrieve 50 candidates → prompt llama-3.1-8b-instant to score each (query, passage) pair on a 0–3 Likert scale → store scores alongside 9 engineered features in DuckDB → train XGBoost with rank:pairwise offline.

The key insight: the LLM is a better ranker than RRF without training, but it's 100× slower and expensive at retrieval time. So I used it to generate labels for an XGBoost model that can re-rank in milliseconds.

**The 9 Features That Actually Mattered**

After experimentation, the features driving the most lift were not the ones I expected: citation_velocity, title_body_divergence, exact_match_title, and semantic_lexical_ratio — the ratio of dense score to sparse score (identifies queries where the retriever is "confused").

The dense and sparse scores themselves mattered less than the relationship between them.`,
  },
  {
    track: "original",
    date: "Mar 2026",
    category: "Systems · ML Serving",
    title: "87% Less Latency: What Migrating ML Inference to Go Actually Taught Me",
    teaser: "The slowest part of an ML prediction pipeline is almost never the matrix multiply.",
    tags: ["Go", "ML Serving", "Production ML"],
    color: "#60a5fa",
    topColor: "linear-gradient(90deg,#60a5fa,#3b82f6)",
    content: `The "87% latency reduction" number on my resume sounds like a miracle. It wasn't — it was the result of diagnosing a specific bottleneck that had nothing to do with the ML model itself.

**The Setup**

At Sharechat, the Livestream notification delivery system ran through a Python FastAPI microservice. A recommendation model (XGBoost) scored (user, content) pairs for notification eligibility. At 180M MAU with burst notification campaigns, this service was under serious pressure. Median latency was ~180ms. P99 was embarrassingly higher.

**The Actual Root Cause**

The first instinct — "Python is slow" — is usually wrong. Python is slow for CPU-bound work with the GIL. But inference with XGBoost (via xgboost C++ bindings) is not GIL-bound; the XGBoost scorer releases the GIL. The model itself wasn't the problem.

The real bottleneck had three components:
1. JSON serialisation overhead — Python's json module was serialising large feature payloads (600+ features per user) on every call.
2. FastAPI process pool management — the microservice was spawning worker processes to handle concurrent requests. Context switching under burst load added overhead.
3. HTTP inter-service communication — feature store call, model scoring, and notification service were three separate HTTP hops.

**What the Go Migration Actually Changed**

Moving to a GoLang monolith addressed all three: zero-copy struct serialisation, goroutine concurrency handling 10,000 goroutines with far lower overhead than Python process pools, and collapsed service calls — moving everything into a single binary eliminated two HTTP hops.

The median latency dropped from ~180ms to ~23ms. The improvement was almost entirely in the serialisation + concurrency + networking layers, not in the ML model execution time.

The lesson: when ML serving is slow, profile before assuming it's the model.`,
  },
];

const PALETTE = [
  "linear-gradient(90deg,#f472b6,#ec4899)",
  "linear-gradient(90deg,#60a5fa,#3b82f6)",
  "linear-gradient(90deg,#34d399,#10b981)",
  "linear-gradient(90deg,#fbbf24,#f59e0b)",
  "linear-gradient(90deg,#a78bfa,#8b5cf6)",
];

export default function BlogPage() {
  const [track, setTrack] = useState<"original" | "curated" | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const visible = track === "all" ? POSTS : POSTS.filter(p => p.track === track);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, #1a0612 0%, #100409 65%)" }}>
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="mb-2 font-mono text-xs" style={{ color: `${ACCENT}60` }}>blog /</div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">The Synthesizer</h1>
        <p className="text-sm text-white/40 mb-8 max-w-xl">
          Technical writing on ML engineering, system design, and things I learned the hard way.
          Two tracks: original thinking and curated commentary.
        </p>

        {/* Track tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {[
            { id: "all",      label: "All Posts" },
            { id: "original", label: "✍️ My Thinking" },
            { id: "curated",  label: "📡 Curated & Annotated" },
          ].map(t => (
            <button key={t.id} onClick={() => setTrack(t.id as typeof track)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
              style={{
                borderColor: track === t.id ? ACCENT : "rgba(255,255,255,0.1)",
                background: track === t.id ? `${ACCENT}18` : "transparent",
                color: track === t.id ? ACCENT : "rgba(255,255,255,0.4)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Notebook grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((post, i) => {
            const isOpen = open === post.title;
            return (
              <div key={post.title}
                className="group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                style={{ borderColor: `${post.color}25`, background: `linear-gradient(135deg, rgba(10,6,18,0.9) 0%, rgba(20,8,28,0.95) 100%)` }}
                onClick={() => setOpen(isOpen ? null : post.title)}>
                {/* Top accent bar */}
                <div className="h-[3px] w-full" style={{ background: post.topColor }} />

                <div className="p-4">
                  <div className="font-mono text-[9px] text-white/30 mb-1.5">{post.date}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: `${post.color}cc` }}>
                    {post.track === "curated" ? "📡 " : "✍️ "}{post.category}
                  </div>
                  <div className="font-bold text-sm text-white/85 leading-snug mb-2">{post.title}</div>
                  <div className="text-[11px] text-white/40 leading-relaxed mb-3">{post.teaser}</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map(t => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: `${post.color}10`, border: `1px solid ${post.color}22`, color: `${post.color}cc` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] font-semibold flex items-center gap-1" style={{ color: `${post.color}80` }}>
                    <span style={{ display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
                    {isOpen ? "Close" : "Read"}
                  </div>
                </div>

                {/* Source badge for curated */}
                {post.track === "curated" && post.source && (
                  <div className="absolute top-3 right-3 text-[8px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
                    via {post.source}
                  </div>
                )}
              </div>
            );
          })}

          {/* Placeholder card for next post */}
          <div className="relative rounded-xl border border-dashed p-4 flex flex-col items-center justify-center gap-2 min-h-[180px] opacity-30"
            style={{ borderColor: `${ACCENT}40` }}>
            <div className="text-2xl" style={{ color: `${ACCENT}50` }}>+</div>
            <div className="text-[10px] font-mono text-white/25">Next notebook...</div>
          </div>
        </div>

        {/* Full article modal */}
        {open && (() => {
          const post = POSTS.find(p => p.title === open);
          if (!post?.content) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
              onClick={() => setOpen(null)}>
              <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "#0c0810", border: `1px solid ${post.color}30` }}
                onClick={e => e.stopPropagation()}>
                <div className="h-[3px]" style={{ background: post.topColor }} />
                <div className="p-8">
                  <div className="font-mono text-[10px] text-white/30 mb-1">{post.date} · {post.category}</div>
                  <h2 className="text-xl font-black text-white leading-tight mb-6">{post.title}</h2>
                  <div className="text-sm text-white/50 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/75">$1</strong>') }} />
                  <button onClick={() => setOpen(null)}
                    className="mt-8 text-xs font-semibold px-4 py-2 rounded-lg border transition-all duration-200"
                    style={{ borderColor: `${post.color}35`, color: post.color }}>
                    ← Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
