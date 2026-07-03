"use client";
import { useState } from "react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

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
  readTime?: string;
  content: string;
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
    readTime: "8 min read",
    content: `When I set out to build the Answer Engine, the naive assumption was that hybrid retrieval is the hard part. Combine dense vector search (Qdrant) with sparse BM25 (Elasticsearch), fuse the scores with Reciprocal Rank Fusion, and you've solved relevance. That assumption lasted about 48 hours of testing.

**The Problem with Raw Fusion Scores**

RRF normalises dense cosine similarity and BM25 scores into a single ranking. But neither score means the same thing. A cosine score of 0.82 from a 1024-dimensional embedding trained on scientific text is not commensurate with a BM25 score of 14.3 from an inverted index. The fusion weights (k=60 in standard RRF) are arbitrary constants, not learned from feedback on what a user actually found relevant.

The result: the top-5 candidates were plausible, but the order was wrong. An abstract with a high BM25 score due to exact term overlap (irrelevant but keyword-dense) would beat a genuinely more relevant paper ranked 8th by the dense retriever.

**The Cold-Start Problem**

The obvious fix — train a Learning-to-Rank model — runs immediately into a cold-start wall. Supervised LTR (LambdaMART, etc.) needs labelled (query, document, relevance_score) triples. I had zero labels.

The solution: manufacture training data using the LLM as a judge. For each query: retrieve 50 candidates → prompt llama-3.1-8b-instant to score each (query, passage) pair on a 0–3 Likert scale → store scores alongside 9 engineered features in DuckDB → train XGBoost with rank:pairwise offline.

The key insight: the LLM is a better ranker than RRF without training, but it's 100× slower and expensive at retrieval time. So I used it to generate labels for an XGBoost model that can re-rank in milliseconds.

**The 9 Features That Actually Mattered**

After experimentation, the most predictive features were citation_velocity, title_body_divergence, exact_match_title, and semantic_lexical_ratio — the ratio of dense score to sparse score. The dense and sparse scores themselves mattered less than the relationship between them.

**What I'd Do Differently**

The bottleneck now is label quality, not model architecture. LLM judges are consistent but biased toward longer, more verbose passages. Adding a human validation pass on 5–10% of synthetic labels would likely push NDCG significantly.`,
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
    readTime: "6 min read",
    content: `The "87% latency reduction" number on my resume sounds like a miracle. It wasn't — it was the result of diagnosing a specific bottleneck that had nothing to do with the ML model itself.

**The Setup**

At Sharechat, the Livestream notification delivery system ran through a Python FastAPI microservice. A recommendation model (XGBoost) scored (user, content) pairs for notification eligibility. At 180M MAU with burst notification campaigns, this service was under serious pressure. Median latency was ~180ms.

**The Actual Root Cause**

The first instinct — "Python is slow" — is usually wrong. Python is slow for CPU-bound work with the GIL. But inference with XGBoost (via C++ bindings) is not GIL-bound. The model itself wasn't the problem.

The real bottleneck had three components:

1. JSON serialisation overhead — Python's json module was serialising large feature payloads (600+ features per user per request) on every call.

2. FastAPI process pool management — the microservice was spawning worker processes to handle concurrent requests. Context switching under burst load added significant overhead.

3. HTTP inter-service communication — feature store call, model scoring, and notification dispatch were three separate HTTP hops.

**What the Go Migration Actually Changed**

Moving to a GoLang monolith addressed all three: zero-copy struct serialisation, goroutine concurrency with far lower overhead than Python process pools, and collapsed service calls that eliminated two HTTP hops.

The median latency dropped from ~180ms to ~23ms. The improvement was almost entirely in the serialisation + concurrency + networking layers, not in the ML model execution time.

The lesson: when ML serving is slow, profile before assuming it's the model.`,
  },
];

