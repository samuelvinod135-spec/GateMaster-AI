---
doc: spec
status: approved
---

# GateMaster AI — Technical Spec

## How This Works, In Plain Language
GateMaster AI is a client-side interactive visual simulation web application built with React, TypeScript, and the HTML5 Canvas API. 

The application is split into two specialized visual engines:
1. **The Linear Algebra Engine:** Takes a 2x2 transformation matrix from responsive slider controls and computes the transformed Cartesian grid points, basis vectors $\hat{i}$ and $\hat{j}$, and the determinant in real time. It renders them to an HTML5 canvas using native 2D affine transformation math.
2. **The Digital Logic Engine:** Models a digital Half-Adder circuit (XOR and AND gates). When the user clicks binary input toggles, it computes the Boolean signal propagation through each wire segment and logic gate, rendering animated glowing signal paths on the canvas and highlighting the corresponding row in a synchronized Truth Table.

All user interactions operate at 60 FPS in memory. When a micro-challenge condition is met (e.g. determinant reaching zero, or generating a carry bit), the event triggers a state transition: progress is saved instantly to browser `localStorage` and dispatched asynchronously to a Supabase cloud database via an anonymous guest session ID. If Supabase is unconfigured or offline, the app continues without interruption using local storage.

---

## The Core Journey Through the System
*PRD ref: `prd.md > The Core Journey`.*

1. **User loads the app:** `App.tsx` initializes, mounts `Header`, and displays `LinearAlgebraView`. `usePersistence` checks `localStorage` for an existing anonymous UUID; if none exists, it generates a fresh one (`crypto.randomUUID()`) and checks for cached challenge scores.
2. **User drags a matrix slider:** `LinearAlgebraControls` updates `matrix` state in `useGateMasterStore`. The `VectorCanvas` component intercepts the change in a `useLayoutEffect` / `requestAnimationFrame` loop, scaling the canvas by `window.devicePixelRatio` and drawing the transformed grid, glowing basis vectors, and determinant parallelogram.
3. **Determinant equals 0:** The calculation engine detects $|ad - bc| < 0.001$, renders the space collapse visual indicator, and signals the challenge manager.
4. **Challenge solved banner slides in:** `ChallengeCard` displays "Challenge Solved! 🎉". `usePersistence` writes `{ matrixCollapsed: true }` to `localStorage` and sends a background `upsert` call to Supabase table `user_progress`.
5. **User clicks 'Digital Logic' tab:** `App.tsx` transitions view to `DigitalLogicView`. `CircuitCanvas` mounts and renders the Half-Adder schematic.
6. **User clicks toggle A to '1':** `DigitalLogicControls` flips `inputs.a` to `true`. `CircuitCanvas` re-draws the schematic with glowing neon green wire traces leading into the XOR and AND gates, lights up the Sum LED, and updates the reactive `TruthTable` component to highlight row $(1, 0)$.
7. **User toggles B to '1':** Signal reaches the AND gate; Carry LED lights up, Sum turns off. Challenge 2 completes, syncing score `2/2` to `localStorage` and Supabase.

---

## Stack
- **Framework & Bundler:** React 18 + Vite (TypeScript)  
  *Rationale:* Vite provides sub-millisecond HMR, zero server-side rendering friction with HTML5 Canvas, and instant build times for local demo recording and deployment.
  *Doc link:* https://vitejs.dev/guide/
- **Language:** TypeScript 5.x  
  *Rationale:* Enforces strict types on 2D matrix arrays, canvas context operations, and binary logic states to prevent runtime rendering bugs.
- **Styling:** Vanilla CSS with custom properties (CSS variables)  
  *Rationale:* Maximum performance and control over canvas layering, neon glow filters (`drop-shadow`, `box-shadow`), responsive grid layout, and zero runtime CSS overhead.
- **Backend & Persistence:** `@supabase/supabase-js` (v2.x)  
  *Rationale:* Zero-friction backend providing instant RESTful upserts for anonymous guest progress.
  *Doc link:* https://supabase.com/docs/reference/javascript/introduction
- **Icons:** `lucide-react` (lightweight SVG icons for mode switches, reset, and status badges).
  *Doc link:* https://lucide.dev/guide/packages/lucide-react

---

## Where It Runs and How Someone Tries It
- **Runtime:** Client-side Single Page Application (SPA) running in any modern web browser (Chrome, Safari, Firefox, Edge).
- **Local Development & Demo Recording:**
  ```bash
  npm install
  npm run dev
  ```
  Open `http://localhost:5173` to test and record the 60-second demo video.
- **Environment Configuration:**
  Create a `.env` file (optional, falls back gracefully to `localStorage` if omitted):
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- **Optional Deployment:** Vercel / Netlify / GitHub Pages. Build with `npm run build` (outputs static files to `dist/`).

---

