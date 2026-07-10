"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { type Project } from "@/lib/projects";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";

const A = "#2dd4bf";

// ── animated counter ─────────────────────────────────────────────
function useCounter(target: number, duration = 1400, decimals = 0) {
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
        const raw = p * target;
        setVal(decimals ? Math.round(raw * 10 ** decimals) / 10 ** decimals : Math.floor(raw));
        if (p < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals]);
  return { val, ref };
}

// ── static data ───────────────────────────────────────────────────
const PIPELINE_PHASES = [
  {
    n: "01",
    title: "Synthetic World (DGP)",
    file: "dgp/{market,demand,policy,oracle}.py",
    color: "#8b5cf6",
    output: "~300K logged quotes · known ground truth",
    desc: "A confounded logging policy, regime-switching GARCH market rates, jagged cliff-shaped demand curves, and an oracle that computes the true optimal price — so every downstream claim can be graded against reality, not just an offline metric.",
  },
  {
    n: "02",
    title: "Win-Probability Model",
    file: "models/win_model.py",
    color: "#3b82f6",
    output: "Calibrated P(win | price, context)",
    desc: "A LightGBM classifier that captures the demand curve's cliffs — a smooth logistic regression structurally cannot — with isotonic calibration so the probabilities are trustworthy inputs to an expected-value calculation.",
  },
  {
    n: "03",
    title: "Per-Quote Optimizer",
    file: "optimizer/price_optimizer.py",
    color: A,
    output: "argmax (price − cost) × P(win | price)",
    desc: "Grid-searches the profit-maximising price per quote under margin floors, graded under the TRUE demand curve — the honest evaluation protocol that makes every uplift number in this project defensible.",
  },
  {
    n: "04",
    title: "Probabilistic Rate Forecaster",
    file: "forecast/rate_forecaster.py",
    color: "#f59e0b",
    output: "P10 / P50 / P90 market-rate bands",
    desc: "LightGBM quantile regression on the log-return (not the level — trees can't extrapolate), conformalised for a coverage guarantee. Feeds risk-aware margin floors: wide bands mean a volatile market.",
  },
  {
    n: "05",
    title: "Portfolio LP Optimizer",
    file: "optimizer/portfolio.py",
    color: "#34d399",
    output: "Capacity-aware book pricing · shadow price",
    desc: "A linear program (PuLP) allocating prices across simultaneously-open quotes under one shared, finite ship capacity. The LP's dual variable is the classic revenue-management bid price — and it emerges, not hand-coded.",
  },
  {
    n: "06",
    title: "Off-Policy Evaluation",
    file: "ope/estimators.py",
    color: "#f472b6",
    output: "IPW · SNIPW · Doubly Robust",
    desc: "Proves the pricing policy's uplift directly from confounded historical logs — no live A/B test needed — and, in doing so, uncovered a genuine 'optimiser's curse' bias in naive doubly-robust evaluation.",
  },
];

const OPE_TABLE = [
  ["Naive matched-mean", "$432.7", "$10.7", "no propensity correction"],
  ["IPW", "$433.2", "$10.2", "closest to truth — high variance"],
  ["Self-normalized IPW", "$456.8", "$13.4", "lower variance than raw IPW"],
  ["Direct Method", "$524.9", "$81.5", "biased high — optimiser's curse"],
  ["Doubly Robust", "$546.1", "$102.7", "biased high — inherits DM's bias"],
];

const POLICY_TABLE = [
  ["Oracle (upper bound)", "$496.4", "—"],
  ["Nautilus optimizer", "$443.4", "$53.0"],
  ["Best cost-plus (30%, tuned)", "$377.8", "$118.6"],
  ["Naive cost-plus (20%)", "$343.5", "$152.9"],
  ["Logged human policy", "$337.7", "$158.7"],
];

