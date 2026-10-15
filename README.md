# GateMaster AI 🚀
### Interactive Linear Algebra & Digital Logic Dual-Engine Visual Sandbox & AI Tutor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-0ea5e9?style=for-the-badge&logo=vercel)](https://gatemaster-ai.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Edge%20Functions-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-25%20Passed-FCC624?style=for-the-badge&logo=vitest)](https://vitest.dev/)

> **Live Demo:** [https://gatemaster-ai.vercel.app](https://gatemaster-ai.vercel.app)  
> *(Test demo mode with zero backend latency anytime using: `https://gatemaster-ai.vercel.app/?demo=1`)*

GateMaster AI is an interactive educational engineering platform for undergraduate engineering and computer science students. Built to solve the disconnect of static formulas and passive video animations, GateMaster AI pairs tactile, 60 FPS HTML5 Canvas physical simulations with an **AI Concept Problem Tutor**, a **Supabase-powered Weak-Topic Dashboard**, and **2D Eigenvector span-line diagnostics**.

Students manipulate mathematical space and digital signals directly—observing determinant collapse, tracing Boolean logic propagation, and asking typed conceptual queries that visually demonstrate mathematical proofs step-by-step.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |         GateMaster AI Client          |
                                  |  (React 18 + Vite + TypeScript 5)     |
                                  +-------------------+-------------------+
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                                                   |
                    v                                                                   v
     +------------------------------+                                    +------------------------------+
     |   Interactive Canvas Engines  |                                    |      Persistence & Sync      |
     | - Linear Algebra (Warp Grid, |                                    | - Anonymous Session ID       |
     |   Basis Vectors, Eigenlines) |                                    | - LocalStorage Caching       |
     | - Digital Logic (Half-Adder  |                                    | - Supabase Client SDK        |
     |   Circuit, Neon Logic Flow)  |                                    |   (PostgreSQL with RLS)      |
     +--------------+---------------+                                    +--------------+---------------+
                    |                                                                   |
                    | (Visual State Mapping)                                            | (Attempts & Queries)
                    v                                                                   v
     +------------------------------+                                    +------------------------------+
     |     AI Problem Box Tutor     |                                    |       Supabase Tables        |
     | - Zod JSON-Only Schema       |                                    | - public.ai_queries          |
     | - Multi-Step Interactive UI  |                                    | - public.challenge_attempts  |
     | - Offline Fallback Engine    |                                    | - public.user_progress       |
     +--------------+---------------+                                    +------------------------------+
                    |
                    | HTTPS Invoke ('solve-problem')
                    v
     +--------------------------------------------------------------+
     |                  Supabase Edge Function                      |
     | - 500-Character Prompt Guard                                 |
     | - Rate Limiter (20 req / hour / session)                     |
     | - Strict CORS Whitelist (localhost + deployed domain)        |
     | - Secure Server-Side Secrets (GEMINI_API_KEY / OPENAI_KEY)   |
     +------------------------------+-------------------------------+
                                    |
                                    v
                     +------------------------------+
                     |    LLM Provider API Engine   |
                     |  (Structured JSON Output)    |
                     +------------------------------+
```

---

## ⚡ Core Engines & Features

### 1. Linear Algebra Engine & 2D Eigenvectors
- **Real-Time 2D Matrix Warping:** Drag 2x2 matrix slider controls ($a, b, c, d$) to watch Cartesian coordinate space warp smoothly at 60 FPS.
- **Basis Vectors & Determinant:** Dynamic tracking of basis vectors $\hat{i}$ (Sky Blue) and $\hat{j}$ (Banana Yellow) with coordinate readouts and shaded determinant parallelogram area.
- **Space Collapse Detection:** Instant visual alert when $\det(M) = 0$, highlighting the loss of dimension where 2D space compresses into a 1D line or point.
- **Real Eigenvalues & Eigenvectors:** Analytical computation of eigenvalues ($\lambda_1, \lambda_2$) and normalized eigenvector span lines ($v_1, v_2$) drawn across the grid.
- **Complex Eigenvalue Alert:** When a transformation rotates every direction without invariant lines (e.g., pure rotations where discriminant $\Delta < 0$), the canvas clearly informs the student: *"No real eigenvectors: this transformation rotates every direction."*
- **Quick Presets:** Instant presets for Identity, Horizontal Shear, 2x Scaling, 90° Rotation, and Zero Determinant.

### 2. Digital Logic Engine (Half-Adder)
- **Canonical Circuit Schematic:** HTML5 Canvas rendering of industry-standard XOR (detached curved back arc with parallel body) and AND gates.
- **Neon Signal Flow:** Binary toggles ($A, B$) trigger illuminated signal propagation along right-angled circuit traces.
- **Reactive Truth Table:** Synchronized 4-row truth table highlighting the active binary combination row in real time.
- **Sum & Carry Status LEDs:** Visual status indicators reacting dynamically to logic gate evaluations.

### 3. AI Problem Box & Concept Tutor
- **Typed Problem Assistant:** Students type any conceptual challenge (e.g., *"rotate 90 degrees then shear"*, *"design a half adder"*, *"what does a determinant of 0 mean"*).
- **Strict Zero-Code Rule:** The AI never generates or returns executable code. It only outputs structured JSON strictly validated by Zod against `AIProblemResponseSchema`.
- **Step-by-Step Stepper:** Walks students through multi-step transformations, re-orienting the active canvas dynamically at each step.
- **Interactive Handoff:** Leaves the canvas fully unlocked after each explanation for continuous experimentation.

### 4. Supabase Weak-Topic Dashboard
- **Session-Based Privacy:** Uses an anonymous `session_id` stored in `localStorage`—no login or email required.
- **PostgreSQL RLS Tables:** Stores student queries in `ai_queries` and test attempts in `challenge_attempts` with strict per-session row-level security.
- **Pure Scoring Algorithm (`computeWeakTopics.ts`):** Evaluates student struggles using the formula:
  $$\text{Score} = (\text{failed\_attempts} \times 2) + (\text{retries} \times 1) + (\text{AI queries} \times 1)$$
  weighted with time decay for recent activity.
- **Weak Topics Panel:** Displays top 3 weak areas with intensity meters, plain-English reasons (e.g., *"2 failed attempts, asked AI twice"*), and a "Practice this" CTA jumping directly into the relevant challenge.

### 5. Demo Fallback & Offline Resilience
- **Pre-Cached Demo Responses (`cachedResponses.ts`):** Includes validated responses for linear transformations, half-adders, determinant 0, and eigenvectors.
- **Automatic Fallback:** If the Supabase Edge Function is unreachable, encounters network errors, or exceeds an 8-second timeout, GateMaster AI seamlessly renders cached data with an "Offline Demo" badge.
- **Recording Mode (`?demo=1`):** Adding `?demo=1` to the URL forces instant offline demo mode for 100% reliable hackathon video recording.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Sub-millisecond HMR, SPA client-side rendering |
| **Language** | TypeScript 5.5 | Strict type checking (`noImplicitAny`, zero `any`) |
| **Validation** | Zod 3.x / 4.x | Strict schema enforcement on all AI responses |
| **Canvas Graphics** | HTML5 Canvas 2D API | High-DPI Retina scaling, orthogonal wire routing, 60 FPS |
| **Design System** | Vanilla CSS Tokens | 3-Tone Palette: Matte Black/Slate, Sky Blue, Banana Yellow |
| **Backend Database** | Supabase PostgreSQL | Tables `ai_queries`, `challenge_attempts`, `user_progress` with RLS |
| **Serverless Runtime** | Supabase Edge Functions | Deno runtime, rate limiting, prompt length cap, CORS guard |
| **Unit Testing** | Vitest 2.1 | 25 unit tests covering Zod schemas, scoring, and eigen math |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/samuelvinod135-spec/GateMaster-AI.git
cd GateMaster-AI

# 2. Install dependencies
npm install

# 3. Run unit test suite (all 25 tests)
npm test

# 4. Start local development server
npm run dev

# 5. Build production bundle
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment Guide (Vercel / Netlify)

GateMaster AI includes production configurations for both **Vercel** (`vercel.json`) and **Netlify** (`netlify.toml`) with Single Page Application (SPA) routing rewrites.

### 1. Set Frontend Environment Variables in Hosting Dashboard
In your Vercel or Netlify project settings under **Environment Variables**, add:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
*(These are public client keys safe for browser exposure. No LLM secrets are placed here.)*

### 2. Deploy Supabase Database Migrations
Run the database migration to create the tables and RLS policies:
```bash
supabase db push
# Or run the SQL located at supabase/migrations/20261015000000_create_ai_queries.sql in Supabase SQL Editor
```

### 3. Set Edge Function Secrets & CORS
Set your LLM API key securely on Supabase (it will **never** be exposed in the frontend or git):
```bash
# Set Gemini or OpenAI API key
supabase secrets set GEMINI_API_KEY=your-gemini-key
# or: supabase secrets set OPENAI_API_KEY=your-openai-key

# Set your deployed domain for strict CORS protection
supabase secrets set CLIENT_APP_URL=https://gatemaster-ai.vercel.app
```

### 4. Deploy the Edge Function
```bash
supabase functions deploy solve-problem
```

---

## 📋 Post-Deploy Verification Checklist

- [ ] **Landing Page Loads:** Deep matte black theme renders smoothly with 60 FPS hero animations.
- [ ] **Linear Algebra Engine:** Grid warps upon dragging sliders; determinant updates live; "Zero Det" preset triggers space collapse indicator.
- [ ] **Eigenvectors Diagnostic:** Clicking "Show Eigenvectors" renders dashed span lines for scaling/shear, and hides lines with a warning message on 90° rotation.
- [ ] **Digital Logic Engine:** Toggling inputs $A$ and $B$ illuminates wires, operates XOR and AND gates, updates Sum/Carry LEDs, and highlights the active truth table row.
- [ ] **AI Problem Box:** Asking a query on the live URL returns schema-validated JSON steps; stepper advances correctly.
- [ ] **Demo Mode Resilience:** Appending `?demo=1` to the URL operates instantaneously with the "Offline Demo" badge.
- [ ] **Weak-Topic Dashboard:** Failing a challenge or submitting AI queries updates the weak-topic cards live without requiring a page reload.
- [ ] **Console Cleanliness:** Zero uncaught runtime errors or leaked keys in browser DevTools.
- [ ] **Mobile Responsiveness:** Layout stacks cleanly into single-column view on mobile viewport widths.

---

## 🔮 Future Work
- Photo/OCR input planned.
- 3D matrix transformation visualizer ($3 \times 3$ determinant and spatial volume warping).
- Arbitrary combinational and sequential logic circuit builder (NAND, NOR, Flip-Flops, Clocks).

---

## 📄 License
MIT License. Created for the Devpost Build With AI Hackathon.
