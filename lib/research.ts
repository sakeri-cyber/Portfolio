export type Paper = {
  id: string;
  track: "reading" | "impl";
  venue: string;
  year: string;
  title: string;
  summary: string;
  tags: string[];
  accent: string;
  sections: {
    heading: string;
    body: string;
    code?: { title: string; code: string };
  }[];
};

export const PAPERS: Paper[] = [
  {
    id: "fused-cross-entropy",
    track: "impl",
    venue: "Kosson et al.",
    year: "2024",
    title: "Cut Your Losses in Large-Vocabulary LLMs",
    summary: "Block-wise online softmax to eliminate global logit materialisation — 2× TFLOPS throughput, O(N) memory vs O(N×V).",
    tags: ["2× TFLOPS throughput", "O(N) memory", "Custom Triton kernel"],
    accent: "#60a5fa",
    sections: [
      {
        heading: "The Bottleneck",
        body: "Standard cross-entropy loss in large-vocabulary LLMs requires materialising the full logit matrix of shape [batch × seq_len, vocab_size]. At V = 128,000 (LLaMA-3 vocabulary), this is a colossal SRAM footprint that causes HBM bandwidth saturation — the dominant bottleneck before you've even computed the loss.\n\nMemory complexity scales as O(N × V). The paper reduces it to O(N) by never materialising the full matrix in global memory. The key insight is that the softmax denominator and the target logit can be computed in the same kernel pass, sweeping through the vocabulary in fixed-size BLOCK_V tiles using Welford-style online accumulation.",
      },
      {
        heading: "My Implementation",
        body: "The core idea: compute the softmax denominator and the target logit in the same Triton kernel, sweeping through the vocabulary in BLOCK_SIZE tiles. No full logit tensor is written to HBM at any point.",
        code: {
          title: "fused_cross_entropy.py — Block-wise Triton kernel",
          code: `@triton.jit
def fused_cross_entropy_fwd(
    logits_ptr, labels_ptr, loss_ptr,
    N, V,
    BLOCK_V: tl.constexpr,
):
    """One program per sequence position — sweeps vocabulary in BLOCK_V tiles."""
    row = tl.program_id(0)
    label = tl.load(labels_ptr + row)

    m = -float("inf")   # running max (Welford-style numerical stability)
    d = 0.0             # running denominator: sum(exp)
    target_logit = 0.0

    for start in range(0, V, BLOCK_V):
        cols = start + tl.arange(0, BLOCK_V)
        mask = cols < V
        x = tl.load(logits_ptr + row * V + cols, mask=mask, other=-float("inf"))

        block_max = tl.max(x, axis=0)
        m_new = tl.maximum(m, block_max)
        d = d * tl.exp(m - m_new) + tl.sum(tl.exp(x - m_new), axis=0)
        m = m_new

        target_logit += tl.sum(tl.where(cols == label, x, 0.0), axis=0)

    loss = tl.log(d) + m - target_logit
    tl.store(loss_ptr + row, loss)`,
        },
      },
      {
        heading: "Result",
        body: "Achieved a 2× TFLOPS throughput increase over the standard torch.nn.CrossEntropyLoss implementation by bypassing global logit materialisation. Memory complexity dropped from O(N × V) to O(N) — enabling training with larger batch sizes or longer sequences under the same VRAM budget.\n\nThe implementation revealed an interesting secondary insight: the bottleneck in the naive implementation is not the softmax computation itself, but the memory round-trip — writing the full [N, V] logit tensor to HBM and then reading it back for the loss. The Triton kernel eliminates both trips.",
      },
    ],
  },
  {
    id: "pplx-embed",
    track: "impl",
    venue: "Perplexity AI",
    year: "2025",
    title: "Diffusion-Pretrained Dense and Contextual Embeddings (pplx-embed)",
    summary: "Converting a causal LM into a bidirectional dense retriever via continuous-time diffusion pretraining.",
    tags: ["1024-dim context embeddings", "INT8 quantisation (STE)", "Dual-objective chunking", "InfoNCE contrastive loss"],
    accent: "#60a5fa",
    sections: [
      {
        heading: "The Architecture Insight",
        body: "Standard dense retrieval encoders are trained as bidirectional models (BERT-style). pplx-embed is architecturally different: it starts from a causal LM (left-to-right decoder) and converts it into a bidirectional encoder by training it to denoise corrupted text at continuous noise levels — a continuous-time diffusion objective.\n\nThe result is a model with richer contextual representations than models trained purely on contrastive pairs. The denoising pretraining task is harder than next-token prediction — the model must reconstruct the full input from a noisy version, forcing it to develop long-range bidirectional attention patterns even though the base architecture was causal.",
      },
      {
        heading: "My Implementation",
        body: "Built a memory-efficient retrieval pipeline using the released pplx-embed-context-v1-0.6B weights (1024-dim, 600M params). Key decisions: context-aware encoding that prepends the paper title to each abstract chunk, INT8 quantisation via Straight-Through Estimator for the Qdrant upsert path, and dual-objective chunking to simultaneously maximise passage-level coherence and lexical overlap with likely queries.",
        code: {
          title: "worker.py — Context-aware batch embedding with INT8 quantisation",
          code: `embedder = SentenceTransformer(
    "perplexity-ai/pplx-embed-context-v1-0.6B",
    trust_remote_code=True,
    device=device,
)

def embed_batch(papers: list[dict], batch_size: int = 32) -> list[list[float]]:
    texts = [
        f"Title: {p['title']}\\n\\nContent: {p['abstract']}"
        for p in papers
    ]
    # Normalise for cosine ANN — required for Qdrant HNSW inner-product index
    vecs = embedder.encode(texts, batch_size=batch_size, normalize_embeddings=True)

    # Free Apple Silicon MPS allocator pools between batches
    if device == "mps":
        torch.mps.empty_cache()

    return vecs.tolist()`,
        },
      },
    ],
  },
  {
    id: "type-checked-compliance",
    track: "impl",
    venue: "Neuro-symbolic systems",
    year: "2025",
    title: "Type-Checked Compliance for Agentic Systems",
    summary: "Neuro-symbolic feedback loop integrating Z3 SMT solver formal constraint verification into LLM ReACT agent traces.",
    tags: ["Z3 SMT solver integration", "Deterministic guardrails", "NL violation feedback", "Financial workflow automation"],
    accent: "#60a5fa",
    sections: [
      {
        heading: "The Problem",
        body: "LLM-based agents operating in financial workflows (payment routing, transaction approval) cannot rely on soft refusals — 'I think this might violate policy' is not acceptable when regulatory compliance is binary.\n\nThe paper introduces a neuro-symbolic feedback loop: the LLM proposes an action; an SMT solver verifies it against formal constraints; violations are converted back to natural language and injected into the ReACT scratchpad. The LLM sees the formal reason for refusal in its own scratchpad format and attempts a revised action — without requiring prompt re-engineering for each new policy constraint.",
      },
      {
        heading: "My Implementation",
        body: "The key design decision: Z3 violations are translated to natural language JSON parameters and injected back into the ReACT agent's Observation: field. This creates a deterministic correction loop. Constraints are updated in Python; the LLM's core reasoning prompt is untouched.",
        code: {
          title: "compliance.py — Z3 formal constraint verification for ReACT",
          code: `def verify_transaction(action: dict, account_state: dict) -> tuple[bool, str | None]:
    s = Solver()
    amount = Real("amount")
    daily_spend = Real("daily_spend")
    balance = Real("balance")

    s.add(amount == action["amount"])
    s.add(daily_spend == account_state["daily_spend"] + action["amount"])
    s.add(balance == account_state["balance"] - action["amount"])

    s.add(And(
        amount <= 10_000,        # max single transaction
        daily_spend <= 50_000,   # max daily spend
        balance >= 500,          # min balance buffer
    ))

    if s.check() == sat:
        return True, None

    violations = []
    if action["amount"] > 10_000:
        violations.append("Single transaction limit exceeded")
    if account_state["daily_spend"] + action["amount"] > 50_000:
        violations.append("Daily spend cap would be breached")

    return False, "POLICY VIOLATION — " + "; ".join(violations) + ". Revise the action."`,
        },
      },
    ],
  },
  {
    id: "pplx-embed-reading",
    track: "reading",
    venue: "Perplexity AI",
    year: "2025",
    title: "pplx-embed: A Critical Reading",
    summary: "The causal→bidirectional conversion via continuous diffusion is underutilised in the literature. My take on why this architectural move matters and where it falls short.",
    tags: ["Architecture critique", "Dense retrieval", "My commentary"],
    accent: "#fb923c",
    sections: [
      {
        heading: "What They Got Right",
        body: "The most interesting architectural detail is how they handle the causal mask — they don't just remove it; they replace the causal attention pattern with a diffusion-based bidirectional objective that forces the model to fill in masked tokens across positions.\n\nThis is why it outperforms standard BERT-style encoders on long-context retrieval: the model has learned to denoise, which is a harder pretraining task than next-token prediction, and this generalises better to passage-level coherence. The model has implicitly learned to reason about both local and global text structure.",
      },
      {
        heading: "What I Would Investigate Next",
        body: "Open question: can this technique be applied to smaller decoder models (1B–3B range) to produce strong retrieval models without the expensive diffusion pretraining corpus?\n\nThe paper trains on a proprietary corpus. The main bottleneck preventing community adoption is not the architecture — it's the data. An ablation showing that a much smaller diffusion-pretrained retriever (trained on public data like C4 + MS-MARCO) can match a larger BERT-style encoder would be a significant contribution.\n\nSecond open question: the dual-objective chunking strategy they describe (simultaneously maximising passage coherence and lexical overlap with likely queries) is described in two sentences. I'd like to see this ablated — how much of the BEIR benchmark improvement comes from the architecture vs. the chunking strategy?",
      },
    ],
  },
  {
    id: "compliance-reading",
    track: "reading",
    venue: "ArXiv",
    year: "2025",
    title: "Type-Checked Compliance: What the Paper Doesn't Tell You",
    summary: "Commentary on the neuro-symbolic approach to agentic compliance — compelling architecture, but the real limitation is constraint expressibility and the gap between natural language policy and formal specification.",
    tags: ["Commentary", "Agentic AI", "Formal methods", "My analysis"],
    accent: "#fb923c",
    sections: [
      {
        heading: "What I Find Compelling",
        body: "The feedback injection pattern — converting Z3's unsat core back to natural language and injecting it as a ReACT Observation — is genuinely elegant. It preserves the agent's reasoning flow without requiring prompt re-engineering for each policy change. The constraint layer is entirely decoupled from the LLM layer.\n\nThis is the right abstraction boundary. Compliance policies change frequently (regulatory updates, business rule changes). If each policy change required prompt re-engineering, the system would be unmaintainable at enterprise scale.",
      },
      {
        heading: "The Limitation Nobody Discusses",
        body: "Z3 in this setup can only verify what you've formally specified. The compliance policy itself must be formalizable in first-order logic over real arithmetic.\n\nFor regulatory requirements written in natural language (most compliance documents), there's a translation step that's entirely manual and error-prone. The paper glosses over this completely — they demonstrate the system on clean, already-formalised constraints.\n\nThe interesting next step: use an LLM to auto-translate natural language policies to Z3 assertions, with a human-in-the-loop validation pass. The LLM generates the formal spec; a compliance officer approves it; Z3 enforces it. That closes the loop. I'd estimate this is 12–18 months from production readiness.",
      },
    ],
  },
];

export function getPaper(id: string): Paper | undefined {
  return PAPERS.find(p => p.id === id);
}
