---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Project Scaffold & Interactive Linear Algebra Vector Canvas**
  Becomes usable: A running Vite + React + TypeScript app with high-contrast theme tokens, header, and the 2D Linear Algebra canvas where dragging matrix sliders ($a, b, c, d$) warps the coordinate grid, basis vectors ($\hat{i}, \hat{j}$), and determinant parallelogram in real time at 60 FPS.
  Why now: Delivers the visual core and unique kernel immediately; establishes the high-DPI canvas render loop and reactive slider store so all subsequent mechanics have a working foundation.
  PRD ref: `prd.md > Features and Behavior > 1. Linear Algebra Engine`
  Spec ref: `spec.md > Components > 2. LinearAlgebraView`, `spec.md > Components > 4. VectorCanvas`
  Build: Initialize Vite + React + TypeScript scaffold, install dependencies (`lucide-react`, `@supabase/supabase-js`), configure CSS design tokens and Google Fonts (*Inter*, *JetBrains Mono*), build `useGateMasterStore`, `VectorCanvas`, and `LinearAlgebraControls` with matrix presets.
  Verify (mechanical): Run `npm run build` and launch dev server with zero TypeScript or console errors; verify that updating matrix values alters rendered canvas pixels and computed determinant readout.
  Learner check: Open `http://localhost:5173`, drag the matrix sliders, and verify that the grid warps smoothly with cyan and magenta basis vectors and shaded determinant area.
  Commit: `feat: scaffold GateMaster AI and implement interactive 2D linear algebra canvas`

- [x] **2. Space Collapse Detection & Linear Algebra Micro-Challenge**
  Becomes usable: When the matrix determinant equals 0, the canvas displays a prominent "Space Collapsed" warning, and the "Break It to Learn It" Challenge 1 completes with an animated sliding celebration banner and sound/visual pulse.
  Why now: Completes the mathematical intuition loop of Linear Algebra (showing what happens when dimensionality is lost) and establishes the challenge evaluation system.
  PRD ref: `prd.md > Features and Behavior > 1. Linear Algebra Engine`, `prd.md > Features and Behavior > 3. "Break It to Learn It" Micro-Challenges`
  Spec ref: `spec.md > Components > 9. ChallengeCard`, `spec.md > lib/math.ts`
  Build: Implement numerical tolerance check ($|ad - bc| < 0.001$), trigger space collapse state, build `ChallengeCard` with slide-in animation and score badge (`1/2 ⭐`).
  Verify (mechanical): Programmatically test matrix with zero determinant (e.g. $[[2, 2], [1, 1]]$); verify collapse status flag is raised and challenge state updates to completed.
  Learner check: Click the "Zero Det" preset or drag sliders so the determinant hits 0; verify the visual collapse indicator lights up and the challenge solved banner slides in.
  Commit: `feat: add matrix collapse detection and linear algebra micro-challenge`

- [x] **3. Digital Logic Engine: Half-Adder Schematic & Live Truth Table**
  Becomes usable: Top navigation switches seamlessly to Digital Logic Mode; renders an interactive Half-Adder schematic (XOR and AND gates) where clicking inputs $A$ and $B$ toggles signals, lights up glowing neon wire traces and gates, activates Sum/Carry LEDs, and highlights the matching Truth Table row.
  Why now: Completes the second half of the dual-engine vision; proves interactive Boolean signal propagation side-by-side with matrix math.
  PRD ref: `prd.md > Features and Behavior > 2. Digital Logic Engine`
  Spec ref: `spec.md > Components > 5. DigitalLogicView`, `spec.md > Components > 7. CircuitCanvas`, `spec.md > Components > 8. TruthTable`
  Build: Implement `CircuitCanvas` drawing standard XOR and AND logic symbols, wire paths, neon glow filters, and output LED indicators. Implement `DigitalLogicControls` and `TruthTable` highlighting the active binary row.
  Verify (mechanical): Toggle all 4 input combinations ($00, 01, 10, 11$) and verify output values: $(0,1) \to Sum=1, Carry=0$; $(1,1) \to Sum=0, Carry=1$; confirm truth table active row matches current input state.
  Learner check: Switch to Digital Logic mode, click toggle $A$ and toggle $B$, and watch the electricity glow through the wires and gates into the Sum and Carry LEDs.
  Commit: `feat: implement interactive half-adder circuit canvas and reactive truth table`

- [x] **4. Digital Logic Challenge, Local Storage & Supabase Cloud Sync**
  Becomes usable: Solving Challenge 2 (Carry bit triggered) awards the second badge (`2/2 Mastered ⭐`). All challenge scores persist across browser reloads via `localStorage` and sync asynchronously to Supabase under an anonymous guest session UUID with an online/offline status badge.
  Why now: Completes the full learner journey, persistence architecture, and desired learning goal (high-frequency canvas decoupled from event-driven cloud sync).
  PRD ref: `prd.md > Features and Behavior > 4. Zero-Friction Storage & Supabase Sync`
  Spec ref: `spec.md > lib/supabase.ts`, `spec.md > hooks/usePersistence.ts`
  Build: Implement `usePersistence` hook handling anonymous session UUID generation, `localStorage` caching, and background Supabase upsert calls. Add sync indicator badge in `Header`.
  Verify (mechanical): Verify that completing both challenges saves to `localStorage`; simulate network drop to verify silent offline fallback; test Supabase client initialization.
  Learner check: Solve both challenges, reload the browser tab, and verify that your scores and completed badges are preserved immediately.
  Commit: `feat: add digital logic challenge, local storage persistence, and Supabase sync`

## Hands-on Checkpoints

- [x] Early usable behavior explored — After Slice 1 (Linear Algebra Canvas interactive)
- [x] Final kick-the-tires exploration and feedback completed — After Slice 4 (Complete Dual-Engine Sandbox)

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Verified 60 FPS HTML5 Canvas rendering for 2D matrix coordinate transformations and Half-Adder Boolean circuit with animated neon wire flow. Decoupled high-frequency requestAnimationFrame render loops from event-driven Supabase cloud upserts and local storage caching.
Route and stops: src/hooks/useGateMasterStore.ts (state store) -> src/components/linear-algebra/VectorCanvas.tsx & src/components/digital-logic/CircuitCanvas.tsx (canvas renderers) -> src/hooks/usePersistence.ts (resilient storage).
Edit outcome: Incorporated canvas-confetti celebratory trigger on challenge solves; verified zero errors on build.
Reflection: Separating high-frequency render loops from persistence milestones prevents frame drops and network rate-limiting.
Activity mode: live app and editor

## Revisions


