---
doc: prd
status: approved
---

# GateMaster AI — Product Requirements

An interactive dual-engine visual sandbox turning abstract Linear Algebra and Digital Logic concepts into playable, real-time web simulations for first-year engineering students.  
*Source: `scope.md > # GateMaster AI` and `scope.md > The Unique Kernel`.*

---

## The Core Journey
1. **Arrival:** The student opens GateMaster AI and immediately lands in the **Linear Algebra Mode** without any sign-up or onboarding friction.
2. **Exploration & Manipulation:** The student adjusts the 2x2 matrix slider controls in the left pane. On the right, the coordinate grid warps live, basis vectors $\hat{i}$ and $\hat{j}$ move, and the shaded determinant parallelogram resizes smoothly.
3. **The First "Aha!" Moment:** The student drags the sliders until the determinant reaches zero. The coordinate grid collapses into a 1D line or point, the determinant area vanishes, and an alert indicates that space has collapsed and dimensionality is lost.
4. **Challenge Progression:** Meeting the challenge condition triggers a celebratory banner ("Challenge Solved! 🎉") with an animated border pulse; progress is cached locally and queued for cloud sync.
5. **Mode Switching:** The student clicks the top navigation toggle to switch into **Digital Logic Mode**.
6. **Circuit Logic & Signal Flow:** The student views a clean schematic of a Half-Adder circuit. Clicking the $A$ and $B$ input toggles flips values between 0 and 1; connecting wires light up in glowing neon, gates illuminate as signals propagate, output LEDs for Sum and Carry react, and the active Truth Table row illuminates.
7. **Second Challenge & Sync:** The student fulfills the digital logic challenge (setting $A=1, B=1$ to produce Carry=1), earning the second challenge badge, with scores synced to Supabase under an anonymous session UUID.

---

## Screens and Layout
A responsive single-surface application featuring a persistent top header and a split-pane layout:

1. **Top Header Bar:**
   - Brand title: `GateMaster AI` with a visual circuit-grid icon.
   - Mode Selector Tabs: `Linear Algebra` | `Digital Logic` (instant toggle with smooth transition).
   - Session & Score Badge: Displays total challenges solved (e.g., `Challenges: 2/2 ⭐`) and cloud sync status indicator (`Synced` / `Saved Locally`).

2. **Split-Screen Layout (Desktop):**
   - **Left Control Pane (approx. 38% width):** Houses formula inputs, sliders, interactive toggles, live Truth Table / numeric readouts, reset controls, and active challenge cards.
   - **Right Visual Canvas (approx. 62% width):** Dedicated high-DPI HTML5 Canvas rendering interactive grids, vectors, circuit traces, and real-time visual physics.

3. **Responsive Mobile Layout:**
   - Vertically stacked layout: Visual Canvas on top (fixed height, touch-responsive), Control Pane directly below with accessible touch controls and sliders.

---

## Look and Feel
- **Theme:** Deep high-contrast dark theme (slate/zinc background `#090d16` to `#0f172a`, card surfaces `#1e293b`).
- **Accent Palette:**
  - *Linear Algebra:* Electric Cyan (`#06b6d4`) for $\hat{i}$ basis vector; Neon Magenta/Pink (`#ec4899`) for $\hat{j}$ basis vector; translucent violet/indigo fill for determinant area.
  - *Digital Logic:* Emerald Green (`#10b981`) for active high signals (1 / True); Dim Slate (`#475569`) for low signals (0 / False); Amber Glow (`#f59e0b`) for active Carry/LED states.
- **Typography:**
  - UI Labels, Headings, and Instructions: *Inter* or *Plus Jakarta Sans* (clean, modern geometric sans-serif).
  - Matrices, Vector Coordinates, Determinant Formulae, and Truth Tables: *JetBrains Mono* (crisp, tabular monospace).
- **Interactions:** Subtle neon glows on active elements, smooth slider scrubbing, zero-lag render loop (targeting 60 FPS), and non-intrusive micro-animations.

---

## Features and Behavior

### 1. Linear Algebra Engine
*Source: `scope.md > The POC Boundary > Linear Algebra Module`.*