const DEMAND_CODE = `def win_prob(cfg, price, params):
    """P(win | price) = Base(logistic) x Ceiling(BATNA) x Cliff(competitor)"""
    base = expit(-params.k * (price - params.p50))          # willingness-to-pay
    ceiling = expit(-cfg.k_ceiling * (price - params.batna))  # outside-option cap
    ref_cliff = cfg.cliff_drop_ref * expit(
        cfg.cliff_steepness * (price - params.anchor * (1 + cfg.cliff_tol_ref))
    )
    round_cliff = sum(
        cfg.cliff_drop_round * expit(cfg.cliff_steepness * (price - lvl))
        for lvl in cfg.round_levels                          # $2500, $3000, $3500...
    )
    cliff = np.clip(1.0 - ref_cliff - round_cliff, 0.0, 1.0)
    return np.clip(base * ceiling * cliff, 0.0, 1.0)`;

// ── main component ────────────────────────────────────────────────
export default function NautilusDetail({ project }: { project: Project }) {
  const m1 = useCounter(17.4, 1400, 1);  // 17.4%
  const m2 = useCounter(55, 1200);
  const m3 = useCounter(742, 1200);      // 0.742 AUC (rendered as 0.xxx below)
  const m4 = useCounter(89, 1200);
  const m5 = useCounter(22, 900);
  const m6 = useCounter(64, 1200);

  const [openPhase, setOpenPhase] = useState<number | null>(0);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 50% at 20% 0%, #071a17 0%, #05100e 60%)" }}>
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
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-16" stagger={0.07}>
          {([
            { counter: m1, prefix: "+", suffix: "%",  label: "Expected Profit",     sub: "vs. best tuned cost-plus" },
            { counter: m2, prefix: "",  suffix: "%",  label: "Oracle Gap Captured", sub: "vs. the theoretical optimum" },
            { counter: m3, prefix: "0.", suffix: "",  label: "Win-Model AUC",       sub: "LightGBM vs. 0.725 logistic" },
            { counter: m4, prefix: "$", suffix: "/FEU", label: "Peak Shadow Price", sub: "LP dual as capacity tightens" },
            { counter: m5, prefix: "",  suffix: "/22", label: "Tests Passing",      sub: "CI on every push" },
            { counter: m6, prefix: "",  suffix: "%",  label: "Elasticity Attenuation", sub: "confounding bias, measured" },
          ] as const).map((m, i) => (
            <StaggerItem key={i}>
              <div ref={m.counter.ref} className="rounded-2xl p-4 text-center"
                style={{ background: `${A}08`, border: `1px solid ${A}18` }}>
                <div className="font-mono text-2xl sm:text-3xl font-bold" style={{ color: A }}>
                  {m.prefix}{m.counter.val}{m.suffix}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mt-2">{m.label}</div>
                <div className="font-mono text-[10px] text-white/35 mt-1">{m.sub}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── THE PROBLEM (THEORY) ──────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>The Problem</div>
          <h2 className="text-2xl font-bold text-white mb-4">Pricing Is a Decision, Not a Prediction</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            <a href="https://www.solvo.ai" target="_blank" rel="noreferrer" className="underline decoration-dotted"
              style={{ color: `${A}cc` }}>Solvo.ai</a> builds AI pricing systems for freight forwarders — the
            middlemen who buy container slots wholesale from carriers and resell them to shippers. Their entire
            product is one recurring decision, made thousands of times a day: <em>given a quote request and a
            cost, what price maximises expected profit?</em> Nautilus is a from-scratch attempt at that exact
            problem, built to demonstrate the decision-science stack it requires — not just an ML model bolted
            onto a dashboard.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            The naive instinct is to <em>predict</em> the right price. That&rsquo;s the wrong frame. If an oracle
            told you &ldquo;the market rate is $2,400,&rdquo; that alone doesn&rsquo;t tell you what to quote —
            quoting at $2,400 might win half the time, quoting $2,100 wins more often but at thinner margin,
            quoting $2,900 wins rarely but very profitably when it does. The right price is whichever maximises
            <strong className="text-white/85"> expected contribution</strong>, and that requires modelling the
            whole trade-off, not a point estimate.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-2xl p-6 mb-6" style={{ background: `${A}08`, border: `1px solid ${A}22` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>The Master Equation</div>
            <div className="font-mono text-lg sm:text-xl text-center py-3" style={{ color: `${A}ee` }}>
              E[profit&nbsp;|&nbsp;price&nbsp;p] &nbsp;=&nbsp; (p&nbsp;−&nbsp;c)&nbsp;&nbsp;×&nbsp;&nbsp;P(win&nbsp;|&nbsp;p)
            </div>
            <p className="text-sm text-white/60 leading-relaxed text-center">
              margin per booking &nbsp;×&nbsp; probability the customer accepts. Price at cost → zero margin.
              Price at infinity → zero win-probability. The optimum sits strictly in between — finding that
              peak <em>is</em> the pricing problem, and every phase of Nautilus is a different lens on this
              one equation.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {[
              { t: "Willingness-to-pay", d: "P(win | p) is exactly the survival function of the customer's hidden willingness-to-pay: P(win|p) = P(WTP ≥ p). Modelling the demand curve means modelling a probability distribution over price." },
              { t: "Elasticity", d: "The optimal markup obeys (p*−c)/p* = −1/ε(p*) — elastic (price-sensitive) customers get thin margins, inelastic customers get fat ones. Nautilus discovers this per-quote, automatically." },
            ].map(c => (
              <div key={c.t} className="rounded-2xl p-5" style={{ background: `${A}05`, border: `1px solid ${A}14` }}>
                <div className="font-semibold text-sm text-white/85 mb-2">{c.t}</div>
                <p className="text-sm text-white/60 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── ARCHITECTURE ───────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Architecture</div>
          <h2 className="text-2xl font-bold text-white mb-3">A 6-Phase Pipeline on a World With Known Ground Truth</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Real freight booking logs are unobtainable and, worse, would give no way to check whether a model
            recovered the truth. So Nautilus is built on a <strong className="text-white/85">synthetic
            data-generating process</strong> with a known ground truth — a confounded logging policy (sales
            price off a noisy read of willingness-to-pay), jagged demand cliffs at competitor reference prices,
            a regime-switching GARCH market, and an oracle that computes the true optimal price. Every phase
            below is graded against that oracle, not just an offline metric.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="flex flex-col mb-16">
            {PIPELINE_PHASES.map((layer, i) => (
              <div key={i} className="flex gap-0">
                <div className="flex flex-col items-center w-10 shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 z-10"
                    style={{ background: `${layer.color}14`, border: `1.5px solid ${layer.color}45`, color: layer.color }}>
                    {i + 1}
                  </div>
                  {i < PIPELINE_PHASES.length - 1 && (
                    <div className="w-px flex-1 my-1"
                      style={{ background: `linear-gradient(to bottom, ${layer.color}35, ${PIPELINE_PHASES[i + 1].color}35)` }} />
                  )}
                </div>
                <div className={`ml-4 rounded-xl p-4 flex-1 ${i < PIPELINE_PHASES.length - 1 ? "mb-2" : ""}`}
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

        {/* ── PHASE 1: SYNTHETIC WORLD ──────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 1 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">The Synthetic World: Cliffs and Confounding</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Two deliberate structural choices make this world hard in exactly the ways a real pricing model
            has to handle. <strong className="text-white/85">Reference-price cliffs</strong>: shippers anchor
            on the public freight index (FBX/SCFI) and competitor round numbers — behavioural economics&rsquo;
            loss-aversion effect — so the true demand curve has sharp steps, not a smooth slope. A logistic
            regression can only draw one smooth S-curve; it structurally cannot represent a cliff. Gradient-boosted
            trees, being piecewise-constant, can.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            <strong className="text-white/85">A confounded logging policy</strong>: the simulated sales team
            doesn&rsquo;t price randomly — it prices off a noisy internal read of the customer&rsquo;s
            willingness-to-pay, blended with cost-plus. That entangles price with the outcome: high markups
            land on customers who were going to accept anyway, so a naive analysis of the logs
            <em> understates</em> how much raising price actually costs you in lost bookings. Measured directly
            against the DGP&rsquo;s ground truth, the observed win-vs-markup slope was only
            <strong style={{ color: A }}> 64%</strong> as steep as the true causal slope — exactly the bias a
            naive pricing model trained on this data would silently inherit, and exactly what Phase 6&rsquo;s
            off-policy evaluation exists to correct.
          </p>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 gap-4 mb-16" stagger={0.08}>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Ground-Truth Demand Curves — Note the Competitor Cliffs
              </div>
              <img src="/nautilus/02_demand_cliffs.png" alt="Demand curves per customer segment showing sharp cliffs at the index rate and round numbers"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Confounding: Logged Win-Rate vs. the True Causal Effect
              </div>
              <img src="/nautilus/03_confounding.png" alt="Observed win rate vs markup is far flatter than the true causal effect computed from the DGP"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
        </StaggerChildren>
        <FadeIn delay={0.05}>
          <div className="rounded-xl overflow-hidden border mb-16" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#04100d" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#081815" }}>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-white/45 ml-2">dgp/demand.py — the ground-truth win-probability curve</span>
            </div>
            <pre className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto" style={{ color: "#99f6e4" }}>
              {DEMAND_CODE}
            </pre>
          </div>
        </FadeIn>

        {/* ── PHASE 2: WIN MODEL ────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 2 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">Calibrated Win-Probability Modelling</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Because the optimiser does expected-value arithmetic on the model&rsquo;s output, evaluation uses
            <strong className="text-white/85"> proper scoring rules</strong> — log-loss, Brier score, and
            Expected Calibration Error — never plain accuracy, since a model can be highly accurate while its
            probabilities are badly scaled. A model is <strong className="text-white/85">calibrated</strong> if,
            among all quotes where it predicts &ldquo;P(win)=0.7,&rdquo; customers actually accept ~70% of the
            time — miscalibration silently shifts the location of the profit-maximum the optimiser finds,
            turning a probability error directly into lost money.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            LightGBM beat a fairly-tuned logistic regression baseline (AUC 0.742 vs. 0.725, log-loss −3.9%)
            by capturing the cliffs a smooth model cannot represent — visible directly in the curve-recovery
            plot below, where LightGBM tracks the ground truth step-for-step while logistic regression smears
            through the boundaries. Isotonic calibration on a held-out split then cut Expected Calibration
            Error by 17.7%.
          </p>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 gap-4 mb-16" stagger={0.08}>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Recovered Demand Curve — LightGBM Tracks the Cliffs, Logistic Smears Them
              </div>
              <img src="/nautilus/05_curve_recovery.png" alt="LightGBM tracks the ground-truth cliffs while logistic regression smooths through them"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Reliability Diagram — Raw vs. Isotonic-Calibrated
              </div>
              <img src="/nautilus/04_calibration.png" alt="Reliability diagram comparing raw and isotonic-calibrated LightGBM predictions"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
        </StaggerChildren>

        {/* ── PHASE 3: PER-QUOTE OPTIMIZER ──────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 3 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">The Per-Quote Optimizer</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Every policy — Nautilus, cost-plus, the logged humans — <strong className="text-white/85">picks a
            price from observed features only</strong>, and every policy is then <strong className="text-white/85">
            scored under the true demand curve</strong> it never saw. This &ldquo;policies pick, ground truth
            grades&rdquo; protocol measures decision quality, not prediction accuracy — a model can have great
            log-loss and still make mediocre pricing decisions. The strongest baseline isn&rsquo;t a strawman
            fixed markup, but the <em>single best constant markup, tuned on the training set</em> — beating that
            isolates the value of context-dependent, personalised pricing, which is the entire premise of a
            pricing product like Solvo&rsquo;s.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="overflow-x-auto rounded-xl border mb-8" style={{ borderColor: `${A}18` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${A}0c`, borderBottom: `1px solid ${A}22` }}>
                  {["Policy", "$ / Quote (True Demand)", "Regret vs. Oracle"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: A }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLICY_TABLE.map((row, ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: ri === 1 ? `${A}08` : "transparent" }}>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: ri === 1 ? A : "rgba(255,255,255,0.75)" }}>{row[0]}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-white/80">{row[1]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/55">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              Mean Expected Profit per Quote, Scored Under True Demand
            </div>
            <img src="/nautilus/06_policy_profit.png" alt="Bar chart showing Nautilus beats every baseline policy on expected profit"
              className="w-full block" style={{ background: "#fff" }} />
          </div>
        </FadeIn>

        {/* ── PHASE 4: FORECASTER ───────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 4 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">Probabilistic Rate Forecasting</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            At a 7-day horizon, freight rates are close to a random walk — the naive &ldquo;carry today&rsquo;s
            rate forward&rdquo; baseline is brutally strong, and any model must beat it to justify existing.
            The key design choice: forecast the <strong className="text-white/85">log-return</strong>, not the
            rate <em>level</em>. Tree models are piecewise-constant and cannot extrapolate — forecasting levels
            directly lost to naive (MASE 1.03) because the model capped predictions at the training range during
            a rising regime. Forecasting the return and reconstructing the level as
            <span className="font-mono text-sm" style={{ color: `${A}cc` }}> rate_t · exp(return̂)</span> lets
            the current rate carry the level (exactly what naive does well) while the model predicts only the
            small, low-signal <em>change</em> — beating naive at MASE 0.69 once heavily regularised to avoid
            overfitting that low-SNR target.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            Three LightGBM quantile models (P10/P50/P90) give an adaptive band, and
            <strong className="text-white/85"> Conformalized Quantile Regression</strong> wraps them with a
            distribution-free coverage guarantee — the P10–P90 band hit ~86% empirical coverage against an
            80% target, and visibly widens in volatile periods, directly informing risk-aware margin floors.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              7-Day-Ahead Forecast With Conformal Band — Widens in Volatile Periods
            </div>
            <img src="/nautilus/08_forecast_fan.png" alt="Fan chart of 7-day-ahead rate forecast with a conformal P10-P90 band that widens during volatility"
              className="w-full block" style={{ background: "#fff" }} />
          </div>
        </FadeIn>

        {/* ── PHASE 5: PORTFOLIO LP ─────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 5 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">Portfolio Pricing Under Scarce Capacity</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Per-quote optimisation treats every quote as if it lived alone. Real forwarders hold many
            simultaneously-open quotes against <em>one shared, finite ship</em> — winning one booking consumes
            capacity that could have gone to a more profitable one. Nautilus solves this as a linear program:
            maximise total expected profit across the book subject to one shared capacity constraint. The
            <strong className="text-white/85"> dual value of that constraint is the classic revenue-management
            bid price</strong> — the minimum margin-per-slot a booking must clear to be worth accepting.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            Two properties validated the implementation end to end: when capacity is slack, the LP reproduces
            Phase 3&rsquo;s per-quote-optimal prices exactly (shadow price ≈ $0) — confirming Phase 5 strictly
            generalises Phase 3. As capacity tightens, the shadow price rises monotonically from $0 to
            <strong style={{ color: A }}> $89/FEU</strong>, and the LP automatically reprices low-profit-density
            quotes 8× more aggressively than high-density ones — protecting the most valuable bookings without
            being told to, purely as an emergent property of the optimisation.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="rounded-2xl overflow-hidden border mb-16" style={{ borderColor: `${A}18` }}>
            <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
              style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
              The LP&rsquo;s Dual Value Reproduces the Textbook Bid-Price Curve
            </div>
            <img src="/nautilus/09_bid_price_curve.png" alt="Total profit declines gracefully and shadow price rises convexly as capacity tightens"
              className="w-full block" style={{ background: "#fff" }} />
          </div>
        </FadeIn>

        {/* ── PHASE 6: OFF-POLICY EVALUATION ────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Phase 6 · Theory + Implementation</div>
          <h2 className="text-2xl font-bold text-white mb-4">Off-Policy Evaluation — and an Optimiser&rsquo;s Curse</h2>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            Can Nautilus&rsquo;s uplift be proven from the confounded historical logs alone, without a live
            experiment? <strong className="text-white/85">Inverse Propensity Weighting (IPW)</strong> reweights
            each logged reward by how surprising it was — <span className="font-mono text-xs">1 / μ(a|x)</span> —
            which is provably unbiased but high-variance when matches are sparse.
            <strong className="text-white/85"> Doubly Robust (DR)</strong> combines a reward model with an IPW
            correction and is unbiased if <em>either</em> the propensities or the reward model is correct —
            &ldquo;two chances to be right,&rdquo; and the textbook-recommended default.
          </p>
          <p className="text-base text-white/70 leading-relaxed mb-4">
            The real data inverted that textbook expectation. The Nautilus optimiser chooses its price via
            <span className="font-mono text-xs"> argmax</span> over the win model&rsquo;s own predictions — and
            taking an argmax over many noisy candidates systematically selects candidates where the model
            happens to be optimistic (the <strong className="text-white/85">optimiser&rsquo;s curse</strong>,
            Smith &amp; Winkler 2006). Restricted to well-supported, in-distribution quotes, the model&rsquo;s
            self-belief at its own chosen price was <strong style={{ color: A }}>$485.70</strong> against a
            realized reward of <strong style={{ color: A }}>$432.65</strong> — a $53 gap with no extrapolation
            involved. Direct Method and Doubly Robust, which lean on that self-referential belief, ended up
            <em> more confidently wrong</em> than plain IPW, which uses only realised outcomes.
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="overflow-x-auto rounded-xl border mb-8" style={{ borderColor: `${A}18` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${A}0c`, borderBottom: `1px solid ${A}22` }}>
                  {["Estimator", "Value", "Error vs. True ($443)", "Note"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: A }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPE_TABLE.map((row, ri) => (
                  <tr key={ri} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: ri === 1 ? `${A}08` : "transparent" }}>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: ri === 1 ? A : "rgba(255,255,255,0.75)" }}>{row[0]}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-white/80">{row[1]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/55">{row[2]}</td>
                    <td className="px-4 py-3 text-xs text-white/55 leading-relaxed">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-1 gap-4 mb-16" stagger={0.08}>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Off-Policy Estimates vs. Ground Truth — Error Bars Are Bootstrap SE
              </div>
              <img src="/nautilus/11_ope_estimators.png" alt="Bar chart of five OPE estimators against the true policy value, with bootstrap standard error bars"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${A}18` }}>
              <div className="px-5 py-3 border-b text-xs font-bold uppercase tracking-widest"
                style={{ background: `${A}06`, borderColor: `${A}12`, color: `${A}80` }}>
                Weight Clipping Trades Variance for Bias — Toward the Baseline, Not the Truth
              </div>
              <img src="/nautilus/12_ope_clip_tradeoff.png" alt="Clipping IPW and DR weights reduces standard error but drifts the value estimate away from the true value"
                className="w-full block" style={{ background: "#fff" }} />
            </div>
          </StaggerItem>
        </StaggerChildren>

        {/* ── ENGINEERING TAKEAWAYS (accordion) ─────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Engineering Takeaways</div>
          <h2 className="text-2xl font-bold text-white mb-3">Four Bugs Worth Understanding</h2>
          <p className="text-base text-white/70 leading-relaxed mb-8">
            Building a system with a known ground truth means bugs surface as measurable contradictions, not
            silent failures. Each of these was diagnosed with a targeted numerical probe, not guesswork.
          </p>
        </FadeIn>
        <StaggerChildren className="flex flex-col gap-3 mb-16" stagger={0.08}>
          {[
            {
              name: "GARCH Volatility Explosion",
              type: "Phase 1 · Numerical Stability",
              color: "#8b5cf6",
              detail: "Scaling the ENTIRE GARCH recursion (including the persistence term) by the regime's volatility multiplier pushed effective persistence above 1 — an explosive, NaN-producing recursion. Fixed by scaling only the current step's innovation, and adding a safety clamp on log-rates as defense in depth.",
            },
            {
              name: "The Confounding-Tuning Saga",
              type: "Phase 1 · Five Iterations",
              color: "#3b82f6",
              detail: "Getting a logging policy to visibly bias a naive demand-curve estimate took five attempts — policies that followed the market rate or capacity pressure kept cancelling out because willingness-to-pay scaled with the same variable. The fix: a policy that blends cost-plus with a noisy read of willingness-to-pay, and reframing the validation check to compare the observed slope against the TRUE causal slope (computed from the DGP) rather than chasing a fragile sign-flip.",
            },
            {
              name: "Forecasting Levels Loses to Naive",
              type: "Phase 4 · Model Choice",
              color: "#f59e0b",
              detail: "Tree models are piecewise-constant and cannot extrapolate — forecasting the rate LEVEL directly capped predictions at the training range during a rising regime and lost to the naive baseline (MASE 1.03). Forecasting the log-RETURN and reconstructing the level from the current rate fixed it (MASE 0.69) — a general lesson for any tree-based forecaster on a trending series.",
            },
            {
              name: "The Optimiser's Curse",
              type: "Phase 6 · Causal Inference",
              color: "#f472b6",
              detail: "A reward-model-based off-policy estimate (Doubly Robust) that leans on a model queried at its own argmax inherits that model's selection bias — even restricted to in-distribution actions. The standard remedy is cross-fitting: train the reward-model baseline on a fold disjoint from the one used to select actions, so the argmax's optimism and the evaluator are never the same fitted function. Documented as the correct next step.",
            },
          ].map((bug, i) => (
            <StaggerItem key={i}>
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${bug.color}22` }}>
                <button
                  onClick={() => setOpenPhase(openPhase === i ? null : i)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  style={{ background: `${bug.color}06` }}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <span className="font-bold text-base" style={{ color: bug.color }}>{bug.name}</span>
                    </div>
                    <div className="font-mono text-xs text-white/45">{bug.type}</div>
                  </div>
                  <span className="font-mono text-xs text-white/30 shrink-0">{openPhase === i ? "▾" : "▸"}</span>
                </button>
                {openPhase === i && (
                  <div className="px-5 py-4 border-t text-sm text-white/65 leading-relaxed"
                    style={{ borderColor: `${bug.color}12` }}>
                    {bug.detail}
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* ── DOCS / TESTING ─────────────────────────────────────── */}
        <FadeIn>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `${A}55` }}>Rigor</div>
          <h2 className="text-2xl font-bold text-white mb-4">22 Tests, CI on Every Push, Theory + Implementation Docs Per Phase</h2>
          <p className="text-base text-white/70 leading-relaxed mb-6">
            Every phase has an executable invariant (e.g. &ldquo;LightGBM&rsquo;s log-loss beats logistic
            regression,&rdquo; &ldquo;the LP&rsquo;s shadow price is monotone in capacity,&rdquo; &ldquo;Doubly
            Robust stays unbiased even with a deliberately wrong reward model&rdquo;) and a GitHub Actions
            workflow that runs the full suite on every push. Beyond the code, each phase has a paired
            <strong className="text-white/85"> theoretical deep-dive</strong> (the economics, statistics, and
            causal-inference theory behind every design decision) and a <strong className="text-white/85">
            technical deep-dive</strong> (implementation details and the actual debugging journeys — including
            the four bugs above) in the GitHub repository.
          </p>
        </FadeIn>

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
