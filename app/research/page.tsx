"use client";
import { useState } from "react";

const ACCENT_READ = "#fb923c";
const ACCENT_IMPL = "#60a5fa";

type PaperCard = {
  track: "reading" | "impl";
  venue: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  content_label?: string;
  code?: { title: string; snippet: string };
};

const PAPERS: PaperCard[] = [
  {
    track: "impl",
    venue: "Kosson et al., 2024",
    title: "Cut Your Losses in Large-Vocabulary LLMs",
    summary: "Block-wise online softmax to eliminate global logit materialisation — 2× TFLOPS, O(N) memory.",
    tags: ["2× TFLOPS throughput", "O(N) memory vs O(N×V)", "Custom Triton kernel"],
    content: "Standard cross-entropy loss in large-vocabulary LLMs requires materialising the full logit matrix of shape [batch × seq_len, vocab_size]. At V = 128,000 (LLaMA-3 vocabulary), this causes HBM bandwidth saturation. The paper reduces memory complexity from O(N×V) to O(N) by never materialising the full matrix in global memory. My implementation: compute the softmax denominator and the target logit in the same Triton kernel, sweeping through the vocabulary in BLOCK_SIZE tiles.",
    code: {
      title: "fused_cross_entropy.py — Block-wise Triton kernel",
      snippet: `@triton.jit
def fused_cross_entropy_fwd(logits_ptr, labels_ptr, loss_ptr, N, V, BLOCK_V: tl.constexpr):
    row = tl.program_id(0)
    label = tl.load(labels_ptr + row)
    m = -float("inf")   # running max
    d = 0.0             # running denominator
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
    track: "impl",
    venue: "Perplexity AI, 2025",
    title: "Diffusion-Pretrained Dense and Contextual Embeddings (pplx-embed)",
    summary: "Converting a causal LM into a bidirectional dense retriever via continuous-time diffusion pretraining.",
    tags: ["1024-dim context embeddings", "INT8 quantisation (STE)", "Dual-objective chunking", "InfoNCE contrastive loss"],
    content: "pplx-embed starts from a causal LM and converts it into a bidirectional encoder by training it to denoise corrupted text at continuous noise levels — a continuous-time diffusion objective. The result is richer contextual representations than models trained purely on contrastive pairs. I built a memory-efficient retrieval pipeline using the released pplx-embed-context-v1-0.6B weights with INT8 quantisation via Straight-Through Estimator.",
    code: {
      title: "worker.py — Context-aware batch embedding with INT8 quantisation",
      snippet: `embedder = SentenceTransformer(
    "perplexity-ai/pplx-embed-context-v1-0.6B",
    trust_remote_code=True, device=device,
)

def embed_batch(papers: list[dict], batch_size: int = 32) -> list[list[float]]:
    texts = [f"Title: {p['title']}\\n\\nContent: {p['abstract']}" for p in papers]
    vecs = embedder.encode(texts, batch_size=batch_size, normalize_embeddings=True)
    if device == "mps":
        torch.mps.empty_cache()  # Free Apple Silicon MPS allocator pools
    return vecs.tolist()`,
    },
  },
  {
    track: "impl",
    venue: "Neuro-symbolic systems",
    title: "Type-Checked Compliance for Agentic Systems",
    summary: "Neuro-symbolic feedback loop integrating Z3 SMT solver into LLM ReACT agent traces for deterministic guardrails.",
    tags: ["Z3 SMT solver integration", "Deterministic guardrails", "NL violation feedback", "Financial workflow automation"],
    content: "LLM-based agents in financial workflows cannot rely on soft refusals — 'I think this might violate policy' is not acceptable when regulatory compliance is binary. The paper introduces a neuro-symbolic feedback loop: the LLM proposes an action; an SMT solver verifies it against formal constraints; violations are converted back to natural language and injected into the ReACT scratchpad. Constraints update in Python; the LLM's core reasoning prompt is untouched.",
    code: {
      title: "compliance.py — Z3 formal constraint verification for ReACT",
      snippet: `def verify_transaction(action: dict, account_state: dict) -> tuple[bool, Optional[str]]:
    s = Solver()
    amount, daily_spend, balance = Real("amount"), Real("daily_spend"), Real("balance")
    s.add(amount == action["amount"])
    s.add(daily_spend == account_state["daily_spend"] + action["amount"])
    s.add(And(
        amount <= 10_000,
        daily_spend <= 50_000,
        balance >= 500,
    ))
    if s.check() == sat:
        return True, None
    violations = []
    if action["amount"] > 10_000:
        violations.append(f"Single tx limit exceeded: $" + str(action['amount']))
    return False, "POLICY VIOLATION — " + "; ".join(violations) + ". Revise the action."`,
    },
  },
  {
    track: "reading",
    venue: "NeurIPS 2024 · Perplexity AI",
    title: "pplx-embed: Diffusion-Pretrained Dense Retrieval",
    summary: "My take: the causal→bidirectional conversion via continuous diffusion is underutilised. The key insight is using denoising as a pretraining objective rather than contrastive pairs — this gives richer representations at the cost of training complexity.",
    tags: ["Architecture analysis", "Dense retrieval", "My critique"],
    content: "The most interesting architectural detail is how they handle the causal mask — they don't just remove it; they replace the causal attention pattern with a diffusion-based bidirectional objective that forces the model to 'fill in' masked tokens across positions. This is why it outperforms standard BERT-style encoders on long-context retrieval: the model has learned to denoise, which is a harder pretraining task than next-token prediction, and this generalises better to passage-level coherence.\n\nOpen question I'd investigate: can this technique be applied to smaller decoder models (1B-3B range) to produce strong retrieval models without the expensive diffusion pretraining corpus?",
    content_label: "My Reading Notes",
  },
  {
    track: "reading",
    venue: "ArXiv 2025",
    title: "Type-Checked Compliance for Agentic Systems",
    summary: "Commentary: the neuro-symbolic approach is compelling but the real limitation is constraint expressibility. Z3 handles linear arithmetic well but breaks down on probabilistic or temporal constraints.",
    tags: ["Commentary", "Agentic AI", "Formal methods"],
    content: "What I find most promising about this paper is the feedback injection pattern — converting Z3's unsat core back to natural language and injecting it as a ReACT Observation. This preserves the agent's reasoning flow without requiring prompt re-engineering for each policy change.\n\nThe limitation nobody discusses: Z3 in this setup can only verify what you've formally specified. The compliance policy itself must be formalizable in first-order logic over real arithmetic. For regulatory requirements written in natural language (most compliance documents), there's a translation step that's entirely manual and error-prone. The interesting next step is using an LLM to auto-translate natural language policies to Z3 assertions — with a human-in-the-loop validation pass.",
    content_label: "My Analysis",
  },
];

export default function ResearchPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const reading = PAPERS.filter(p => p.track === "reading");
  const impl    = PAPERS.filter(p => p.track === "impl");

  function Card({ paper, idx }: { paper: PaperCard; idx: number }) {
    const accent = paper.track === "reading" ? ACCENT_READ : ACCENT_IMPL;
    const isOpen = openId === idx;
    return (
      <div className="rounded-xl border transition-all duration-300 cursor-pointer"
        style={{ background: `${accent}08`, borderColor: isOpen ? `${accent}40` : `${accent}18` }}
        onClick={() => setOpenId(isOpen ? null : idx)}>
        <div className="p-4">
          <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: `${accent}90` }}>{paper.venue}</div>
          <div className="font-semibold text-sm text-white/80 leading-snug mb-2">{paper.title}</div>
          <p className="text-[11px] text-white/40 leading-relaxed mb-3">{paper.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            {paper.tags.map(t => (
              <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${accent}0f`, border: `1px solid ${accent}25`, color: `${accent}cc` }}>
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-semibold flex items-center gap-1" style={{ color: `${accent}70` }}>
            <span style={{ display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
            {isOpen ? "Collapse" : paper.track === "reading" ? "Read my notes" : "See implementation"}
          </div>
        </div>

        {isOpen && (
          <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: `${accent}15` }}
            onClick={e => e.stopPropagation()}>
            {paper.content_label && (
              <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: `${accent}70` }}>{paper.content_label}</div>
            )}
            <div className="text-xs text-white/45 leading-relaxed whitespace-pre-line mb-3">{paper.content}</div>
            {paper.code && (
              <div className="rounded-lg overflow-hidden border text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#080808" }}>
                <div className="px-3 py-1.5 text-[9px] font-mono text-white/25 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {paper.code.title}
                </div>
                <pre className="p-3 font-mono text-[10px] leading-relaxed overflow-x-auto" style={{ color: paper.track === "impl" ? "#93c5fd" : "#fcd34d" }}>
                  {paper.code.snippet}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 60% at 85% 0%, #1a0d06 0%, #100805 65%)" }}>
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="mb-2 font-mono text-xs" style={{ color: `${ACCENT_READ}60` }}>research /</div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Research & Papers</h1>
        <p className="text-sm text-white/40 mb-4 max-w-2xl">
          Two tracks: critical reading and commentary on influential papers, and ground-up implementations that go from PDF to working optimised code.
        </p>

        {/* Legend */}
        <div className="flex gap-5 mb-12 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-3 h-3 rounded-sm" style={{ background: `${ACCENT_READ}40` }} />
            <span style={{ color: ACCENT_READ }}>Paper Club</span> — I read, critique, and discuss the idea
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="w-3 h-3 rounded-sm" style={{ background: `${ACCENT_IMPL}40` }} />
            <span style={{ color: ACCENT_IMPL }}>Implementations</span> — I build it from scratch, nuts to bolts
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reading column */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT_READ }}>📖 Paper Club · Critical Reading</span>
            </div>
            <div className="flex flex-col gap-4">
              {reading.map((p, i) => <Card key={i} paper={p} idx={i} />)}
            </div>
          </div>

          {/* Implementation column */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT_IMPL }}>⚙️ Implementations · Nuts & Bolts</span>
            </div>
            <div className="flex flex-col gap-4">
              {impl.map((p, i) => <Card key={i + 100} paper={p} idx={i + 100} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