- **2x2 Matrix Controls:** Sliders and direct inputs for matrix $M = \begin{bmatrix} a & b \\ c & d \end{bmatrix}$ with range $[-4, 4]$ and step $0.1$.
- **Real-Time Coordinate Grid:** Renders Cartesian coordinate lines $(-10 \le x, y \le 10)$ transformed by matrix $M$ via HTML5 Canvas.
- **Basis Vector Rendering:** Distinct glowing vectors for $\hat{i} = (a, c)^T$ (Cyan) and $\hat{j} = (b, d)^T$ (Magenta) with directional arrowheads and coordinate tags.
- **Determinant Visualization:** Shaded parallelogram formed by origin $(0,0)$, $\hat{i}$, $\hat{j}$, and $\hat{i} + \hat{j}$.
- **Collapse Detection:** When $\det(M) = ad - bc = 0$, highlight the collapse with an alert message ("Determinant is 0: Space collapsed into a line / point! Inverse does not exist.").
- **Presets & Reset:** "Identity Matrix" button ($a=1, b=0, c=0, d=1$), "Shear", "Scale", and "Zero Determinant" presets.

#### Acceptance Criteria
- [ ] Dragging any matrix slider updates the transformed grid and basis vectors on canvas within the same animation frame.
- [ ] Determinant readout dynamically displays $ad - bc$ rounded to 2 decimal places.
- [ ] Setting values that result in $\det = 0$ triggers the visual "Matrix Collapsed" status indicator.
- [ ] Clicking "Reset to Identity" returns sliders and canvas instantly to the default standard basis.

---

### 2. Digital Logic Engine
*Source: `scope.md > The POC Boundary > Digital Logic Module`.*

- **Half-Adder Schematic:** Renders an XOR gate (Sum output: $A \oplus B$) and an AND gate (Carry output: $A \cdot B$) with interconnected wire traces.
- **Binary Input Toggles:** Interactive toggle switches for input $A$ and input $B$ switching between $0$ and $1$.
- **Signal Flow Animation:** High state (1) wires glow neon emerald green; Low state (0) wires render in muted dark slate. Gates illuminate when active.
- **Output Indicators:** Visual LED indicators for Sum and Carry that light up brightly when High (1).
- **Synchronized Truth Table:** A 4-row tabular display ($00, 01, 10, 11$) with Sum and Carry columns. The row corresponding to the active input combination is prominently highlighted in real time.

#### Acceptance Criteria
- [ ] Clicking toggle $A$ or $B$ flips the input state between 0 and 1 without page reload.
- [ ] Wires connected to active inputs transition to glowing green and propagate through XOR and AND gates correctly.
- [ ] When $A=1$ and $B=0$, Sum LED lights up ($1$) and Carry LED remains off ($0$).
- [ ] When $A=1$ and $B=1$, Sum LED remains off ($0$) and Carry LED lights up ($1$).
- [ ] The Truth Table row corresponding to current inputs is highlighted with an accent border and background glow.

---

### 3. "Break It to Learn It" Micro-Challenges
*Source: `scope.md > The POC Boundary > Micro-Challenge & Persistence`.*

- **Linear Algebra Challenge:** "Adjust the matrix so that the determinant equals 0 (Collapse the 2D space)."
- **Digital Logic Challenge:** "Configure inputs $A$ and $B$ to trigger the Carry output ($A=1, B=1$)."
- **Success Banner:** When the challenge goal is satisfied, slide in an animated banner at the top of the canvas: "Challenge Solved! 🎉" with a visual pulse.
- **Score Tracking:** Track solved challenges in application state and display a completion badge (e.g., "1/2 Solved", "2/2 Mastered").

#### Acceptance Criteria
- [ ] Reaching $\det = 0$ in Linear Algebra triggers the success banner and marks Challenge 1 complete.
- [ ] Setting $A=1, B=1$ in Digital Logic triggers the success banner and marks Challenge 2 complete.
- [ ] Completed challenge state persists across mode tab switches.

---

### 4. Zero-Friction Storage & Supabase Sync
*Source: `scope.md > What "Working" Looks Like`.*

- **Anonymous Guest Session:** On first visit, generate or retrieve a unique anonymous UUID stored in `localStorage`.
- **Local Persistence:** All challenge completions and custom matrix presets are immediately saved to `localStorage`.
- **Background Supabase Sync:** Automatically attempt to upsert challenge progress to a Supabase `user_progress` table using the anonymous UUID.
- **Offline / Graceful Resilience:** If Supabase credentials are not configured or network request fails, silently fall back to `localStorage` with a subtle UI indicator (`Saved Locally`) ensuring no interrupted user actions.

