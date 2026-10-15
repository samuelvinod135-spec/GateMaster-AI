import React from 'react';
import { AppView, Matrix2x2, LogicInputs } from '../../types';
import { AIProblemBox } from '../ai/AIProblemBox';
import { Grid, Network, Trophy, Cpu, Zap, Cloud, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  setView: (view: AppView) => void;
  laSolved: boolean;
  dlSolved: boolean;
  totalScore: number;
  loadMatrixPreset: (preset: Matrix2x2) => void;
  setLogicInputsState: (inputs: LogicInputs) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setView,
  laSolved,
  dlSolved,
  totalScore,
  loadMatrixPreset,
  setLogicInputsState,
}) => {
  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-pill-badge">
          <Sparkles size={13} />
          <span>DEVPOST LEARN HACKATHON • BUILD WITH AI: BASICS</span>
        </div>
        
        <h1 className="hero-headline">
          GateMaster <span className="text-sky">AI</span>
        </h1>
        
        <p className="hero-description">
          An interactive dual-engine visual sandbox engineered for first-year students. Turn abstract linear algebra formulas and binary gate circuits into playable, tactile simulations running live at 60 FPS.
        </p>

        <div className="hero-cta-group">
          <button
            onClick={() => setView('linear-algebra')}
            className="hero-primary-btn"
          >
            <Grid size={18} />
            <span>Launch Linear Algebra</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => setView('digital-logic')}
            className="hero-secondary-btn"
          >
            <Network size={18} />
            <span>Launch Digital Logic</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="stats-ribbon">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">CHALLENGES MASTERED</span>
            <Trophy size={16} className="text-yellow" />
          </div>
          <div className="stat-value text-yellow">
            {totalScore}/2 <span className="stat-subtext">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">RENDER PIPELINE</span>
            <Zap size={16} className="text-sky" />
          </div>
          <div className="stat-value text-sky">
            60 FPS <span className="stat-subtext">Direct Canvas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">INPUT LATENCY</span>
            <Cpu size={16} className="text-sky" />
          </div>
          <div className="stat-value">
            &lt; 1 ms <span className="stat-subtext">Zero DOM lag</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">PERSISTENCE ARCHITECTURE</span>
            <Cloud size={16} className="text-yellow" />
          </div>
          <div className="stat-value text-yellow">
            Resilient <span className="stat-subtext">LocalStorage + Supabase</span>
          </div>
        </div>
      </section>

      {/* AI Problem Box: Structured Interactive Tutor */}
      <section className="ai-feature-section">
        <AIProblemBox
          currentView="dashboard"
          setView={setView}
          loadMatrixPreset={loadMatrixPreset}
          setLogicInputsState={setLogicInputsState}
        />
      </section>

      {/* Dual Engine Launch Cards */}
      <section className="launch-section">
        <h2 className="section-title">Select a Visual Engine</h2>
        <div className="launch-grid">
          {/* Card 1: Linear Algebra */}
          <div
            className="launch-card"
            onClick={() => setView('linear-algebra')}
            role="button"
            tabIndex={0}
          >
            <div className="launch-card-header">
              <div className="launch-icon-box sky">
                <Grid size={24} />
              </div>
              {laSolved ? (
                <span className="solved-badge">
                  <CheckCircle2 size={13} />
                  <span>CHALLENGE 1 SOLVED</span>
                </span>
              ) : (
                <span className="challenge-status-badge">CHALLENGE 1 PENDING</span>
              )}
            </div>

            <h3 className="launch-card-title">Linear Algebra Sandbox</h3>
            <p className="launch-card-desc">
              Real-time 2D Cartesian transformation engine. Drag 2x2 matrix values on precision sliders to warp coordinate space live, inspect basis vectors î (Sky Blue) & ĵ (Banana Yellow), and watch the determinant area compress until space collapses into a 1D line.
            </p>

            <div className="launch-card-footer">
              <span className="launch-btn-label sky">
                Open Matrix Sandbox <ArrowRight size={15} />
              </span>
            </div>
          </div>

          {/* Card 2: Digital Logic */}
          <div
            className="launch-card"
            onClick={() => setView('digital-logic')}
            role="button"
            tabIndex={0}
          >
            <div className="launch-card-header">
              <div className="launch-icon-box yellow">
                <Network size={24} />
              </div>
              {dlSolved ? (
                <span className="solved-badge">
                  <CheckCircle2 size={13} />
                  <span>CHALLENGE 2 SOLVED</span>
                </span>
              ) : (
                <span className="challenge-status-badge">CHALLENGE 2 PENDING</span>
              )}
            </div>

            <h3 className="launch-card-title">Digital Logic Circuit Sandbox</h3>
            <p className="launch-card-desc">
              Interactive Boolean circuit simulator featuring a live Half-Adder schematic. Flip physical binary 0/1 input toggles to watch neon voltage signals propagate through XOR and AND gates, observe dynamic LED states, and trace active rows on a synchronized Truth Table.
            </p>

            <div className="launch-card-footer">
              <span className="launch-btn-label yellow">
                Open Circuit Sandbox <ArrowRight size={15} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Highlights */}
      <section className="architecture-highlights">
        <h2 className="section-title">Built for Performance & Scale</h2>
        <div className="highlights-grid">
          <div className="highlight-item">
            <h4 className="highlight-title text-sky">Decoupled 60 FPS Render Pipeline</h4>
            <p className="highlight-desc">
              High-frequency canvas renders run directly in native requestAnimationFrame loops, completely decoupled from React state re-renders and network traffic for zero dropped frames.
            </p>
          </div>

          <div className="highlight-item">
            <h4 className="highlight-title text-yellow">Zero-Friction Guest Sync</h4>
            <p className="highlight-desc">
              Judges and students can play instantly with zero sign-up friction. Challenges auto-cache to local storage and sync in the background to Supabase via anonymous guest UUIDs.
            </p>
          </div>

          <div className="highlight-item">
            <h4 className="highlight-title text-sky">Tactile Mathematical Intuition</h4>
            <p className="highlight-desc">
              Eliminates the disconnect of static textbook ink by giving students immediate visual feedback when determinants hit zero or logic circuits produce carry bits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
