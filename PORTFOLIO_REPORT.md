# Portfolio Implementation Report
**Author:** Rohan Sakeri  
**Date:** July 2026  
**Project:** Personal ML Engineering Portfolio  
**Live deployment:** Vercel (auto-deploy from GitHub)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Migration: MkDocs → Next.js](#2-migration-mkdocs--nextjs)
3. [Technology Stack](#3-technology-stack)
4. [Project File Structure](#4-project-file-structure)
5. [Design System](#5-design-system)
6. [Shared Infrastructure](#6-shared-infrastructure)
7. [Data Layer](#7-data-layer)
8. [Page-by-Page Implementation](#8-page-by-page-implementation)
   - [Home](#81-home--apppagetsxs)
   - [Experience](#82-experience--appexperiencepagetysx)
   - [Projects (Index)](#83-projects-index--appprojectspagetysx)
   - [Projects (Detail)](#84-projects-detail--appprojectsidpagetysx--projectdetailtysx)
   - [Research (Index)](#85-research-index--appresearchpagetysx)
   - [Research (Detail)](#86-research-detail--appresearchiidpagetysx--paperdetailtysx)
   - [Blog](#87-blog--appblogpagetysx)
9. [Animation System](#9-animation-system)
10. [Creative Card Designs](#10-creative-card-designs)
11. [Aurora Background](#11-aurora-background)
12. [Navigation](#12-navigation)
13. [Deployment](#13-deployment)
14. [Bugs Fixed During Development](#14-bugs-fixed-during-development)
15. [Future Work](#15-future-work)

---

## 1. Executive Summary

This portfolio was rebuilt from scratch during mid-2026, migrating from a static MkDocs Material site to a modern Next.js 16 application with Tailwind CSS v4, Framer Motion v12, and TypeScript. The goal was to move from a documentation-style layout (cluttered, hard to read, no personality) to a premium dark-mode portfolio that reads like a product — with per-section colour themes, real scroll-triggered animations, dedicated detail pages for every project and research paper, and creative card designs that visually communicate *what the content is* (terminal windows for code projects, notebook pages for paper readings, code editor windows for implementations).

The site has **17 statically pre-rendered routes**, deploys to Vercel on every GitHub push, and scores well on readability: all body text is at `text-white/60` (readable, not harsh), headings at `text-white/85` (clear hierarchy), and accents are per-section so each page feels distinct.

---

## 2. Migration: MkDocs → Next.js

### Why we left MkDocs

The original portfolio used [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), a static site generator designed for technical documentation. While it produces clean, fast sites, it had three fundamental problems for a portfolio:

1. **No personality** — It's a documentation theme. Every MkDocs portfolio looks nearly identical. There was no way to add custom animations, creative card layouts, or per-section colour themes without fighting the theme system.
2. **Cluttered layout** — Project details were expanded inline as accordion dropdowns. Everything was on one long page. It was hard to scan and harder to navigate.
3. **No interactivity** — MkDocs outputs pure HTML/CSS. There's no React, no Framer Motion, no client-side state. Scroll animations, filter bars, and modal overlays require JavaScript components, which MkDocs doesn't support natively.

### Why Next.js 16 specifically

- **App Router** (stable in Next.js 13+): file-based routing, React Server Components, and `generateStaticParams` for pre-rendering dynamic routes like `/projects/[id]` and `/research/[id]` at build time.
- **Static export** works perfectly for a portfolio — all 17 routes are HTML files, no server needed at runtime, Vercel serves them from CDN.
- **TypeScript first** — types for all data structures (`Project`, `Paper`, `Section`, `CodeBlock`) catch mistakes before they ship.
- **Version 16** specifically: uses the new `params` as an async Promise (breaking change from v15), which required updating all dynamic route files.

### Migration process

1. Created `nextjs-portfolio/` directory inside the existing `my-portfolio` git repo.
2. Ran `npx create-next-app@latest` with TypeScript, Tailwind, App Router, no `src/` directory.
3. Installed additional dependencies: `framer-motion@^12`, `next@16`.
4. Replicated all content from the MkDocs `.md` files into TypeScript data objects in `lib/projects.ts` and `lib/research.ts`.
5. Built all 5 main pages and both sets of dynamic detail pages.
6. Deployed the `nextjs-portfolio/` directory as its own GitHub repo → Vercel project.

---

## 3. Technology Stack

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.10 | Framework, routing, static generation |
| React | 19.x | UI rendering |
| TypeScript | 5.x | Type safety across all components and data |
| Tailwind CSS | v4 | Utility-class styling |
| Framer Motion | v12 | Entrance animations, hover effects |
| Google Fonts | — | Inter (body) + Fira Code (monospace) |
| Vercel | Free tier | Hosting and auto-deployment |

### Key architectural decisions

**Tailwind v4 vs v3:** v4 drops the `tailwind.config.js` file. Instead, you `@import "tailwindcss"` in your CSS and all configuration is done in CSS. The Google Fonts `@import url(...)` must come *before* the Tailwind import — placing it after caused a build error.

**Framer Motion v12:** The API changed significantly from v10/v11. `motion.div` still works but the `AnimatePresence` behaviour for exit animations changed. We use `whileInView` (not `animate`) so that entrance animations trigger on scroll, not on mount.

**No CSS modules:** All styling is inline `style={{}}` props or Tailwind classes. This keeps components self-contained and makes per-section colour theming simple — each page defines its own `ACCENT` constant and passes it through inline styles.

**Server vs Client components:** Most pages are `"use client"` because they use Framer Motion (which requires the browser). The dynamic route `[id]/page.tsx` files are Server Components (no `"use client"`) because they just fetch data and pass it to a client Detail component.

---

## 4. Project File Structure

```
nextjs-portfolio/
├── app/
│   ├── globals.css              # Font imports, base styles, Tailwind import
│   ├── layout.tsx               # Root layout: <Nav />, metadata, footer
│   ├── page.tsx                 # Home page
│   ├── experience/
│   │   └── page.tsx             # Experience page (timeline + education)
│   ├── projects/
│   │   ├── page.tsx             # Projects index (filter bar + terminal cards)
│   │   └── [id]/
│   │       ├── page.tsx         # Server component: fetches project, renders detail
│   │       └── ProjectDetail.tsx # "use client" detail view with full writeup
│   ├── research/
│   │   ├── page.tsx             # Research index (notebook + code editor cards)
│   │   └── [id]/
│   │       ├── page.tsx         # Server component: fetches paper, renders detail
│   │       └── PaperDetail.tsx  # "use client" detail view
│   └── blog/
│       └── page.tsx             # Blog (card grid + full-article modal)
├── components/
│   ├── Nav.tsx                  # Sticky nav with per-link accent colours
│   └── Motion.tsx               # Reusable Framer Motion wrappers
├── lib/
│   ├── projects.ts              # All project data + types + getProject()
│   └── research.ts              # All paper data + types + getPaper()
├── public/
│   └── Github_Profile_Pic.png  # Profile photo (164×164, used on Home)
├── next.config.ts               # images.unoptimized: false
├── tsconfig.json
└── package.json
```

### Route map (17 statically generated routes)

```
/                          → Home
/experience                → Experience
/projects                  → Projects index
/projects/codaf            → CODAF project detail
/projects/answer-engine    → Answer Engine detail
/projects/papeer           → Papeer detail
/projects/bid-o-matic      → Bid-O-Matic detail
/research                  → Research index
/research/fused-cross-entropy    → Implementation detail
/research/pplx-embed             → Implementation detail
/research/type-checked-compliance → Implementation detail
/research/pplx-embed-reading     → Reading detail
/research/compliance-reading     → Reading detail
/blog                      → Blog (modal-based, no sub-routes)
```

---

## 5. Design System

### Colour philosophy

Each section has its own accent colour. This does two things: (1) tells the user visually where they are in the portfolio, (2) makes cards and borders feel deliberate and branded rather than generic.

| Section | Accent | Hex | Background tint |
|---|---|---|---|
| Home | Cyan | `#00e5ff` | `#050a12` (dark navy) |
| Experience | Purple | `#a78bfa` | `#080613` (dark violet) |
| Projects | Emerald | `#34d399` | `#030d09` (dark green-black) |
| Research | Amber (read) / Blue (impl) | `#fb923c` / `#60a5fa` | `#100805` (warm dark) |
| Blog | Pink | `#f472b6` | `#100409` (dark pink-black) |

Each page background is a `radial-gradient` — a subtle coloured ellipse in one corner that fades to the base `#050a12`. This gives each section a personality without being loud.

### Typography

**Fonts:** Inter (sans-serif body) + Fira Code (monospace accents). Both loaded from Google Fonts via a single `@import url(...)` in `globals.css`.

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500;600&display=swap');
@import "tailwindcss";

html { scroll-behavior: smooth; font-size: 16px; }
body { font-family: var(--font-sans); background: #050a12; color: #d4d8e0; line-height: 1.65; }
```

**Type scale:**
| Role | Class | Size |
|---|---|---|
| Page title | `text-4xl font-black` | 36px, weight 900 |
| Hero name | `text-5xl font-black` | 48px, weight 900 |
| Card title | `text-xl font-bold` or `text-base font-bold` | 20px or 16px |
| Body text | `text-base text-white/60` | 16px, 60% white opacity |
| Small body | `text-sm text-white/55` | 14px, 55% white opacity |
| Captions / meta | `text-xs font-mono text-white/35` | 12px, monospace |
| Section labels | `text-xs font-bold uppercase tracking-widest` | 12px |

**Readability principle:** Body text is never full white. `text-white/60` for paragraphs, `text-white/85` for headings, full white only on hover states. This prevents eye strain on the dark background.

### Spacing

- Max content width: `max-w-4xl` (projects, experience) or `max-w-5xl` (home, research, blog)
- Page padding: `px-6 py-16`
- Card internal padding: `p-5` to `p-7` depending on card type
- Section gaps: `mb-14` to `mb-16` between major sections

**To make cards larger:** increase the `p-N` on the card's content wrapper. For example, `p-6 → p-9` makes cards notably taller. To increase space between cards, change `gap-4` or `gap-5` on the `StaggerChildren` wrapper's className.

---

## 6. Shared Infrastructure

### `components/Nav.tsx`

The navigation bar is a `"use client"` component that uses `usePathname()` from Next.js to know which page is active.

**Structure:**
- Fixed top bar, `backdrop-blur-md` + semi-transparent background so page content scrolls behind it
- Desktop: horizontal link list with `font-mono` text
- Mobile: hamburger button toggles `useState(open)` — shows/hides a vertical dropdown

**Per-link accent system:** Each nav link has its own accent colour stored in an array. The active link gets a coloured background (`bg-[accent]/15`) and text in that accent colour. Inactive links are `text-white/40`.

```typescript
const LINKS = [
  { href: "/",           label: "home",       accent: "#00e5ff" },
  { href: "/experience", label: "experience", accent: "#a78bfa" },
  { href: "/projects",   label: "projects",   accent: "#34d399" },
  { href: "/research",   label: "research",   accent: "#fb923c" },
  { href: "/blog",       label: "blog",       accent: "#f472b6" },
];
```

Active detection uses `pathname === href` (exact match for `/`) and `pathname.startsWith(href)` for nested routes like `/projects/codaf`.

### `components/Motion.tsx`

A collection of reusable Framer Motion wrappers. All are `"use client"`. This file exists so pages don't need to import `framer-motion` directly — they import from `@/components/Motion`.

**`FadeIn`** — The most-used wrapper. Fades in a child element with optional direction (`"up"`, `"down"`, `"left"`, `"right"`), delay, and duration.

```typescript
// Uses whileInView (not animate) — triggers when element enters viewport
// viewport={{ once: true, margin: "-60px" }} — fires 60px before it's fully visible
// initial: { opacity: 0, y: 20 } → animate: { opacity: 1, y: 0 }
export function FadeIn({ children, delay = 0, direction = "up", className, ...rest })
```

**`StaggerChildren`** — A container that staggers its children's entrance. Sets `variants` on the parent div that trigger `staggerChildren` and `delayChildren` in the `visible` state.

**`StaggerItem`** — A child of `StaggerChildren`. Uses `hidden: { opacity: 0, y: 24 }` → `visible: { opacity: 1, y: 0 }` variants, so the parent's stagger timing flows through automatically.

**`ScaleIn`** — Fades in while scaling from 0.95 to 1. Used for metric cards and similar elements where a subtle scale feels more appropriate than a directional slide.

**`HoverCard`** — Wraps a card in a `motion.div` with `whileHover={{ y: -4, scale: 1.01 }}`. Provides the lift-on-hover effect as a Framer Motion animation (as opposed to CSS `hover:-translate-y-1`, which we also use directly on some cards).

---

## 7. Data Layer

All portfolio content lives in TypeScript files in `lib/`. This centralises the data, gives it type safety, and means you never need to touch the page components to update content — just edit the data files.

### `lib/projects.ts`

**Types defined:**

```typescript
type CodeBlock = {
  filename?: string;
  language: string;
  code: string;
};

type TableData = {
  headers: string[];
  rows: string[][];
};

type Section = {
  heading: string;
  body: string;
  code?: CodeBlock;
  table?: TableData;
  note?: string;
};

type Project = {
  id: string;          // URL slug: "codaf", "answer-engine", etc.
  title: string;
  date: string;
  badge: string;       // Category label: "MSc Thesis · GNN + MARL"
  tldr: string;        // One-line summary for index cards
  chips: string[];     // Tech stack chips
  categories: string[]; // Used by the filter bar: ["ML Systems", "Research", ...]
  accent: string;      // Per-project hex colour
  videoUrl?: string;   // Optional Loom/YouTube link (not yet populated)
  githubUrl?: string;  // Optional GitHub link
  sections: Section[]; // Full writeup sections for the detail page
};
```

**Projects defined (4 total):**

| ID | Title | Accent | Categories |
|---|---|---|---|
| `codaf` | Co-Adaptive Allocation Framework | `#34d399` | ML Systems, Research, RL / Agents |
| `answer-engine` | Agentic Answer Engine | `#60a5fa` | ML Systems, RAG / LLM |
| `papeer` | Papeer | `#a78bfa` | RAG / LLM |
| `bid-o-matic` | Bid-O-Matic | `#fbbf24` | ML Systems, RL / Agents |

**Helper function:**
```typescript
export function getProject(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id);
}
```

### `lib/research.ts`

**Type defined:**

```typescript
type Paper = {
  id: string;           // URL slug
  track: "reading" | "impl";  // Which column to show in on research index
  title: string;
  venue: string;        // "arXiv", "NeurIPS", etc.
  year: string;
  summary: string;      // Short card summary
  tags: string[];
  accent: string;
  sections: Section[];  // Full notes/implementation writeup
  content_label?: string; // e.g. "My Notes" vs "Implementation"
};
```

**Papers defined (5 total):**

| ID | Track | Topic |
|---|---|---|
| `fused-cross-entropy` | impl | Fused Cross Entropy CUDA kernel |
| `pplx-embed` | impl | Perplexity embedding architecture |
| `type-checked-compliance` | impl | Type-checked LLM compliance |
| `pplx-embed-reading` | reading | Perplexity embedding critique |
| `compliance-reading` | reading | Compliance paper critique |

---

## 8. Page-by-Page Implementation

### 8.1 Home — `app/page.tsx`

**Purpose:** First impression. Combines a rich hero section with scrollable proof-of-work.

**This is a `"use client"` component** because it uses:
- `useState` for the rotating typing lines
- `useEffect` for the timer interval
- Custom `useCounter` hook using `IntersectionObserver`

#### Aurora background

Two (now three) large blurred radial divs positioned absolutely behind the content. They use CSS `@keyframes drift` to slowly float:

```css
@keyframes drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(70px, 50px) scale(1.18); }
}
```

- **Blob 1** (cyan, `#00e5ff`): 800×800px, top-left, opacity 20%, 12s drift
- **Blob 2** (blue, `#1a4fff`): 600×600px, top-right, opacity 14%, 16s reverse drift
- **Blob 3** (purple, `#7c3aed`): 500×500px, bottom-center, opacity 10%, 22s drift

Earlier versions had these at 5–7% opacity, which made the aurora invisible. After tuning, the cyan glow is clearly visible — it creates a "light source" effect that anchors the page.

#### Dot grid overlay

A `div` with `backgroundImage: "radial-gradient(rgba(0,229,255,0.06) 1px, transparent 1px)"` creates a dot matrix. A `maskImage` (radial gradient) fades the dots out below the hero so they don't compete with body content.

#### Hero section

- Profile image: `next/image` `<Image>` component, 164×164px, circular with a cyan border and outer glow via `boxShadow`
- "Open" badge: small pill positioned bottom-right on the image with `animate-pulse` on a green dot
- Name in `text-5xl font-black`
- Rotating tagline: one of 4 strings cycles every 3.2 seconds using `setInterval` + `useState(lineIdx)`. The key-prop trick (`key={lineIdx}` on the text div) causes React to remount the element, giving a snap-in feel.
- CTA buttons: "View Projects" (solid cyan fill), "Contact Me" (outlined cyan), "LinkedIn" (ghost)

#### `useCounter` hook

Detects when a metric card scrolls into view using `IntersectionObserver`, then runs a `requestAnimationFrame` loop to count from 0 to the target number over 1.6 seconds with an easing curve:

```typescript
const p = Math.min((ts - start) / duration, 1); // 0→1 progress
setVal(Math.floor(p * target));                  // linear, but feels fast due to fast start
```

#### Five metric cards

Each card is a `<Metric>` component that calls `useCounter`. Values are:
- 87% latency reduction (Python → Go)
- 17% CTR gain (XGBoost notification ranking)
- 12% GMV revenue growth
- 90% token cost cut (TOON compression)
- 200ms retrieval latency (hybrid pipeline)

Cards show a horizontal shimmer line at the top on hover (CSS `linear-gradient` in a 1px-high div).

#### Tech stack section

Four groups of chips: Core Languages, AI/ML, Infrastructure, Quantitative. Each `<Chip>` component has a hover state that colours it cyan.

#### Featured Work cards

Four cards in a 2×2 grid, each linking to `/projects/[id]`. Border colour transitions from `rgba(255,255,255,0.07)` to `rgba(0,229,255,0.25)` on hover using inline `onMouseEnter/Leave` handlers.

---

### 8.2 Experience — `app/experience/page.tsx`

**Purpose:** Chronological work history with visual impact metrics.

**This is a `"use client"` component** (uses `useRef`, `useState`, `useEffect` for animated bars).

#### Timeline layout

A vertical line (`border-l-2` in `${ACCENT}20`) runs down the left side. Each role card has a dot positioned at `-left-[1.6rem]` with a glowing `boxShadow` matching the accent.

#### `AnimatedBar` component

Each role has impact metric bars (e.g., "Latency reduction: 87%"). These bars animate from 0 to their target width when they scroll into view.

Implementation:
1. A `useRef` attaches to the bar's container div
2. `IntersectionObserver` watches for it entering the viewport at `threshold: 0.5`
3. On entry: `setTimeout(() => setWidth(pct), 150)` — 150ms delay for a snappier feel
4. The fill div has `transition-all duration-1000 ease-out` — grows to `width: ${width}%`
5. The observer disconnects after firing once (no re-animation on scroll back)

#### Inline bold highlights

Each bullet point can have a `highlight` string. The rendering splits the bullet text on that string and wraps it in `<strong className="text-white/85 font-semibold">`. This makes "17% CTR gain", "87% latency reduction", etc. visually pop within the body text.

#### Three roles

1. **AI Engineer · Research Assistant** — University of Birmingham (Feb–Apr 2026)
2. **Machine Learning Engineer** — Sharechat (Apr 2023–Jul 2024)
3. **Analyst, Product & Strategy** — Sharechat (Oct 2021–Apr 2023)

Each has: role/company header, date, location, summary paragraph, bullet points with highlights, animated impact bars, and tech tag chips.

#### Education section

Two entries in left-bordered cards (`borderLeft: "3px solid ${ACCENT}60"`). The MSc entry includes the dissertation abstract and a tech chip set.

#### Achievements section

Three bullet points marked with `★` in the accent colour.

---

### 8.3 Projects (Index) — `app/projects/page.tsx`

**Purpose:** Scannable project cards with filtering. Every card links to a dedicated detail page (no inline expansion).

**This is a `"use client"` component** (uses `useState` for the active filter).

#### Filter bar

Five filter buttons: "All", "ML Systems", "Research", "RAG / LLM", "RL / Agents". The active filter gets `background: ${ACCENT}18` and `borderColor: ACCENT`. Clicking a filter sets `active` state; the `visible` array is recomputed:

```typescript
const visible = active === "All" ? PROJECTS : PROJECTS.filter(p => p.categories.includes(active));
```

#### Terminal window cards (creative redesign)

Each card is a styled `<Link>` that looks like a macOS terminal window. Structure:

**Title bar layer:**
- Three traffic light dots (red `#ff5f56`, yellow `#ffbd2e`, green = `p.accent`)
- Traffic lights are at 60% opacity by default; on `group-hover` they go to 100%, giving the card a "wake up" feel
- Path shown as `~/projects/{p.id}` in monospace
- Date shown right-aligned in the title bar

**Terminal body:**
- `$ cat README.md` prompt in the project's accent colour (65% opacity)
- Badge label formatted as `[BADGE TEXT]` in small caps
- Title in `text-xl font-bold`
- Description paragraph
- Tech chips styled as square-cornered (`rounded`, not `rounded-full`) to feel like terminal tokens
- Blinking cursor at the bottom: `<span className="inline-block w-1.5 h-3.5 animate-pulse" style={{ background: p.accent }}/>` with `$ ` prompt before it

The entire card uses `hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]` — a deep shadow that lifts the card visually on hover.

---

### 8.4 Projects (Detail) — `app/projects/[id]/page.tsx` + `ProjectDetail.tsx`

#### `page.tsx` — Server Component

```typescript
// generateStaticParams: called at build time to pre-render all project routes
export async function generateStaticParams() {
  return PROJECTS.map(p => ({ id: p.id }));
}

// generateMetadata: sets <title> and <meta description> per project
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is async in Next.js 16
  ...
}

// Page component: fetches project, passes to client component
export default async function ProjectPage({ params }: ...) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
```

Note: `params` is a `Promise<{ id: string }>` in Next.js 16 — this is a breaking change from v15 where it was a plain object. All dynamic route files must `await params` before destructuring.

#### `ProjectDetail.tsx` — Client Component

The full detail view. Structure:

1. **Breadcrumb:** `← Projects / {title}` — the `←` links back to `/projects`
2. **Header:** badge chip + date on the right
3. **Title:** `text-3xl font-black`
4. **TL;DR block:** left-bordered paragraph in `text-white/65`
5. **Tech chips:** same style as index cards
6. **Optional buttons:** GitHub link and video demo link (if `githubUrl`/`videoUrl` are set)
7. **Gradient divider:** a horizontal line that fades from the accent colour to transparent
8. **Sections:** `StaggerChildren` wraps all `Section` objects from the data

Each section renders:
- `<h3>` heading in `text-white/80 font-bold`
- Body paragraph
- **Optional code block:** macOS-style window with traffic light dots, filename tab, and `<pre><code>` content
- **Optional table:** full-width table with `thead` and `tbody`, border-separated rows
- **Optional note:** an "ℹ" info box in the accent colour

---

### 8.5 Research (Index) — `app/research/page.tsx`

**Purpose:** Two-column grid showing reading track and implementations track. Each card links to a full paper detail page.

**This is a `"use client"` component** (uses Framer Motion wrappers).

#### Two-column layout

```jsx
<div className="grid lg:grid-cols-2 gap-10">
  <div> {/* 📖 Paper Club column — amber */} </div>
  <div> {/* ⚙️ Implementations column — blue */} </div>
</div>
```

#### Notebook page cards (Paper Club — reading track)

This is the most visually distinctive card design in the portfolio. Each card is designed to look like a page torn from a spiral-bound notebook.

**Visual elements:**
1. **Ruled lines** — `repeating-linear-gradient` creates horizontal ruled lines across the card background, exactly like notebook paper:
   ```css
   background: repeating-linear-gradient(
     transparent 0px, transparent 27px,
     rgba(251,146,60,0.055) 27px, rgba(251,146,60,0.055) 28px
   ), #0d0a06;
   ```
   Lines repeat every 28px (27px transparent + 1px amber rule).

2. **Spiral binding strip** — An absolutely-positioned div on the left side (width `w-10`), darker than the card body, with a `borderRight`. Inside it, 4 ring circles are evenly spaced using `justify-around py-5`:
   ```jsx
   <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-around py-5"
     style={{ background: "rgba(0,0,0,0.28)", borderRight: "1px solid rgba(251,146,60,0.12)" }}>
     {[0,1,2,3].map(i => (
       <div key={i} className="w-3.5 h-3.5 rounded-full border-2"
         style={{ borderColor: "rgba(251,146,60,0.38)", background: "#050a12" }} />
     ))}
   </div>
   ```

3. **Left margin rule** — A 1px amber vertical line at `left: 10` (right edge of binding strip), at 40% opacity, mimicking a notebook's red margin line.

4. **Dog-eared corner** — The top-right corner is clipped using `clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)"`. A small amber `linear-gradient` triangle is overlaid in the corner to simulate the folded paper:
   ```jsx
   <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
     style={{ background: "linear-gradient(225deg, rgba(251,146,60,0.3) 50%, transparent 50%)" }} />
   ```

5. **Content** starts at `pl-14` (leaves room for the 40px binding strip + 8px gap).

6. **Border** is set to `borderLeft: "none"` and `borderRadius: "2px 12px 12px 12px"` — the left edge is the binding strip, not a border.

#### Code editor window cards (Implementations track)

Each implementation card looks like an open Python file in a code editor.

**Visual elements:**
1. **Editor title bar** — Similar to macOS terminal: three traffic light dots + the paper's `.py` filename:
   ```jsx
   <div className="flex items-center gap-2 px-4 py-2.5 border-b"
     style={{ background: "rgba(96,165,250,0.04)", borderColor: "rgba(96,165,250,0.12)" }}>
     <div className="flex gap-1.5">
       <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,95,87,0.55)" }} />
       <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,189,46,0.55)" }} />
       <div className="w-2.5 h-2.5 rounded-full group-hover:opacity-100 opacity-55 ..."
            style={{ background: ACCENT_IMPL }} />
     </div>
     <div className="font-mono text-xs ml-2">{p.id}.py</div>
   </div>
   ```
   The green traffic light brightens on hover — a subtle micro-interaction saying "this one's live."

2. **Line number gutter** — A `w-9` div on the left with numbers 1–7, in `text-[10px] font-mono` at 22% opacity. Separated from content by a faint border.

3. **Python comment** — First line of content is `# {venue} · {year}` in monospace at 45% blue opacity — it looks like a Python comment in a real editor.

4. **Content** continues in a readable sans-serif below the comment line.

---

### 8.6 Research (Detail) — `app/research/[id]/page.tsx` + `PaperDetail.tsx`

Structurally identical to the Projects detail system.

`page.tsx` is a Server Component that calls `generateStaticParams()` (returns all paper IDs), `generateMetadata()`, and passes the fetched paper to `PaperDetail.tsx`.

`PaperDetail.tsx` is a `"use client"` component that renders:
- Track-aware accent: amber for reading papers, blue for implementations
- Track label chip: "📖 Paper Club" or "⚙️ Implementation"
- Breadcrumb: `← Research / {title}`
- Paper metadata: venue, year
- Sections with headings, body, optional code blocks

---

### 8.7 Blog — `app/blog/page.tsx`

**Purpose:** Two tracks of writing — "My Thinking" (original) and "Curated & Annotated". Articles open in a full-screen modal rather than navigating to a new page. (This design was deliberately kept — blog is supplementary content, not the primary portfolio focus.)

**This is a `"use client"` component** — uses `useState` for track filter and `useState(open)` for the modal.

#### Track tab bar

Three buttons: "All Posts", "✍️ My Thinking", "📡 Curated & Annotated". Clicking sets `track` state; `visible` is filtered accordingly.

#### Notebook card grid

3-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). Each card:
- Top coloured bar: 3px `height`, full-width gradient matching the post's colour
- Date + read time in monospace
- Track label with emoji prefix
- Title in `font-bold text-base text-white/85`
- Teaser in `text-sm text-white/50`
- Tag chips in the post's colour
- "Read →" footer

Cards are `<button>` elements (not links) — clicking sets `open` to the post's title.

#### Full-article modal

When `open` is set, a fixed overlay renders:
```jsx
<div className="fixed inset-0 z-50 overflow-y-auto"
  style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)" }}
  onClick={() => setOpen(null)}>   {/* Click outside to close */}
```

The modal content parses the `content` string (markdown-like plain text with `**bold**` markers and `\n\n` paragraph separators):
- Paragraphs starting and ending with `**` are rendered as `<h3>` headings
- Bold markers `**text**` are replaced with `<strong>` via `String.replace`
- Rendered with `dangerouslySetInnerHTML` (safe here — content is hardcoded, not user-generated)

#### Current posts

Two original posts:
1. **"RAG at Production Scale"** (Jun 2026) — LTR with LLM-as-judge synthetic labels, XGBoost LambdaMART, the 9 engineered features from the Answer Engine
2. **"87% Less Latency"** (Mar 2026) — The Go migration story from Sharechat, profiling the real bottleneck (serialisation + concurrency, not the ML model)

---

## 9. Animation System

All animations are built on two primitives: **Framer Motion** (for entrance transitions) and **IntersectionObserver** (for counter and bar animations).

### Framer Motion entrance animations

**Philosophy:** All entrance animations use `whileInView` with `viewport={{ once: true, margin: "-60px" }}`. This means:
- Animations fire when an element enters the viewport (scroll-triggered, not on mount)
- `once: true` — they fire exactly once, not every time you scroll past
- `margin: "-60px"` — fires 60px *before* the element is fully in view, so it's animating as it appears

**Stagger pattern:** Every list of cards or bullets uses `StaggerChildren` + `StaggerItem`. The stagger delay is typically `0.1s` — fast enough to feel snappy, slow enough to read as a sequence rather than all appearing simultaneously.

**Direction:** `FadeIn` defaults to direction `"up"` (slides up while fading in). Page headings and hero content use `direction="up"`. Some elements use `direction="left"` or no direction (pure fade).

### IntersectionObserver for metric counts and bars

Framer Motion doesn't natively animate numeric values from 0 to N or fill a CSS `width` property — that requires `requestAnimationFrame` loops. Both `useCounter` (metric cards on Home) and `AnimatedBar` (experience page) use the same pattern:

```
IntersectionObserver triggers → setTimeout(150ms) → start rAF loop → update state each frame
```

The `setTimeout(150ms)` before starting the animation prevents jarring instant-starts when content lands exactly at the viewport edge.

### Micro-interactions (hover)

Different per section, providing visual variety without chaotic entrance animations:

- **Research notebook cards:** lift `-translate-y-1` + warm amber shadow on hover
- **Research code editor cards:** the green traffic light dot brightens (`opacity-55 → opacity-100`) on group-hover
- **Project terminal cards:** all three traffic lights brighten on `group-hover`, deep shadow appears
- **Home featured work cards:** border colour transitions from near-invisible to cyan on hover
- **Experience timeline:** no hover effect (it's a reading section, not interactive)
- **Blog cards:** `hover:-translate-y-1.5` + large shadow on the card grid buttons

---

## 10. Creative Card Designs

Three distinct card "shapes" across the portfolio communicate what type of content they contain at a glance.

### Terminal windows (Projects page)

On-brand for an ML engineer: project cards look like macOS terminal windows. This reinforces the "I build things in code" message before you've read a word.

Key structural detail: the `border: 1px solid ${p.accent}22` on the outer card changes to a deep `hover:shadow` rather than a border colour change on hover. This feels more like a real window "activating."

### Notebook pages (Research — Paper Club)

Communicates "I read and annotate papers manually." The ruled lines, spiral binding, margin rule, and dog-eared corner all carry the metaphor. The warm dark background (`#0d0a06` with an amber tint) vs the cold blue-black of the implementation cards makes the two columns feel like two different *tools* — a notebook and a code editor.

**Implementation challenge:** `clip-path` and `borderRadius` are independent CSS properties. The clip-path `polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)` cuts the top-right corner. The `borderRadius: "2px 12px 12px 12px"` keeps the other corners rounded. Combined, you get: straight top-left, cut top-right (dog-ear), rounded bottom-right, rounded bottom-left.

**Note:** `clip-path` clips `box-shadow` as well. To work around this, hover shadow is achieved with `filter: drop-shadow` or with `hover:shadow-[...]` from outside the clip-path element — in this case we just use translate-up on hover, which doesn't conflict.

### Code editor windows (Research — Implementations)

Communicates "I write code to implement these ideas." The `.py` filename in the title bar, the line numbers in the gutter, and the `# comment` style metadata line all carry the metaphor without being heavy-handed.

The `borderColor` is blue (`rgba(96,165,250,0.2)`) and the background is `#080c12` — slightly bluer than the rest of the site, reinforcing the code-editor feel. The green traffic light brightens to full opacity on hover — the most subtle of the micro-interactions but deliberately chosen: it's the "run" button lighting up.

---

## 11. Aurora Background

The Home page background has three layered blurred radial divs that drift slowly using CSS animation.

### How it works

```html
<div class="absolute inset-0 pointer-events-none overflow-hidden">
  <!-- Blob 1: cyan, top-left -->
  <div style="background:#00e5ff; width:800px; height:800px; border-radius:50%;
              filter:blur(100px); opacity:0.2; animation:drift 12s infinite alternate" />
  
  <!-- Blob 2: blue, top-right -->
  <div style="background:#1a4fff; width:600px; height:600px; border-radius:50%;
              filter:blur(110px); opacity:0.14; animation:drift 16s infinite alternate-reverse" />

  <!-- Blob 3: purple, bottom-center -->
  <div style="background:#7c3aed; width:500px; height:500px; border-radius:50%;
              filter:blur(130px); opacity:0.1; animation:drift 22s infinite alternate" />
</div>
```

The `@keyframes drift` animation moves each blob 70px right and 50px down while scaling to 1.18x:
```css
@keyframes drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(70px, 50px) scale(1.18); }
}
```

Each blob uses a different duration (12s, 16s, 22s) and alternate-vs-alternate-reverse so they move somewhat independently, creating an organic floating feel rather than synchronised pulsing.

### Opacity tuning

The original values (7% and 5%) were invisible in a well-lit room. Current values (20%, 14%, 10%) are visible while remaining subtle — the aurora is a mood setter, not a feature.

The overall page has a base radial gradient (`radial-gradient(ellipse 100% 60% at 15% -5%, #0d2040 0%, #050a12 55%)`) that provides a darker blue corner. The aurora blobs add colour movement *on top of* this static gradient.

---

## 12. Navigation

The Nav is sticky (`position: sticky, top: 0`) with `z-50`. It uses `backdrop-filter: blur(12px)` + a semi-transparent background so scrolling content appears to slide behind it (a glass-morphism effect).

On mobile (viewport < `md`), the nav collapses to a hamburger icon. Clicking it toggles an absolutely-positioned dropdown list. The hamburger renders as a `☰` character; the close button as `✕`.

The Nav reads `usePathname()` on every render. The active route is detected by:
- Exact match `pathname === "/"` for the home link
- `pathname.startsWith(href)` for all other links, so `/projects/codaf` highlights the "projects" link

---

## 13. Deployment

### Setup

The `nextjs-portfolio/` directory was initialised as its own git repository (separate from the outer `my-portfolio` repo), pushed to GitHub, and connected to Vercel.

Vercel auto-detects Next.js projects and sets the build command to `next build` and output directory to `.next`. No manual configuration was needed.

### Deployment URLs

- **Production URL** (public, shareable): `yourproject.vercel.app` — shown in the Vercel dashboard under "Domains"
- **Preview URLs** (private, requires Vercel login): `portfolio-[hash]-[username].vercel.app` — created for every single git push

**Important distinction:** The preview URLs (with the hash in the middle) are only accessible when you're logged into Vercel. Always share the production URL. The preview URL showing a login wall is expected behaviour, not a deployment failure.

### Build output

`next build` pre-renders all 17 routes as static HTML at build time using `generateStaticParams`. The output is a standard `.next` directory that Vercel serves from its CDN. There is no Node.js server at runtime — the entire site is static files.

---

## 14. Bugs Fixed During Development

| Bug | Root Cause | Fix |
|---|---|---|
| `@import` build error | `@import "tailwindcss"` was placed before the Google Fonts `@import url(...)`. Tailwind v4 requires being last. | Swapped import order in `globals.css` |
| Python f-string in JS template literal | A Python code snippet containing `${action['amount']}` was inside a JS template literal string. The `${}` was parsed as a JS expression. | Simplified the code snippet to avoid `${}` syntax |
| TypeScript: duplicate `borderLeft` key (Experience, line 171) | Object literal had `borderLeft` defined twice. TypeScript strict mode rejects duplicate keys. | Removed the duplicate key |
| TypeScript: duplicate `borderLeft` key (Home, line 180) | Same issue in a different component. | Same fix |
| TypeScript: missing `content_label` field | `PaperCard` type didn't include the optional `content_label` field but data objects used it. | Added `content_label?: string` to the type |
| Preview server port conflict | Port 3030 was held by a previous Node process that didn't shut down cleanly. | `kill $(lsof -ti:3030)` then restarted the dev server |
| `launch.json` wrong location | Preview tool looks for `.claude/launch.json` at the repo root. It was created inside `nextjs-portfolio/.claude/` instead. | Moved to `/my-portfolio/.claude/launch.json` |
| Next.js 16 async params | `params` in dynamic route files is now `Promise<{ id: string }>` in Next.js 16, not a plain object. Accessing `params.id` directly caused a build error. | Added `await params` before destructuring in all `[id]/page.tsx` files |

---

## 15. Future Work

These were discussed but not yet implemented. Notes on how to add each:

### Video demos per project

Each `Project` type has a `videoUrl?: string` field. When populated, `ProjectDetail.tsx` renders an embed button (Loom or YouTube unlisted). To add: record a 2–3 min demo, get the embed URL, add it to the relevant project in `lib/projects.ts`.

### GitHub commit streak badge

When you have a substantial streak worth showing, add this to the hero section of `app/page.tsx`:

```jsx
<img
  src="https://streak-stats.demolab.com?user=YOUR_GITHUB_USERNAME&theme=dark&background=050a12&ring=00e5ff&fire=00e5ff&currStreakLabel=00e5ff"
  alt="GitHub Streak"
  className="rounded-xl mt-4"
/>
```

Customise the colour params to match the cyan accent. The service is free and updates daily.

### Skills radar chart

Use `recharts` (`npm install recharts`). A `RadarChart` with axes for: LLM Orchestration, ML Infrastructure, Recommendation Systems, Research, Backend Systems. Add it between the tech stack chips and the Featured Work section on Home.

### Terminal easter egg (Ctrl+K)

A `useEffect` on the Home page listening for `Ctrl+K` that triggers a fake terminal overlay (similar to the blog modal pattern). Typed commands like `whoami`, `ls projects/`, `cat resume.pdf` return canned responses. Pure JavaScript with `useState` for the overlay and input.

### Page transitions with `AnimatePresence`

Wrap the `{children}` in `layout.tsx` with Framer Motion's `AnimatePresence`. Add `initial={{ opacity: 0, y: 8 }}` and `animate={{ opacity: 1, y: 0 }}` with an `exit` variant. This gives cross-page fade transitions. Note: requires `"use client"` on the layout, which changes SSR behaviour — test carefully.

### "Currently Building" section on Home

A small section above the metrics showing 1–2 active projects. Marked with a pulsing green dot. Data would be a simple hardcoded array at the top of `app/page.tsx` — update it manually as projects change.

---

*Report generated July 2026. Reflects the state of the portfolio as of the current implementation session.*