## Look and Feel
*Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.*

- **Theme & Colors:**
  - Background: Deep slate/dark navy (`#090d16` body, `#0f172a` canvas backdrop, `#1e293b` control cards).
  - Accents: Electric Cyan (`#06b6d4`), Neon Magenta (`#ec4899`), Emerald Green (`#10b981`), Amber (`#f59e0b`).
  - Text: High-contrast white (`#f8fafc`) for headers, muted slate (`#94a3b8`) for labels.
- **Typography:**
  - Google Fonts import: *Inter* (UI controls, labels, instructions) and *JetBrains Mono* (matrix entries, coordinates, determinant readouts, truth tables).
- **Layout:**
  - Desktop: 2-column split-screen (`grid-template-columns: 380px 1fr` or `38% 62%`).
  - Mobile / Tablet: Responsive single-column vertical stack with canvas fixed at 360px height.

---

## Components

### 1. `Header`
- **What it does:** Displays the brand identity, mode switcher navigation buttons (`Linear Algebra` vs `Digital Logic`), challenge completion counter badge (`X/2 ⭐`), and Supabase sync status indicator (`Synced` / `Local Only`).
- **PRD ref:** `prd.md > Screens and Layout > 1. Top Header Bar`.

### 2. `LinearAlgebraView`
- **What it does:** Container component for the 2D matrix visualizer. Houses `LinearAlgebraControls`, `VectorCanvas`, and `ChallengeCard`.
- **PRD ref:** `prd.md > Features and Behavior > 1. Linear Algebra Engine`.

### 3. `LinearAlgebraControls`
- **What it does:** Renders 2x2 matrix slider controls ($a, b, c, d \in [-4, 4]$), direct numerical inputs, preset buttons (Identity, Shear, Scale, Zero Det), and real-time determinant readout ($ad - bc$). Displays space collapse alert when $\det = 0$.
- **PRD ref:** `prd.md > Features and Behavior > 1. Linear Algebra Engine`.

### 4. `VectorCanvas`
- **What it does:** High-DPI HTML5 canvas component. Transforms the Cartesian grid using matrix $M$, draws transformed grid lines, basis vectors $\hat{i}$ (Cyan) and $\hat{j}$ (Magenta) with arrowheads and coordinate labels, and paints the shaded determinant parallelogram.
- **PRD ref:** `prd.md > Features and Behavior > 1. Linear Algebra Engine`.

### 5. `DigitalLogicView`
- **What it does:** Container component for the digital logic visualizer. Houses `DigitalLogicControls`, `CircuitCanvas`, and `ChallengeCard`.
- **PRD ref:** `prd.md > Features and Behavior > 2. Digital Logic Engine`.

### 6. `DigitalLogicControls`
- **What it does:** Renders binary toggle switches for inputs $A$ and $B$, reset button, and the synchronized `TruthTable` component highlighting the active combination row.
- **PRD ref:** `prd.md > Features and Behavior > 2. Digital Logic Engine`.

### 7. `CircuitCanvas`
- **What it does:** High-DPI HTML5 canvas rendering the Half-Adder schematic. Computes $Sum = A \oplus B$ and $Carry = A \cdot B$. Paints input pins, wire traces with neon glowing pulse effects when active ($1$), standard gate symbols (XOR, AND), and output LED status rings.
- **PRD ref:** `prd.md > Features and Behavior > 2. Digital Logic Engine`.

### 8. `TruthTable`
- **What it does:** Compact tabular component displaying the 4 Half-Adder states $(00, 01, 10, 11)$. Dynamically applies glowing highlight styling to the row matching current inputs.
- **PRD ref:** `prd.md > Features and Behavior > 2. Digital Logic Engine`.

### 9. `ChallengeCard`
- **What it does:** Displays the active objective for the current mode, completion checkmark, and animates the slide-in success banner when the goal is reached.
- **PRD ref:** `prd.md > Features and Behavior > 3. "Break It to Learn It" Micro-Challenges`.

### 10. `AIProblemBox`
- **What it does:** Interactive natural language concept query box and step-by-step visual tutor. Prompts an LLM through Supabase Edge Function `solve-problem` (or offline fallback), validates with Zod, and renders a step-by-step stepper that updates the canvases live. Includes a "Weak Topics" concept frequency tracker and a "Try It Yourself" interactive handoff.
- **PRD ref:** `prd.md > Features and Behavior > 5. AI Problem Box & Concept Tutor`.

---

## Data Model & State Architecture

### 1. In-Memory Store (`useGateMasterStore`)
```typescript
export interface Matrix2x2 {
  a: number; // Row 1, Col 1 (i-hat x)
  b: number; // Row 1, Col 2 (j-hat x)
  c: number; // Row 2, Col 1 (i-hat y)
  d: number; // Row 2, Col 2 (j-hat y)
}

export interface LogicInputs {
  a: boolean;
  b: boolean;
}

export interface UserProgress {
  sessionId: string;
  linearAlgebraSolved: boolean;
  digitalLogicSolved: boolean;
  updatedAt: string;
}
```

