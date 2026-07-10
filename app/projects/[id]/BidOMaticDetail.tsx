"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { type Project } from "@/lib/projects";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

const A = "#fbbf24";

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

// ── static data ───────────────────────────────────────────────────
const PIPELINE_LAYERS = [
  {
    n: "01",
    title: "Synthetic Data Generation",
    file: "data_generator.py",
    color: "#8b5cf6",
    output: "1,000,000 search sessions · Parquet",
    desc: "Generates 1M realistic search sessions with context features (device, country, city, login status, loyalty tier), auction indicators (query intent, hotel occupancy, price competitiveness), and target labels (organic CVR, scroll depth, conversion value).",
  },
  {
    n: "02",
    title: "Big Data Feature Engineering",
    file: "feature_engineering.py",
    color: "#3b82f6",
    output: "engineered_features.parquet",
    desc: "Apache Spark aggregates three tiers of context: keyword-level historical CVR, broad device × country baselines, and granular multidimensional joints (device × country × city × hour). Volume guards prevent overfitting on sparse cells.",
  },
  {
    n: "03",
    title: "Predictive Modelling",
    file: "xgboost_agent.py  ·  dlrm_agent.py",
    color: A,
    output: "Trained CVR models",
    desc: "Two competing CVR predictors: XGBoost Classifier (native categorical support, higher AUC) and MiniDLRM (sparse embeddings → dense concat → fully-connected layers). XGBoost wins on tabular data — DLRM's ID-level sparsity advantage vanishes in synthetic datasets.",
  },
  {
    n: "04",
    title: "Reinforcement Learning Controller",
    file: "rl_agent.py  ·  environment.py",
    color: "#34d399",
    output: "best_rl_agent.pth",
    desc: "REINFORCE policy gradient learns a shading multiplier α ∈ [0, 2] conditioned on (budget_remaining_pct, time_of_day, ev). The gym-like environment simulates three competing bidders and bills under correct GSP rules.",
  },
];

const AGENTS = [
  {
    name: "Flat $2.00",
    type: "Baseline Heuristic",
    color: "#94a3b8",
    profit: "$202.27",
    auctions: "10,000",
    endBudget: "$962.70",
    strategy: "Bids exactly $2.00 for every auction regardless of context. Misses high-value traffic and never adapts to market dynamics. Ends the day having barely spent the budget.",
    verdict: "Poor",
    verdictColor: "#f87171",
  },
  {
    name: "XGBoost EV",
    type: "Greedy ML",
    color: "#60a5fa",
    profit: "$2,393.13",
    auctions: "10,000",
    endBudget: "$0.49",
    strategy: "Bids the exact expected value (EV = P(Convert) × Value) on every auction. Wins premium slots at second-price rates. Blind to market competition and budget trajectory across the day.",
    verdict: "Peak Profit",
    verdictColor: "#60a5fa",
  },
  {
    name: "RL Agent",
    type: "REINFORCE Policy",
    color: A,
    profit: "$2,076.86",
    auctions: "10,000",
    endBudget: "$0.21",
    strategy: "Dynamically shades bids based on remaining budget % and time of day. Conserves budget early, bids aggressively on high-value late impressions. Nearly exhausts the full $1,000 budget with 21¢ remaining.",
    verdict: "Best Pacing",
    verdictColor: A,
  },
];

const POLICY_CODE = `class BidShadingPolicy(nn.Module):
    """
    Policy network: auction state → shading multiplier α.
    REINFORCE + reward clipping + advantage baselines.
    """
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(3, 64), nn.ReLU(),
            nn.Linear(64, 32), nn.ReLU(),
            nn.Linear(32, 1),
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        # state = [budget_remaining_pct, time_of_day_normalised, ev]
        alpha = torch.sigmoid(self.net(state)) * 2.0  # α ∈ [0.0, 2.0]
        return alpha

def compute_advantage(rewards: list[float], baseline: float) -> list[float]:
    clipped = [max(min(r, 1.0), -1.0) for r in rewards]
    return [r - baseline for r in clipped]`;

