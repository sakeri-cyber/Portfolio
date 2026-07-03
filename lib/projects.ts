export type CodeBlock = { title: string; language: string; code: string };
export type TableData = { headers: string[]; rows: string[][] };
export type Section = {
  heading: string;
  body?: string;
  code?: CodeBlock;
  table?: TableData;
  note?: string;
};

export type Project = {
  id: string;
  title: string;
  date: string;
  badge: string;
  tldr: string;
  chips: string[];
  categories: string[];
  videoUrl?: string;
  githubUrl?: string;
  accent: string;
  sections: Section[];
};

export const PROJECTS: Project[] = [
  {
    id: "codaf",
    title: "CODAF — Co-Adaptive Allocation Framework",
    date: "Jun 2025 – Sep 2025",
    badge: "MSc Dissertation",
    tldr: "A novel GNN + MARL framework that teaches a Graph Neural Network to act as a dynamic switchboard for a team of specialized AI agents, solving the Complexity-Competence Gap in multi-agent systems.",
    chips: ["PyTorch Geometric", "GraphSAGE", "REINFORCE", "SentenceTransformers", "LLM-as-Judge", "SDBench"],
    categories: ["Research", "RL / Agents"],
    accent: "#34d399",
    sections: [
      {
        heading: "The Problem: Coordination Failure in Multi-Agent Systems",
        body: "As AI systems move toward teams of specialized agents (LangGraph, AutoGen), a new failure mode emerges: adding more capable agents makes the system worse because coordination overhead dominates. CODAF targets this 'Complexity-Competence Gap' — where failures are caused not by lack of knowledge, but by routing the wrong task to the wrong agent at the wrong time.",
      },
      {
        heading: "The GNN Core — Learned Ability Embeddings",
        body: "The GNN takes each agent's static capability description (embedded via SentenceTransformer) and the current conversational state, and produces dynamic 'Ability Embeddings' that update every turn. This is what makes the allocator context-aware — the routing decision changes based on what's already been said. Two GraphSAGE layers aggregate neighbour information across the agent graph, combining static competence with live conversation state.",
        code: {
          title: "gnn_model.py — GraphSAGE forward pass",
          language: "python",
          code: `class AgentCapabilityGNN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index, state_embedding):
        # Broadcast conversation state to every agent node
        state_expanded = state_embedding.unsqueeze(0).expand(x.size(0), -1)
        # State-aware input: static capability + dynamic context
        x = torch.cat([x, state_expanded], dim=1)
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x  # [num_agents, out_channels] — dynamic ability embeddings`,
        },
      },
      {
        heading: "Multi-Factor Reward Design",
        body: "The REINFORCE gradient signal balances four competing objectives. The most non-obvious design choice was the Catastrophic Negligence penalty — in a medical diagnosis setting, missing a 'Red Flag' symptom is a safety-critical failure that the standard quality score alone cannot capture.",
        table: {
          headers: ["Signal", "Value", "Purpose"],
          rows: [
            ["Quality Score (correct diagnosis)", "+1.0 perfect · +0.5 partial", "Primary objective"],
            ["Turn Penalty", "−0.05 / turn", "Encourages parsimony"],
            ["Redundancy Penalty", "Triggered on back-to-back same agent", "Prevents looping"],
            ["Catastrophic Negligence", "−2.0 for missed 'Red Flag'", "Clinical safety"],
          ],
        },
      },
      {
        heading: "Results vs. Baselines",
        body: "",
        table: {
          headers: ["Metric", "Static Baseline", "Dynamic (no GNN)", "CODAF (GNN)"],
          rows: [
            ["Diagnostic Success Rate", "77.5%", "62.5%", "80.0% ✓"],
            ["Oracle Reasoning Accuracy", "—", "—", "88.8%"],
            ["Reasoning Quality (LRQ)", "—", "—", "4.2 / 5.0"],
            ["Avg. Path Cost", "$740", "$910", "$420 (−43%)"],
            ["Wasted Action Ratio", "15%", "38%", "4%"],
          ],
        },
        note: "The delta between 80% DSR and 88.8% Oracle accuracy is a policy calibration issue, not a reasoning failure. In 50% of errors, agents had already identified the correct diagnosis internally — the GNN simply terminated the episode prematurely due to conservative policy bias. This is a tunable reward weight, not an architectural flaw.",
      },
    ],
  },
  {
    id: "answer-engine",
    title: "Agentic Answer Engine",
    date: "Apr 2026",
    badge: "Self-Project",
    tldr: "A Perplexity-style scientific literature search engine with a 6-phase ML pipeline: HyDE query decomposition → hybrid retrieval → XGBoost LambdaMART re-ranking → CRAG hallucination detection → streaming synthesis.",
    chips: ["FastAPI", "Qdrant", "Elasticsearch", "XGBoost LambdaMART", "pplx-embed 1024-dim", "Llama-3.3-70B", "Docker", "DuckDB", "Groq"],
    categories: ["ML Systems", "RAG / LLM"],
    accent: "#60a5fa",
    sections: [
      {
        heading: "The Problem Standard RAG Doesn't Solve",
        body: "",
        table: {
          headers: ["Problem", "Naive RAG", "This Engine"],
          rows: [
            ["LLM hallucinations", "Trust the LLM", "CRAG Bouncer validates context quality before generation"],
            ["Keyword vs. semantic mismatch", "Pick one search type", "Qdrant (dense) + Elasticsearch (BM25) + RRF fusion"],
            ["All retrieved docs equally ranked", "Top-N by raw score", "XGBoost LambdaMART re-ranks on 9 engineered features"],
            ["Vague queries", "Pass raw text", "HyDE decomposes query into es_keywords + qdrant_hyde"],
            ["No training labels (cold start)", "Block on data", "LLM-as-judge synthetic telemetry via DuckDB"],
          ],
        },
      },
      {
        heading: "The 6-Phase Architecture",
        body: "Phase 1: HyDE Router (llama-3.1-8b-instant) decomposes the user query into es_keywords for sparse search and a qdrant_hyde hypothetical document for dense search.\n\nPhase 2: Parallel retrieval — Qdrant (pplx-embed-context-v1-0.6B, 1024-dim, INT8, HNSW) for semantic search and Elasticsearch (BM25) for keyword matching.\n\nPhase 3: Reciprocal Rank Fusion merges the two ranked lists (score = Σ 1 ÷ (rank + 60)).\n\nPhase 4: XGBoost LambdaMART re-ranker uses 9 engineered features including citation_velocity, title_body_divergence, and semantic_lexical_ratio to re-order the fused list.\n\nPhase 5: CRAG Bouncer classifies context quality as Correct / Incorrect / Ambiguous. Insufficient context triggers Tavily web fallback.\n\nPhase 6: Llama-3.3-70B streams a grounded response with inline citations via SSE.",
      },
      {
        heading: "Solving Cold Start with LLM-as-Judge",
        body: "The hardest engineering challenge: no relevance labels exist for scientific literature ranking. The solution is synthetic data generation — retrieve 50 candidates per query, prompt llama-3.1-8b-instant to score each (query, document) pair 0–3, store labels in DuckDB alongside 9 engineered features, then train XGBoost offline with rank:pairwise objective.",
        code: {
          title: "worker.py — Context-aware batch embedding with INT8",
          language: "python",
          code: `embedder = SentenceTransformer(
    "perplexity-ai/pplx-embed-context-v1-0.6B",
    trust_remote_code=True,
    device=device,
)

def embed_batch(papers: list[dict], batch_size: int = 32) -> list[list[float]]:
    # Context-aware encoding: prepend title so the encoder's
    # bidirectional attention contextualises each passage chunk
    texts = [
        f"Title: {p['title']}\\n\\nContent: {p['abstract']}"
        for p in papers
    ]
    vecs = embedder.encode(texts, batch_size=batch_size, normalize_embeddings=True)
    if device == "mps":
        torch.mps.empty_cache()
    return vecs.tolist()`,
        },
        note: "Features engineered: dense_score, sparse_score, doc_readability, exact_match_title, h_index, citation_velocity, title_body_divergence, semantic_lexical_ratio, query_intent. The ratio features outperformed the raw scores — the relationship between dense and sparse signals was more predictive than either alone.",
      },
    ],
  },
  {
    id: "papeer",
    title: "Papeer — Agentic Research Assistant",
    date: "May 2026",
    badge: "Self-Project",
    tldr: "A production-ready LangGraph RAG application for conversational paper analysis — with Corrective RAG, bounded query rewriting, SQLite session checkpointing, and a DeepEval continuous evaluation loop.",
    chips: ["LangGraph", "Qdrant", "Tavily", "SQLite Checkpointing", "DeepEval", "Streamlit", "ArXiv API"],
    categories: ["RAG / LLM"],
    accent: "#a78bfa",
    sections: [
      {
        heading: "What Makes This Production-Grade",
        body: "Four engineering decisions separate this from a toy RAG demo:\n\n1. Isolated SQLite checkpointing — each session's LangGraph state is persisted independently. restore_session replays the exact graph state from any prior turn without reprocessing.\n\n2. Corrective RAG with bounded retries — the LLM relevancy evaluator triggers query rewriting up to N times before falling back to web search. The bound prevents infinite loops on adversarial queries.\n\n3. /btw side-channel — off-topic questions bypass RAG and session history entirely. The LLM decides whether to search or answer directly, keeping the main conversation context clean.\n\n4. DeepEval evaluation loop — automated CI pipeline tracks Contextual Precision, Recall, and Answer Relevancy across every code change. Chunking strategy is optimised to consistently exceed 0.7 pass thresholds.",
      },
      {
        heading: "The CRAG Routing Logic",
        body: "Standard RAG pipelines have a binary flow: retrieve → generate. CRAG adds a classifier between retrieval and generation that grades the retrieved context on a three-way scale, then routes accordingly.",
        code: {
          title: "crag.py — Corrective RAG routing logic",
          language: "python",
          code: `def crag_router(state: GraphState) -> str:
    """
    Routes based on retrieval quality assessment.
    Returns a node name for the LangGraph conditional edge.
    """
    docs = state["documents"]
    question = state["question"]

    # Grade each retrieved document for relevancy
    grades = [grade_document(question, doc) for doc in docs]
    relevant = [g for g in grades if g == "yes"]

    if len(relevant) >= len(docs) * 0.5:
        return "generate"          # Sufficient context
    elif len(relevant) > 0:
        return "query_rewriter"    # Partial — try a better query
    else:
        return "web_search"        # No relevant context — go external`,
        },
      },
    ],
  },
  {
    id: "bid-o-matic",
    title: "Bid-O-Matic — Intelligent Ad Bidding Engine",
    date: "Apr 2026",
    badge: "Self-Project",
    tldr: "A high-fidelity Generalized Second Price (GSP) auction simulation with a full ML pipeline — from PySpark feature engineering and XGBoost/DLRM conversion prediction to a REINFORCE policy-gradient RL agent for bid shading.",
    chips: ["PySpark", "XGBoost", "PyTorch DLRM", "REINFORCE", "GSP Auction", "Contextual Bandits"],
    categories: ["ML Systems", "RL / Agents"],
    accent: "#fbbf24",
    sections: [
      {
        heading: "The Core Insight: Greedy Bidding Is Sub-Optimal",
        body: "In a Generalized Second Price auction, you pay the bid of the person ranked just below you — not your own bid. This means bidding your true expected value (EV) is a dominated strategy. The optimal strategy is bid shading: bid below your EV proportional to competition and budget state.\n\nThe RL agent learns a shading multiplier α ∈ [0.0, 2.0] conditioned on (budget_remaining_pct, time_of_day, ev). It bids aggressively (α > 1) on high-value early slots and conservatively (α < 1) when budget is low.",
        code: {
          title: "reinforce_agent.py — Bid shading policy network",
          language: "python",
          code: `class BidShadingPolicy(nn.Module):
    """
    Policy network mapping auction state → shading multiplier α.
    Trained with REINFORCE + reward clipping + advantage baselines.
    """
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(3, 64), nn.ReLU(),
            nn.Linear(64, 32), nn.ReLU(),
            nn.Linear(32, 1),
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        # state = [budget_pct, time_of_day, ev]
        alpha = torch.sigmoid(self.net(state)) * 2.0  # α ∈ [0, 2]
        return alpha

# Reward clipping + advantage baseline for training stability
def compute_advantage(rewards: list[float], baseline: float) -> list[float]:
    clipped = [max(min(r, 1.0), -1.0) for r in rewards]
    return [r - baseline for r in clipped]`,
        },
      },
      {
        heading: "Key Finding: XGBoost Beats Deep Learning on Tabular AdTech Data",
        body: "XGBoost outperformed the MiniDLRM deep learning model on tabular conversion prediction (higher ROC-AUC across all evaluation folds). This validates the established empirical finding that gradient-boosted trees remain superior for structured, tabular AdTech data where feature interactions are not spatial or sequential.\n\nThe DLRM architecture's strength comes from embedding sparse categorical features (user IDs, ad IDs) at scale. In a synthetic dataset without ID-level sparsity, that architectural advantage evaporates — and XGBoost's exact splits dominate.",
      },
    ],
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id);
}
