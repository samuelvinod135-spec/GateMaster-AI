---
doc: scope
status: approved
---

# GateMaster AI

An interactive dual-engine visual sandbox turning abstract Linear Algebra and Digital Logic concepts into playable, real-time web simulations.

## The Unique Kernel
Instead of static textbook formulas, video playback, or code-heavy plotting libraries, GateMaster AI pairs immediate physical interaction—dragging basis vectors to watch coordinate space warp and clicking gate toggles to watch signals propagate—with direct visual feedback on mathematical states (determinant collapse, active truth table row highlighting) and instant challenge scoring.

## Who It's For
First-year undergraduate engineering and computer science students tackling foundational mathematics and digital electronics courses (and preparing for university or GATE exams). Today, they bounce between static formula sheets, tedious pen-and-paper truth tables, and passive explanatory videos without an intuitive sandbox to test "what happens if I change this."

## The Core Loop
1. **Select a Mode & Scenario:** Choose between Linear Algebra (2D transformation matrix) and Digital Logic (Half-Adder circuit).
2. **Interact Live:** Drag 2x2 matrix values on sliders or click 0/1 gate input toggles.
3. **Observe the Reaction:** Watch coordinate space warp in real time with determinant area shading, or trace glowing signal flow through circuit wires and gates with dynamic truth table row tracking.
4. **Complete the Micro-Challenge:** Solve a targeted visual prompt (e.g., collapse the space or trigger specific output states) and see the completed score sync to Supabase.

## Inspiration & Identity
- **Visual Aesthetic:** Modern, high-contrast dark theme with glowing neon accents (cyan/electric blue for vector transformations, emerald green/amber for active binary signals).
- **Tone:** Technical, clean, highly responsive, and gamified—feels like an engineering diagnostic tool rather than a generic homework quiz.
- **Inspirations:** 3Blue1Brown's *Essence of Linear Algebra* animations made tactile and playable; Falstad circuit simulator made accessible and visually modern.

## Why This Matters to the Learner
As a first-year AI & Data Science undergraduate, the learner directly experiences the frustration of peers struggling with abstract 2D/3D math and binary flow. Building GateMaster AI combines a genuine pedagogical solution for classmates with the engineering challenge of building clean, high-performance HTML5 Canvas state management synced to a cloud backend.

## What "Working" Looks Like
A 60-second end-to-end demo:
1. **Linear Algebra Warping:** Open the 2D matrix canvas, drag sliders to transform the grid, watch basis vectors $\hat{i}$ and $\hat{j}$ move in real time, see the determinant area shrink to zero, and trigger a visual "matrix collapsed / dimension lost" state.
2. **Digital Logic Propagation:** Switch tabs to Digital Logic, toggle inputs $A$ and $B$ from 0 to 1 on a Half-Adder schematic, see the wires light up as electricity flows through the XOR and AND gates, and see the corresponding row in the Truth Table illuminate instantly.
3. **Backend Sync:** Complete the challenge condition and see an instant visual confirmation that the achievement has synced to Supabase.

## The POC Boundary
- **Dual-Engine Toggle:** Responsive split-screen interface with instant tab switching between Linear Algebra and Digital Logic modes.
- **Linear Algebra Module:**
  - 2D coordinate grid rendered on HTML5 Canvas.
  - Interactive $\hat{i}$ and $\hat{j}$ basis vector controls and matrix slider inputs ($a, b, c, d$).
  - Real-time grid transformation rendering and shaded determinant parallelogram.
  - Determinant calculation display with visual collapse notification when $\det = 0$.
- **Digital Logic Module:**
  - Interactive schematic for a Half-Adder circuit (XOR and AND gates with connecting traces).
  - Clickable 0/1 binary toggle inputs.
  - Signal propagation rendering (visual wire glow based on high/low states).
  - Synchronized Truth Table updating and highlighting the active combination row.
- **Micro-Challenge & Persistence:**
  - One interactive puzzle per engine (e.g., "Collapse the Grid", "Generate Carry Bit").
  - Supabase client integration storing completed challenge statuses and scores.
- **AI Problem Box (Concept Tutor):**
  - Natural language concept and problem query input validated strictly with Zod.
  - Serverless Edge Function `solve-problem` returning structured JSON only (never code).
  - Stepper walkthrough mapping multi-step visual proofs live onto existing Canvas engines.
  - Offline demo caching for instant responses and weak-topic tracking.

## Later
- 3D matrix transformations (3x3 determinant, eigenvalues, eigenvectors).
- Arbitrary drag-and-drop digital circuit designer with full logic gate library (NAND, NOR, XNOR, MUX, Flip-Flops).
- Full user authentication, historical analytics, and classroom leaderboards.

## Explicitly Cut
- **Unstructured / Code-Generating LLM Outputs:** Cut. The AI tutor is strictly constrained to return structured data matching a Zod schema; it never generates, evaluates, or returns executable code.
- **Complex Sequential Circuit Simulation (Clocks, Latches):** Cut to keep the PoC achievable in 2–4 hours while focusing on rock-solid combinational logic visualization.
