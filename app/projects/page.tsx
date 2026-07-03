"use client";
import { useState } from "react";

const ACCENT = "#34d399";

type Project = {
  id: string;
  title: string;
  date: string;
  badge: string;
  tldr: string;
  chips: string[];
  categories: string[];
  videoUrl?: string;
  sections: { heading: string; content: string; code?: { lang: string; title: string; snippet: string }; table?: { headers: string[]; rows: string[][] }; note?: string }[];
};

const PROJECTS: Project[] = [
  {
    id: "codaf",
    title: "CODAF — Co-Adaptive Allocation Framework",
    date: "Jun 2025 – Sep 2025 · MSc Dissertation",
    badge: "★ Featured · MSc Dissertation",
    tldr: "A novel GNN + MARL framework that teaches a Graph Neural Network to act as a dynamic 'switchboard' for a team of specialized AI agents, solving the Complexity-Competence Gap in multi-agent systems.",
    chips: ["PyTorch Geometric", "GraphSAGE", "REINFORCE", "SentenceTransformers", "LLM-as-Judge", "SDBench"],
    categories: ["Research", "RL / Agents"],
    sections: [
      {
        heading: "The Problem",
        content: "As AI systems move toward teams of specialized agents (LangGraph, AutoGen), a new failure mode emerges: adding more capable agents makes the system worse because coordination overhead dominates. CODAF targets this 'Complexity-Competence Gap' — where failures are caused not by lack of knowledge, but by routing the wrong task to the wrong agent at the wrong time.",
      },
      {
        heading: "GNN Core — Learned Ability Embeddings",
        content: "The GNN takes each agent's static capability description (embedded via SentenceTransformer) and the current conversational state, and produces dynamic 'Ability Embeddings' that update every turn. This is what makes the allocator context-aware.",
        code: {
          lang: "python",
          title: "gnn_model.py — GraphSAGE forward pass",
          snippet: `class AgentCapabilityGNN(torch.nn.Module):
    def forward(self, x, edge_index, state_embedding):
        # Broadcast conversation state to every agent node
        state_expanded = state_embedding.unsqueeze(0).expand(x.size(0), -1)
        # State-aware input: static capability + dynamic context
        x = torch.cat([x, state_expanded], dim=1)
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x  # [num_agents, out_channels]`,
        },
      },
      {
        heading: "Results vs. Baselines",
        content: "",
        table: {
          headers: ["Metric", "Static Baseline", "Dynamic (no GNN)", "CODAF (GNN)"],
          rows: [
            ["Diagnostic Success Rate", "77.5%", "62.5%", "80.0% ✓"],
            ["Oracle Reasoning Accuracy", "—", "—", "88.8%"],
            ["Avg. Path Cost", "$740", "$910", "$420 (−43%)"],
            ["Wasted Action Ratio", "15%", "38%", "4%"],
          ],
        },
        note: "The delta between 80% DSR and 88.8% Oracle accuracy is a policy calibration issue, not a reasoning failure. In 50% of errors, agents had already identified the correct diagnosis internally — the GNN simply terminated the episode prematurely due to conservative policy bias.",
      },
    ],
  },
  {
    id: "answer-engine",
    title: "Agentic Answer Engine",
    date: "Apr 2026 · Self-Project",
    badge: "RAG · LTR",
    tldr: "A Perplexity-style scientific literature search engine with a 6-phase ML pipeline: HyDE query decomposition → hybrid retrieval → XGBoost LambdaMART re-ranking → CRAG hallucination detection → streaming synthesis.",
    chips: ["FastAPI", "Qdrant", "Elasticsearch", "XGBoost LambdaMART", "pplx-embed 1024-dim", "Llama-3.3-70B", "Docker", "DuckDB", "Groq"],
    categories: ["ML Systems", "RAG / LLM"],
    sections: [
      {
        heading: "The Problem Standard RAG Doesn't Solve",
        content: "",
        table: {
          headers: ["Problem", "Naive RAG", "This Engine"],
          rows: [
            ["LLM hallucinations", "Trust the LLM", "CRAG Bouncer validates context before generation"],
            ["Keyword vs. semantic mismatch", "Pick one search type", "Qdrant (dense) + Elasticsearch (BM25) + RRF"],
            ["All docs equally ranked", "Top-N by raw score", "XGBoost LambdaMART re-ranks on 9 features"],
            ["Vague queries", "Pass raw text", "HyDE decomposes into es_keywords + qdrant_hyde"],
            ["No training labels (cold start)", "Block on data", "LLM-as-judge synthetic telemetry via DuckDB"],
          ],
        },
      },
      {
        heading: "Learning-to-Rank — Solving Cold Start",
        content: "The hardest engineering challenge: no relevance labels exist for scientific literature ranking. Solution: LLM-as-judge synthetic data generation. Retrieve 50 candidates per query → prompt llama-3.1-8b-instant to score each (query, document) pair 0–3 → store labels in DuckDB alongside 9 engineered features → train XGBoost with rank:pairwise objective (LambdaMART) offline → load the serialized booster at inference time for sub-millisecond re-ranking.",
        code: {
          lang: "python",
          title: "worker.py — Context-aware batch embedding",
          snippet: `embedder = SentenceTransformer(
    "perplexity-ai/pplx-embed-context-v1-0.6B",
    trust_remote_code=True, device=device,
)

def embed_batch(papers: list[dict], batch_size: int = 32):
    texts = [f"Title: {p['title']}\\n\\nContent: {p['abstract']}" for p in papers]
    vecs = embedder.encode(texts, batch_size=batch_size, normalize_embeddings=True)
    if device == "mps":
        torch.mps.empty_cache()
    return vecs.tolist()`,
        },
      },
    ],
  },
  {
    id: "papeer",
    title: "Papeer — Agentic Research Assistant",
    date: "May 2026 · Self-Project",
    badge: "LangGraph · Agents",
    tldr: "A production-ready LangGraph RAG application for conversational paper analysis — with Corrective RAG, bounded query rewriting, SQLite session checkpointing, and a DeepEval continuous evaluation loop.",
    chips: ["LangGraph", "Qdrant", "Tavily", "SQLite Checkpointing", "DeepEval", "Streamlit", "ArXiv API"],
    categories: ["RAG / LLM"],
    sections: [
      {
        heading: "What Makes This Production-Grade",
        content: "• Isolated SQLite checkpointing — each session's LangGraph state is persisted independently; restore_session replays the exact graph state from any prior turn.\n\n• Corrective RAG with bounded retries — the LLM relevancy evaluator triggers query rewriting up to N times before falling back to web search, preventing infinite loops.\n\n• /btw side-channel — off-topic questions bypass RAG and session history entirely; the LLM decides whether to search or answer directly.\n\n• DeepEval evaluation loop — automated CI pipeline tracks Contextual Precision, Recall, and Answer Relevancy; chunking strategy consistently exceeds 0.7 pass thresholds.",
      },
    ],
  },
  {
    id: "bid-o-matic",
    title: "Bid-O-Matic — Intelligent Ad Bidding Engine",
    date: "Apr 2026 · Self-Project",
    badge: "RL · AdTech",
    tldr: "A high-fidelity Generalized Second Price (GSP) auction simulation with a full ML pipeline — from PySpark feature engineering and XGBoost/DLRM conversion prediction to a REINFORCE policy-gradient RL agent for bid shading.",
    chips: ["PySpark", "XGBoost", "PyTorch DLRM", "REINFORCE", "GSP Auction", "Contextual Bandits"],
    categories: ["ML Systems", "RL / Agents"],
    sections: [
      {
        heading: "The Core Insight: Greedy Bidding Is Sub-Optimal",
        content: "In a GSP auction, bidding your true expected value (EV) is greedy but leaves money on the table. The RL agent learns to shade bids dynamically — bidding aggressively on high-value slots, conservatively when budget is low. REINFORCE was stabilised with reward clipping and advantage baselines to prevent high-variance policy collapse.",
        code: {
          lang: "python",
          title: "reinforce_agent.py — Bid shading policy",
          snippet: `# Shaded Bid = EV × α(state), where α ∈ [0.0, 2.0]
# α is a neural network conditioned on (budget_pct, time_of_day, ev)

class BidShadingPolicy(nn.Module):
    def forward(self, state):
        logits = self.net(state)  # [budget_pct, tod, ev]
        alpha = torch.sigmoid(logits) * 2.0  # α ∈ [0, 2]
        return alpha  # bid = ev * alpha`,
        },
      },
      {
        heading: "Key Finding",
        content: "XGBoost outperformed the MiniDLRM deep learning model on tabular conversion prediction. This validates the established empirical finding that gradient-boosted trees remain superior for structured, tabular AdTech data where feature interactions are not spatial or sequential.",
      },
    ],
  },
];

