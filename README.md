# GateMaster AI 🚀
### Interactive Linear Algebra & Digital Logic Dual-Engine Sandbox

GateMaster AI is an interactive educational sandbox built for first-year engineering students. Instead of passively reading textbook formulas or watching non-interactive video animations, students interact directly with mathematical and logical physics in real time at 60 FPS.

---

## ⚡ Core Engines & Features

### 1. Linear Algebra Engine
- **Real-Time 2D Matrix Warping:** Drag 2x2 matrix slider controls ($a, b, c, d$) to watch Cartesian coordinate space warp smoothly in real time.
- **Basis Vectors & Determinant:** Dynamic visual tracking of basis vectors $\hat{i}$ (Cyan) and $\hat{j}$ (Magenta) with coordinate readouts and shaded determinant parallelogram area.
- **Space Collapse Detection:** Visual indicator when $\det(M) = 0$, demonstrating that 2D space has collapsed into a 1D line/point and no matrix inverse exists.
- **Quick Presets:** Instant presets for Identity, Shear X, 2x Scale, 90° Rotation, and Zero Determinant.

### 2. Digital Logic Engine
- **Half-Adder Circuit Schematic:** Renders an engineering schematic with canonical XOR and AND logic gates.
- **Glowing Signal Flow:** Clicking 0/1 binary input toggles ($A, B$) triggers neon wire pulses demonstrating real-time Boolean voltage propagation.
- **Reactive Truth Table:** Synchronized truth table highlighting the active binary combination row in real time.
- **Sum & Carry Output LEDs:** Visual status indicators reacting dynamically to logic gate computations.

### 3. "Break It to Learn It" Micro-Challenges & Resilient Sync
- Interactive mini-challenges for both engines (Space Collapse and Carry Bit Generation).
- Decoupled state architecture: 60 FPS local render loop + event-driven persistence.
- Zero-friction instant guest access: Progress and scores cached locally in `localStorage` and synced asynchronously to Supabase cloud via an anonymous session UUID.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Rendering:** Native HTML5 Canvas 2D Context (High-DPI retina scaled)
- **Styling:** Vanilla CSS Custom Properties (Dark neon theme, *Inter* & *JetBrains Mono*)
- **Backend & Cloud:** `@supabase/supabase-js` (REST API upsert with anonymous guest sessions)
- **Icons & Effects:** `lucide-react`, `canvas-confetti`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gatemaster-ai.git

# Navigate into the project directory
cd gatemaster-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start exploring!

### (Optional) Configure Supabase Cloud Sync
To connect your own Supabase database, create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If omitted, GateMaster AI automatically falls back to browser `localStorage`, ensuring 100% of features remain functional offline.)*

---

## 📁 Repository Structure

```
├── devpost/               # Planning artifacts and architecture app map
│   ├── scope.md          # Approved core idea and PoC boundary
│   ├── prd.md            # Product requirements and observable criteria
│   ├── spec.md           # Technical blueprint and data flow
│   ├── checklist.md      # Verified build checklist
│   └── app-map.html      # Interactive standalone architectural guide
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ChallengeCard.tsx
│   │   ├── linear-algebra/  # VectorCanvas, LinearAlgebraControls, LinearAlgebraView
│   │   └── digital-logic/   # CircuitCanvas, DigitalLogicControls, TruthTable, DigitalLogicView
│   ├── hooks/
│   │   ├── useGateMasterStore.ts  # Centralized reactive in-memory state
│   │   └── usePersistence.ts     # LocalStorage caching & Supabase background sync
│   ├── lib/
│   │   ├── math.ts               # Matrix transformations & determinant math
│   │   └── supabase.ts           # Supabase client with graceful fallback
│   ├── types.ts                  # TypeScript data interfaces
│   ├── index.css                 # Theme tokens and neon glow styling
│   ├── App.tsx                   # Main layout container
│   └── main.tsx                  # React DOM entry point
├── package.json
└── vite.config.ts
```

---

## 📄 License
MIT License