// ── main component ────────────────────────────────────────────────
export default function BidOMaticDetail({ project }: { project: Project }) {
  const m1 = useCounter(10);
  const m2 = useCounter(2393, 1600);
  const m3 = useCounter(150);
  const m4 = useCounter(3);

  const [openAgent, setOpenAgent] = useState<number | null>(1);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 0%, #16100a 0%, #0c0805 60%)" }}>
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Breadcrumb */}
        <FadeIn direction="left">
          <div className="flex items-center gap-2 text-sm mb-10">
            <Link href="/projects" className="transition-colors" style={{ color: `${A}70` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = A}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${A}70`}>
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
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ color: A, borderColor: `${A}40`, background: `${A}10` }}>
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
                <span key={c} className="px-3 py-1 rounded-full font-mono text-sm border"
                  style={{ background: `${A}0c`, borderColor: `${A}30`, color: `${A}dd` }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Links */}
        <FadeIn delay={0.12}>
          <div className="flex gap-3 mb-12 flex-wrap">
            {/*
              TODO: uncomment when demo video is recorded and uploaded
              <a href={project.videoUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: A, color: "#000" }}>
                ▶ Watch Demo
              </a>
            */}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:brightness-110"
                style={{ borderColor: `${A}40`, color: A, background: `${A}08` }}>
                View on GitHub ↗
              </a>
            )}
          </div>
        </FadeIn>

        <div className="h-px w-full mb-14" style={{ background: `linear-gradient(90deg, ${A}35, transparent)` }} />

        {/* ── METRICS ───────────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: `${A}55` }}>
            At a Glance
          </div>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16" stagger={0.08}>
          {([
            { counter: m1, prefix: "",  suffix: "x",       label: "Profit vs Baseline",     sub: "RL vs flat $2 bidding"   },
            { counter: m2, prefix: "$", suffix: "",         label: "Peak Daily Profit",      sub: "XGBoost greedy agent"    },
            { counter: m3, prefix: "",  suffix: " epochs",  label: "RL Training Runs",       sub: "REINFORCE policy gradient" },
            { counter: m4, prefix: "",  suffix: " agents",  label: "Tournament Strategies",  sub: "baseline · ml · rl"      },
          ] as const).map((m, i) => (
            <StaggerItem key={i}>
              <div ref={m.counter.ref} className="rounded-2xl p-4 text-center"
                style={{ background: `${A}08`, border: `1px solid ${A}18` }}>
                <div className="font-mono text-3xl font-bold" style={{ color: A }}>
                  {m.prefix}{m.counter.val}{m.suffix}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mt-2">{m.label}</div>
                <div className="font-mono text-[10px] text-white/35 mt-1">{m.sub}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── GSP ECONOMICS ─────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>The Problem</div>
          <h2 className="text-2xl font-bold text-white mb-4">GSP Auction Economics</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            In a <strong className="text-white/85">Generalized Second Price (GSP)</strong> auction, the
            highest bidder wins but pays the second-highest bid. This single rule breaks the naive
            &ldquo;just bid what it&rsquo;s worth&rdquo; strategy.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          {/* How GSP works */}
          <div className="flex flex-col gap-2 mb-8">
            {[
              ["1", "Submit", "All advertisers submit sealed bids for the impression"],
              ["2", "Rank",   "Highest bidder wins the ad slot"],
              ["3", "Pay",    "Winner pays the second-highest bid + $0.01 — not their own bid"],
            ].map(([n, step, desc]) => (
              <div key={n} className="flex items-start gap-4 rounded-xl px-5 py-3"
                style={{ background: `${A}06`, border: `1px solid ${A}12` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0"
                  style={{ background: `${A}14`, color: A }}>{n}</div>
                <div>
                  <span className="font-semibold text-sm text-white/85 mr-2">{step}:</span>
                  <span className="text-sm text-white/65">{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Two formula cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            <div className="rounded-2xl p-5" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f87171" }}>
                Greedy Strategy (Baseline)
              </div>
              <div className="font-mono text-sm mb-3" style={{ color: "#fca5a5" }}>
                Bid = EV = P(Convert) × Value
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Optimal per auction in isolation. Fails at scale: overpays in competitive markets, drains budget on early sub-optimal impressions.
              </p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: `${A}06`, border: `1px solid ${A}20` }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>
                Bid Shading (RL Solution)
              </div>
              <div className="font-mono text-sm mb-3" style={{ color: `${A}dd` }}>
                Final Bid = EV × α(State)
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                α ∈ [0, 2] dynamically discounts or premiums the EV based on remaining budget and time of day. The RL agent learns α from experience.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ── PIPELINE ARCHITECTURE ─────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Architecture</div>
          <h2 className="text-2xl font-bold text-white mb-3">4-Layer Pipeline</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Four independent, swappable layers. Each layer consumes the output of the previous one as
            Parquet files — making reruns cheap and partial re-training trivial.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="flex flex-col mb-16">
            {PIPELINE_LAYERS.map((layer, i) => (
              <div key={i} className="flex gap-0">
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 z-10"
                    style={{ background: `${layer.color}14`, border: `1.5px solid ${layer.color}45`, color: layer.color }}>
                    {i + 1}
                  </div>
                  {i < PIPELINE_LAYERS.length - 1 && (
                    <div className="w-px flex-1 my-1"
                      style={{ background: `linear-gradient(to bottom, ${layer.color}35, ${PIPELINE_LAYERS[i + 1].color}35)` }} />
                  )}
                </div>
                <div className={`ml-4 rounded-xl p-4 flex-1 ${i < PIPELINE_LAYERS.length - 1 ? "mb-2" : ""}`}
                  style={{ background: `${layer.color}06`, border: `1px solid ${layer.color}18` }}>
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <span className="font-bold text-base text-white/90">{layer.title}</span>
                    <span className="font-mono text-xs" style={{ color: `${layer.color}80` }}>{layer.file}</span>
                  </div>
                  <div className="font-mono text-xs mb-2" style={{ color: `${layer.color}70` }}>
                    → {layer.output}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── THREE AGENTS ──────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Evaluation</div>
          <h2 className="text-2xl font-bold text-white mb-3">Three Bidding Strategies</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Each agent runs the full tournament: 10,000 auctions, $1,000 daily budget, identical search traffic.
            Three competitors in each auction: Aggressive, Conservative, and Random.
          </p>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-4 mb-6" stagger={0.1}>
          {AGENTS.map((agent, i) => (
            <StaggerItem key={i}>
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${agent.color}22` }}>
                <button
                  onClick={() => setOpenAgent(openAgent === i ? null : i)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  style={{ background: `${agent.color}06` }}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <span className="font-bold text-base" style={{ color: agent.color }}>{agent.name}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ background: `${agent.color}10`, border: `1px solid ${agent.color}25`, color: `${agent.color}bb` }}>
                        {agent.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 font-mono text-xs text-white/50">
                      <span>profit: <strong style={{ color: agent.color }}>{agent.profit}</strong></span>
                      <span>end budget: <strong className="text-white/65">{agent.endBudget}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: `${agent.verdictColor}15`, color: agent.verdictColor }}>
                      {agent.verdict}
                    </span>
                    <span className="font-mono text-xs text-white/30">{openAgent === i ? "▾" : "▸"}</span>
                  </div>
                </button>
                {openAgent === i && (
                  <div className="px-5 py-4 border-t text-sm text-white/65 leading-relaxed"
                    style={{ borderColor: `${agent.color}12` }}>
                    {agent.strategy}
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Tournament table */}
        <FadeIn delay={0.08}>
          <div className="overflow-x-auto rounded-xl border mb-10" style={{ borderColor: `${A}18` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${A}0c`, borderBottom: `1px solid ${A}22` }}>
                  {["Strategy", "Total Profit", "End Budget", "Characteristics"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: A }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Flat $2.00",     "$202.27",    "$962.70", "Misses high-value traffic; barely spends budget"],
                  ["XGBoost EV",     "$2,393.13",  "$0.49",   "Wins premium auctions; blind to budget trajectory"],
                  ["RL Agent",       "$2,076.86",  "$0.21",   "Paces spend precisely; $0.21 left at day end"],
                ].map((row, ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td className="px-4 py-3 font-mono text-xs font-bold"
                      style={{ color: [AGENTS[0].color, AGENTS[1].color, AGENTS[2].color][ri] }}>
                      {row[0]}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-white/80">{row[1]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/55">{row[2]}</td>
                    <td className="px-4 py-3 text-xs text-white/60 leading-relaxed">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Tournament results chart */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              Cumulative Profit Over 10,000 Auctions
            </div>
            <img
              src="/bid-o-matic/tournament_results.png"
              alt="Tournament results: cumulative profit comparison across all three bidding strategies"
              className="w-full block"
              style={{ background: "#fff" }}
            />
          </div>
        </FadeIn>

        {/* ── MDP FORMULATION ───────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Reinforcement Learning</div>
          <h2 className="text-2xl font-bold text-white mb-4">Markov Decision Process</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            Budget pacing modelled as a continuous-action MDP. The agent observes auction state,
            outputs a shading multiplier, and receives a reward signal that directly measures economic value.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              {
                label: "State  Sₜ",
                color: "#8b5cf6",
                items: [
                  ["EV_t",                  "Expected value of this impression"],
                  ["budget_remaining_%",     "Fraction of daily budget still available"],
                  ["time_of_day_t",          "Normalised hour — proxies remaining impressions"],
                ],
              },
              {
                label: "Action  αₜ",
                color: A,
                items: [
                  ["α ∈ [0.0, 2.0]",    "Continuous shading multiplier"],
                  ["α < 1.0",            "Bid below EV — conservative, saves budget"],
                  ["α > 1.0",            "Bid above EV — aggressive, wins competitive slots"],
                ],
              },
              {
                label: "Reward  Rₜ",
                color: "#34d399",
                items: [
                  ["Value × (1 − P_organic)",  "Incremental value from winning (subtract organic)"],
                  ["− CPC",                    "Minus the second-price cost paid"],
                  ["clipped to [−1, 1]",       "Stabilises REINFORCE gradient updates"],
                ],
              },
              {
                label: "Environment",
                color: "#f87171",
                items: [
                  ["3 competitors",        "Aggressive · Conservative · Random/Noisy"],
                  ["GSP billing",          "Winner pays second-highest bid + $0.01"],
                  ["Budget tracking",      "Daily budget decremented after each win"],
                ],
              },
            ].map(card => (
              <div key={card.label} className="rounded-2xl p-5"
                style={{ background: `${card.color}06`, border: `1px solid ${card.color}18` }}>
                <div className="font-mono text-sm font-bold mb-3" style={{ color: card.color }}>{card.label}</div>
                <div className="flex flex-col gap-1.5">
                  {card.items.map(([key, desc]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <span className="font-mono shrink-0" style={{ color: `${card.color}99` }}>{key}</span>
                      <span className="text-white/55">— {desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Policy network code */}
        <FadeIn delay={0.06}>
          <div className="rounded-xl overflow-hidden border mb-16" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0d0a05" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#141008" }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-white/45 ml-2">rl_agent.py  —  BidShadingPolicy</span>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto" style={{ color: "#fde68a" }}>
              {POLICY_CODE}
            </pre>
          </div>
        </FadeIn>

        {/* ── XGBOOST RESULTS ───────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Feature Engineering</div>
          <h2 className="text-2xl font-bold text-white mb-4">XGBoost Feature Importance</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            <strong className="text-white/85">Loyalty tier dominates</strong> with an F-score nearly 50% higher
            than the next feature — a loyal customer's prior behaviour is the strongest predictor of conversion.
            Past bookings count and query intent score follow, with price competitiveness index
            contributing further down. Historical contextual aggregates (device × country × city × hour)
            add granular signal only where sample volume supports reliable estimates.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              XGBoost Feature Gain Rankings
            </div>
            <img
              src="/bid-o-matic/xgboost_feature_importance.png"
              alt="XGBoost feature importance: query intent and price competitiveness index are dominant signals"
              className="w-full block"
              style={{ background: "#fff" }}
            />
          </div>
        </FadeIn>

        {/* ── RL TRAINING CURVE ─────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Training</div>
          <h2 className="text-2xl font-bold text-white mb-4">REINFORCE Learning Curve</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            The policy starts with high exploration noise, discovering the bid landscape. Around epoch 50 it
            converges on a stable conservative strategy before locking into a high-profit shading policy by
            epoch 100. The final policy sustains performance without regression — a sign that
            <strong className="text-white/85"> reward clipping and advantage baselines</strong> prevented
            the variance explosion that afflicts vanilla REINFORCE.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              Daily Net Reward over 150 Training Epochs
            </div>
            <img
              src="/bid-o-matic/rl_learning_curve_stable.png"
              alt="RL training curve: reward increases over 150 epochs and stabilises with reward clipping"
              className="w-full block"
              style={{ background: "#fff" }}
            />
          </div>
        </FadeIn>

        {/* ── ENGINEERING DECISIONS ─────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Engineering Takeaways</div>
          <h2 className="text-2xl font-bold text-white mb-6">Four Key Decisions</h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16" stagger={0.08}>
          {[
            {
              n: "01",
              title: "Parquet over CSV",
              color: "#8b5cf6",
              body: "Parquet columnar encoding shrunk the 1M-session synthetic dataset by over 80% and cut training data load latency significantly. The format also preserves schema — no dtype inference bugs on reload.",
            },
            {
              n: "02",
              title: "Spark for Feature Aggregations",
              color: "#3b82f6",
              body: "Processing 1M+ search sessions in-memory with Pandas would OOM on a laptop. PySpark's lazy evaluation and partitioned execution handles multi-dimensional joins (device × country × city × hour) without materialising intermediate tables.",
            },
            {
              n: "03",
              title: "Limits of Pure Prediction",
              color: A,
              body: "XGBoost and DLRM predict CVR accurately. But CVR prediction is a greedy, myopic objective — it sees each auction in isolation. It cannot model competition, budget state, or intra-day price dynamics. This is what the RL agent learns.",
            },
            {
              n: "04",
              title: "RL for Constrained Budgets",
              color: "#34d399",
              body: "Policy gradients proved highly effective for the budget pacing problem. By conditioning on remaining budget % and time of day, the agent learns to bid conservatively when budget is low — behaviour impossible to express in a pure CVR model.",
            },
          ].map(card => (
            <StaggerItem key={card.n}>
              <div className="rounded-2xl p-5 h-full" style={{ background: `${card.color}06`, border: `1px solid ${card.color}18` }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0"
                    style={{ background: `${card.color}14`, color: card.color }}>{card.n}</div>
                  <span className="font-semibold text-sm text-white/85">{card.title}</span>
                </div>
                <p className="text-sm text-white/65 leading-relaxed">{card.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── FOOTER NAV ─────────────────────────────────────────── */}
        <div className="pt-8 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link href="/projects" className="text-sm font-semibold transition-colors" style={{ color: `${A}70` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = A}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = `${A}70`}>
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
