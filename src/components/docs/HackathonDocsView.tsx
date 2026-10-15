import React from 'react';
import { AppView } from '../../types';
import { Github, ExternalLink, CheckCircle2, Layers, Cpu, Database, Terminal, ShieldCheck, ArrowLeft } from 'lucide-react';

interface HackathonDocsViewProps {
  setView: (view: AppView) => void;
}

export const HackathonDocsView: React.FC<HackathonDocsViewProps> = ({ setView }) => {
  return (
    <div className="docs-container">
      {/* Header Bar */}
      <div className="docs-header">
        <button onClick={() => setView('dashboard')} className="back-btn">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <a
          href="https://github.com/samuelvinod135-spec/GateMaster-AI"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link-btn"
        >
          <Github size={16} />
          <span>View on GitHub</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Hero Overview */}
      <div className="docs-card">
        <div className="docs-pill">DEVPOST LEARN HACKATHON SUBMISSION</div>
        <h1 className="docs-title">GateMaster AI — Technical Architecture & Submission Guide</h1>
        <p className="docs-subtitle">
          An interactive Dual-Engine Visual Sandbox built to bridge the gap between abstract textbook mathematics and physical intuition for first-year engineering students.
        </p>
      </div>

      {/* Elevator Pitch & Problem */}
      <div className="docs-grid-2">
        <div className="docs-card">
          <h2 className="docs-card-heading text-sky">The Problem</h2>
          <p className="docs-text">
            First-year engineering students frequently hit a conceptual wall with Linear Algebra and Digital Logic. Existing tools fail them:
          </p>
          <ul className="docs-list">
            <li><strong>Symbolab / Photomath:</strong> Output static text and LaTeX steps with zero interactive manipulation.</li>
            <li><strong>Desmos / Geogebra:</strong> Require students to already know advanced formula syntax and manual coordinate plotting.</li>
            <li><strong>Explainer Videos:</strong> Passive MP4 videos where students cannot test &quot;what happens if I change this parameter live.&quot;</li>
          </ul>
        </div>

        <div className="docs-card">
          <h2 className="docs-card-heading text-yellow">The Solution: GateMaster AI</h2>
          <p className="docs-text">
            A real-time dual-engine sandbox where students interact physically with mathematical space and digital voltage flow:
          </p>
          <ul className="docs-list">
            <li><strong>Tactile 2D Warping:</strong> Drag 2x2 matrix values to watch space compress, inspect basis vectors î & ĵ, and observe 2D collapse into a 1D line when determinant = 0.</li>
            <li><strong>Dynamic Circuit Propagation:</strong> Toggle 0/1 binary inputs to send neon voltage signals through XOR and AND gates, lighting up Sum and Carry LEDs and matching rows on a live Truth Table.</li>
            <li><strong>Zero-Friction Gamification:</strong> Micro-challenges verify conceptual mastery with local caching and asynchronous Supabase cloud sync.</li>
          </ul>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="docs-card">
        <h2 className="docs-card-heading">Technology Stack & Implementation Choices</h2>
        <div className="stack-grid">
          <div className="stack-item">
            <div className="stack-icon-box text-sky">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="stack-name">React 18 + Vite (TypeScript)</h3>
              <p className="stack-desc">Sub-millisecond HMR, zero SSR overhead with HTML5 Canvas, and strict typing across matrix arrays and Boolean states.</p>
            </div>
          </div>

          <div className="stack-item">
            <div className="stack-icon-box text-yellow">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="stack-name">Native HTML5 Canvas 2D API</h3>
              <p className="stack-desc">High-DPI Retina scaled rendering at 60 FPS. Completely decoupled from React DOM reconciliation cycles for zero input lag.</p>
            </div>
          </div>

          <div className="stack-item">
            <div className="stack-icon-box text-sky">
              <Database size={20} />
            </div>
            <div>
              <h3 className="stack-name">Supabase + LocalStorage</h3>
              <p className="stack-desc">Event-driven persistence via anonymous guest UUIDs. Synchronous local storage ensures 100% functionality offline.</p>
            </div>
          </div>

          <div className="stack-item">
            <div className="stack-icon-box text-yellow">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="stack-name">Strict 3-Tone Design System</h3>
              <p className="stack-desc">Matte Black surfaces (#050811), Crisp White text, Sky Blue accents (#38bdf8), and Banana Yellow highlights (#facc15).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planning Journey Breakdown */}
      <div className="docs-card">
        <h2 className="docs-card-heading">Devpost Learn Spec-Driven Development Journey</h2>
        <div className="timeline-list">
          <div className="timeline-item">
            <div className="timeline-badge text-sky">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">1. Start — Learner Profile & Flipped Interaction</h3>
              <p className="timeline-desc">Established the project vision, identified the learner&apos;s goal (clean state management for high-frequency canvas visualizers synced to Supabase), and secured git tracking rules.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge text-yellow">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">2. Scope — The Unique Kernel & PoC Boundary</h3>
              <p className="timeline-desc">Carved out a focused 60-second proof of concept: 2x2 matrix warping with determinant collapse + Half-Adder schematic with reactive truth table row tracking.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge text-sky">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">3. PRD — Concrete Product Definition</h3>
              <p className="timeline-desc">Defined exact observable acceptance criteria, edge states (offline local storage fallback, anonymous sessions), and responsive layout boundaries.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge text-yellow">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">4. Spec — Technical Blueprint & Architecture</h3>
              <p className="timeline-desc">Engineered the decoupled state architecture: in-memory 60 FPS requestAnimationFrame canvas loops separated from event-driven Supabase cloud upserts.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge text-sky">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">5. Build — Slices, Verification & Commits</h3>
              <p className="timeline-desc">Executed 4 end-to-end working slices with mechanical verification, checkpoint pauses, and atomic git checkpoints leading to an interactive App Map.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-badge text-yellow">
              <CheckCircle2 size={16} />
            </div>
            <div className="timeline-content">
              <h3 className="timeline-title">6. Ship — Public Repository & Submission Readiness</h3>
              <p className="timeline-desc">Published the verified open-source repository to GitHub and prepared complete submission artifacts for judges and peer reviewers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Run Locally */}
      <div className="docs-card">
        <h2 className="docs-card-heading">
          <Terminal size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Local Setup & Verification Commands
        </h2>
        <div className="code-block">
          <code>
            git clone https://github.com/samuelvinod135-spec/GateMaster-AI.git<br />
            cd GateMaster-AI<br />
            npm install<br />
            npm run dev<br />
            # Open http://localhost:5173
          </code>
        </div>
      </div>
    </div>
  );
};