### 2. Storage & Supabase Schema
- **Local Storage Key:** `gatemaster_user_progress`
- **Supabase Table:** `user_progress`
```sql
CREATE TABLE IF NOT EXISTS user_progress (
  session_id TEXT PRIMARY KEY,
  linear_algebra_solved BOOLEAN DEFAULT FALSE,
  digital_logic_solved BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## File Structure

```
GateMaster AI/
├── index.html                  # HTML entry point with Google Fonts preloads
├── package.json                # Dependencies and scripts (Vite, React, TypeScript)
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── .gitignore                  # Git ignore rules (includes learner-profile, .env)
├── devpost/                    # Hackathon planning artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── src/
│   ├── main.tsx                # React root mount
│   ├── App.tsx                 # Main layout, mode router, header, and views
│   ├── index.css               # Global theme tokens, typography, layout, glow effects
│   ├── types.ts                # TypeScript interfaces (Matrix, Logic, Progress)
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client initializer with graceful fallback
│   │   └── math.ts             # Matrix transformation, determinant, coordinate math
│   ├── hooks/
│   │   ├── useGateMasterStore.ts # Centralized reactive state store
│   │   └── usePersistence.ts   # Anonymous UUID, localStorage caching, Supabase sync
│   └── components/
│       ├── Header.tsx          # Top navigation and score badge
│       ├── ChallengeCard.tsx   # Micro-challenge prompt and success banner
│       ├── linear-algebra/
│       │   ├── LinearAlgebraView.tsx
│       │   ├── LinearAlgebraControls.tsx
│       │   └── VectorCanvas.tsx
│       └── digital-logic/
│           ├── DigitalLogicView.tsx
│           ├── DigitalLogicControls.tsx
│           ├── CircuitCanvas.tsx
│           └── TruthTable.tsx
```

---

## External Services and Dependencies
- **Supabase Cloud (REST API):**
  - Endpoint: `POST /rest/v1/user_progress` (Upsert with `Prefer: resolution=merge-duplicates`)
  - Auth: Public Anon Key
  - Fallback: Gracefully bypassed if offline or env vars absent.

---

## Important Failure Modes & Fallbacks

1. **Supabase Unavailable or Unconfigured:**
   - *Failure:* Network drop, CORS issue, or missing `.env` API keys.
   - *Fallback:* `usePersistence` logs a warning in console, flags UI as `Saved Locally`, and saves everything to `localStorage`. Zero broken buttons or error popups.
2. **High-DPI / Retina Canvas Blurriness:**
   - *Failure:* Blurry vector text and fuzzy grid lines on MacBook/mobile screens.
   - *Fallback:* Both `VectorCanvas` and `CircuitCanvas` multiply dimensions by `window.devicePixelRatio` and scale coordinate context, ensuring razor-sharp rendering on Retina displays.
3. **Invalid Matrix Input / NaN:**
   - *Failure:* User enters invalid numerical values into text inputs.
   - *Fallback:* Sanitizer clamp utility defaults NaN or Infinity values back to default bounds $[-4, 4]$.

---

## What Was Simplified and Why
- **Slider-Driven Transformations instead of Arbitrary Canvas Dragging:** High-precision sliders provide clean, reproducible matrix inputs without complex canvas drag collision hit-testing, keeping the code simple, predictable, and 100% bug-free for the hackathon.
- **Dedicated Half-Adder Schematic instead of Multi-Gate Drag-and-Drop Builder:** Focuses development on an ultra-polished, visually stunning Half-Adder simulation with glowing animated electricity rather than an unfinished, buggy schematic editor.
- **Anonymous UUID Session instead of Full OAuth Auth Flow:** Completely removes sign-in friction for judges and classmates while still demonstrating real-world cloud database synchronization.

---

## Decisions and Open Issues

### Decisions Made
- **Vite + React + TypeScript:** Selected for optimal Canvas rendering performance, zero SSR friction, and strong typing.
- **Separation of Render Loop vs. Event-Driven Persistence:** High-frequency canvas updates happen in-memory at 60 FPS; network sync occurs only on discrete challenge completion events.
- **Anonymous Persistence Fallback:** All features remain 100% functional offline.

### Addressed Learning Goal / Uncertainty
- **Learner Question:** How to coordinate high-frequency HTML5 Canvas rendering with React state and Supabase persistence without dropped frames or rate-limiting.
- **Resolution:** Decoupled the high-frequency canvas drawing logic (pure functions consuming matrix data) from the event-driven persistence hook. Sliders update local component state; Supabase calls only fire on discrete challenge victory transitions.