const FILTERS = ["All", "ML Systems", "Research", "RAG / LLM", "RL / Agents"];

export default function ProjectsPage() {
  const [active, setActive] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = active === "All" ? PROJECTS : PROJECTS.filter(p => p.categories.includes(active));

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 15% 0%, #061a12 0%, #030d09 65%)" }}>
      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="mb-2 font-mono text-xs" style={{ color: `${ACCENT}60` }}>projects /</div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Engineering Projects</h1>
        <p className="text-sm text-white/40 mb-8 max-w-xl">
          End-to-end builds ranging from multi-agent systems research to production retrieval pipelines. Each project is fully implemented and documented.
        </p>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActive(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
              style={{
                borderColor: active === f ? ACCENT : "rgba(255,255,255,0.1)",
                background: active === f ? `${ACCENT}18` : "transparent",
                color: active === f ? ACCENT : "rgba(255,255,255,0.4)",
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Project cards */}
        <div className="flex flex-col gap-6">
          {visible.map(p => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} id={p.id}
                className="rounded-2xl border transition-all duration-300"
                style={{ background: "rgba(52,211,153,0.025)", borderColor: isOpen ? `${ACCENT}35` : "rgba(52,211,153,0.1)" }}>

                {/* Card header */}
                <div className="p-6">
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{p.badge}</span>
                    <span className="font-mono text-[10px] text-white/30">{p.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">{p.title}</h2>
                  <p className="text-sm text-white/45 leading-relaxed mb-4">{p.tldr}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.chips.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded font-mono text-[10px]"
                        style={{ background: `${ACCENT}0c`, border: `1px solid ${ACCENT}22`, color: `${ACCENT}cc` }}>{c}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setExpanded(isOpen ? null : p.id)}
                      className="text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
                      style={{ color: ACCENT }}>
                      <span className="inline-block transition-transform duration-200" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>▶</span>
                      {isOpen ? "Collapse" : "Deep Dive"}
                    </button>
                    {p.videoUrl && (
                      <a href={p.videoUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200"
                        style={{ borderColor: `${ACCENT}35`, color: ACCENT }}>
                        ▶ Watch Demo
                      </a>
                    )}
                  </div>
                </div>

                {/* Expandable deep dive */}
                {isOpen && (
                  <div className="border-t px-6 pb-6 pt-5 flex flex-col gap-6" style={{ borderColor: `${ACCENT}15` }}>
                    {p.sections.map((s, i) => (
                      <div key={i}>
                        {s.heading && <h3 className="text-sm font-bold text-white/80 mb-2">{s.heading}</h3>}
                        {s.content && (
                          <div className="text-sm text-white/45 leading-relaxed whitespace-pre-line mb-3">{s.content}</div>
                        )}
                        {s.code && (
                          <div className="rounded-lg overflow-hidden border text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0a0f0a" }}>
                            <div className="px-4 py-2 text-[10px] font-mono text-white/30 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                              {s.code.title}
                            </div>
                            <pre className="p-4 font-mono text-[11px] leading-relaxed overflow-x-auto" style={{ color: "#6ee7b7" }}>
                              {s.code.snippet}
                            </pre>
                          </div>
                        )}
                        {s.table && (
                          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                            <table className="w-full text-xs">
                              <thead>
                                <tr style={{ background: `${ACCENT}0a`, borderBottom: `1px solid ${ACCENT}20` }}>
                                  {s.table.headers.map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left font-semibold" style={{ color: ACCENT }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {s.table.rows.map((row, ri) => (
                                  <tr key={ri} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="px-4 py-2.5" style={{ color: ci === row.length - 1 ? ACCENT : "rgba(255,255,255,0.5)" }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {s.note && (
                          <div className="mt-3 text-[11px] text-white/35 leading-relaxed pl-3 border-l-2" style={{ borderColor: `${ACCENT}35` }}>
                            💡 {s.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Video guide */}
        <div className="mt-14 rounded-xl p-5 border" style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}20` }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Coming Soon: Project Demos</div>
          <p className="text-xs text-white/40 leading-relaxed">
            Short demo videos (2–3 min each) will be added to each project card. Format: problem → architecture walkthrough → live demo → results.
            Recording via Loom / YouTube Unlisted for clean embeds.
          </p>
        </div>
      </div>
    </div>
  );
}