#### Acceptance Criteria
- [ ] Solving a challenge immediately updates local state and writes to `localStorage`.
- [ ] Application functions fully offline or without Supabase keys configured without throwing unhandled exceptions.
- [ ] When Supabase is configured and online, challenge progress is synced to the remote database.

---

### 5. AI Problem Box & Concept Tutor
*Source: `scope.md > The POC Boundary > AI Problem Box`.*

- **Natural Language Problem Input:** Student types a math or logic concept (e.g. "rotate 90 degrees then shear", "design a half adder", "what does a determinant of 0 mean").
- **Strict Schema Enforcement:** Output is strictly validated with Zod against `AIProblemResponseSchema`. Zero code generation or evaluation permitted.
- **Interactive Stepper Walkthrough:** Multi-step explanations with "Back" and "Next" controls. Advancing steps updates the corresponding Canvas in real time.
- **"Try It Yourself" Mode:** Seamlessly transitions from AI explanation to free-form tactile exploration, leaving the canvas interactive.
- **Weak Topic Tracking:** Logs queried concept tags to Supabase `ai_queries` (with local storage backup) and displays a summary of the student's top-queried topics with practice recommendations.
- **Resilient Fallback:** Cached responses for standard prompts kick in within 8s if offline or if network times out.

#### Acceptance Criteria
- [ ] Submitting "rotate 90 degrees and shear" automatically routes to Linear Algebra and animates the composite matrix.
- [ ] Submitting "design a half adder" routes to Digital Logic, illuminates the circuit wires, and highlights the truth table.
- [ ] Unsupported queries display a friendly guidance banner with supported concept chips.
- [ ] Zod rejects any non-conforming responses; code blocks are never rendered.
- [ ] Concept tags accumulate in the Weak Topics panel across queries.

---

## States and Boundaries

- **First Use State:** Default matrix $\begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix}$ loaded; canvas shows initial sheared grid; challenge 1 prompt visible; total score `0/2`.
- **Active Manipulation State:** Sliders being dragged; canvas renders at 60 FPS; determinant updates continuously.
- **Challenge Solved State:** Target condition met; success banner animates; score updates to `1/2` or `2/2`.
- **Mode Switched State:** State in each engine is preserved when switching between Linear Algebra and Digital Logic tabs.
- **Offline / Sync Fallback State:** Indicator shows "Offline / Saved Locally"; all interactive features and challenge verifications work without degradation.

---

## Product Decisions

- **Direct Slider Controls vs. Free-form Formula Parser:** Prioritized instant tactile sliders over LaTeX text parsing to eliminate typing errors and provide immediate physical intuition of matrix transformations.
- **Fixed Half-Adder Schematic vs. Arbitrary Wire Drawing:** Focused the digital logic engine on a pristine, perfectly rendered Half-Adder rather than an unconstrained breadboard builder, ensuring a rock-solid, bug-free proof of concept in the hackathon timeframe.
- **Anonymous Sessions vs. Mandatory Login:** Implemented frictionless guest UUIDs so reviewers and students can immediately test the visual sandbox without filling out registration forms.

---

## What We're Building
- Dual-engine web application with Linear Algebra and Digital Logic modes.
- HTML5 Canvas real-time 2D matrix transformation renderer with basis vectors and determinant shading.
- Interactive Half-Adder circuit simulator with dynamic wire glow and reactive Truth Table highlighting.
- 2 interactive micro-challenges with animated completion banners.
- Anonymous guest persistence with `localStorage` and Supabase cloud sync integration.

---

## Deferred From the POC
- 3D matrix visualization and eigenvalue/eigenvector ray casting.
- Full combinational/sequential logic gate component library (multiplexers, flip-flops, ALUs).
- Multi-user authentication, classroom leaderboards, and teacher assignment portals.

---

## Possible Later Enhancements
- Interactive matrix multiplication chaining (visualizing $AB$ as sequential transformations).
- Sound effects for gate toggles and challenge solves.
- Shareable URLs encoding custom matrix states or circuit challenges.

---

## Non-Goals
- GateMaster AI will NOT be an arbitrary circuit CAD tool (like KiCad or Proteus).
- GateMaster AI will NOT evaluate arbitrary mathematical integrals or symbolic algebra.
- GateMaster AI will NOT require mandatory account creation.

---

## Open Questions
- *None blocking technical specification.* Supabase client schema and anonymous table structure will be finalized during `4-spec`.