export default function BlogPage() {
  const [track, setTrack] = useState<"original" | "curated" | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const visible = track === "all" ? POSTS : POSTS.filter(p => p.track === track);
  const openPost = POSTS.find(p => p.title === open);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, #1a0612 0%, #100409 65%)" }}>
      <div className="max-w-5xl mx-auto px-6 py-16">

        <FadeIn direction="up">
          <div className="mb-2 font-mono text-sm" style={{ color: `${ACCENT}60` }}>blog /</div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">The Synthesizer</h1>
          <p className="text-base text-white/60 mb-10 max-w-xl leading-relaxed">
            Technical writing on ML engineering, system design, and things I learned the hard way.
            Two tracks: original thinking and curated commentary.
          </p>
        </FadeIn>

        {/* Track tabs */}
        <FadeIn delay={0.1}>
          <div className="flex gap-2 mb-12 flex-wrap">
            {[
              { id: "all",      label: "All Posts" },
              { id: "original", label: "✍️ My Thinking" },
              { id: "curated",  label: "📡 Curated & Annotated" },
            ].map(t => (
              <button key={t.id} onClick={() => setTrack(t.id as typeof track)}
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200"
                style={{
                  borderColor: track === t.id ? ACCENT : "rgba(255,255,255,0.12)",
                  background:  track === t.id ? `${ACCENT}18` : "transparent",
                  color:       track === t.id ? ACCENT : "rgba(255,255,255,0.5)",
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Notebook grid */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-6" stagger={0.1}>
          {visible.map(post => (
            <StaggerItem key={post.title}>
              <button onClick={() => setOpen(post.title)}
                className="group w-full text-left relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{ borderColor: `${post.color}25`, background: "rgba(12,6,16,0.9)" }}>
                <div className="h-[3px] w-full" style={{ background: post.topColor }} />
                <div className="p-7">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-xs text-white/45">{post.date}</div>
                    {post.readTime && <div className="font-mono text-xs text-white/40">{post.readTime}</div>}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: `${post.color}cc` }}>
                    {post.track === "curated" ? "📡 " : "✍️ "}{post.category}
                  </div>
                  <div className="font-bold text-base text-white/90 group-hover:text-white transition-colors leading-snug mb-2">{post.title}</div>
                  <div className="text-sm text-white/65 leading-relaxed mb-4">{post.teaser}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(t => (
                      <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ background: `${post.color}10`, border: `1px solid ${post.color}22`, color: `${post.color}cc` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-xs font-semibold" style={{ color: `${post.color}99` }}>Read →</div>
                </div>
              </button>
            </StaggerItem>
          ))}

          {/* Placeholder */}
          <StaggerItem>
            <div className="rounded-2xl border border-dashed p-5 flex flex-col items-center justify-center gap-2 min-h-[200px] opacity-25 cursor-not-allowed"
              style={{ borderColor: `${ACCENT}40` }}>
              <div className="text-2xl" style={{ color: `${ACCENT}50` }}>+</div>
              <div className="text-xs font-mono text-white/25">Next notebook coming soon</div>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>

      {/* Full-article modal */}
      {openPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)" }}
          onClick={() => setOpen(null)}>
          <div className="min-h-screen flex items-start justify-center p-4 py-12">
            <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#0d0810", border: `1px solid ${openPost.color}30` }}
              onClick={e => e.stopPropagation()}>
              <div className="h-[3px]" style={{ background: openPost.topColor }} />
              <div className="p-8 md:p-10">
                <div className="font-mono text-xs text-white/30 mb-1">{openPost.date}{openPost.readTime ? ` · ${openPost.readTime}` : ""}</div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${openPost.color}aa` }}>
                  {openPost.category}
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-8">{openPost.title}</h2>
                <div className="text-base text-white/75 leading-relaxed space-y-5">
                  {openPost.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("**") && para.endsWith("**")) {
                      return <h3 key={i} className="text-base font-bold text-white/85 mt-6 mb-2">{para.replace(/\*\*/g, "")}</h3>;
                    }
                    const rendered = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/85">$1</strong>');
                    return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />;
                  })}
                </div>
                <button onClick={() => setOpen(null)}
                  className="mt-10 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 hover:bg-white/5"
                  style={{ borderColor: `${openPost.color}35`, color: openPost.color }}>
                  ← Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
