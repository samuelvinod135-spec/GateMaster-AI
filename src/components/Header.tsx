import React from 'react';
import { AppView, SyncStatus } from '../types';
import { Network, Grid, Trophy, Cloud, HardDrive, Home, FileCode } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  totalScore: number;
  syncStatus: SyncStatus;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setView,
  totalScore,
  syncStatus,
}) => {
  return (
    <header className="app-header">
      {/* Brand Section */}
      <div
        className="brand-section"
        onClick={() => setView('dashboard')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
      >
        <div className="brand-icon-box">
          <Network size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-title">GateMaster AI</span>
            <span className="brand-tag">Dual Sandbox</span>
          </div>
        </div>
      </div>

      {/* View Navigation Tabs */}
      <nav className="mode-tabs">
        <button
          className={`mode-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          <Home size={15} />
          <span>Dashboard</span>
        </button>

        <button
          className={`mode-tab-btn ${currentView === 'linear-algebra' ? 'active' : ''}`}
          onClick={() => setView('linear-algebra')}
        >
          <Grid size={15} />
          <span>Linear Algebra</span>
        </button>

        <button
          className={`mode-tab-btn ${currentView === 'digital-logic' ? 'active' : ''}`}
          onClick={() => setView('digital-logic')}
        >
          <Network size={15} />
          <span>Digital Logic</span>
        </button>

        <button
          className={`mode-tab-btn ${currentView === 'docs' ? 'active' : ''}`}
          onClick={() => setView('docs')}
        >
          <FileCode size={15} />
          <span>Architecture &amp; Docs</span>
        </button>
      </nav>

      {/* Header Right Badges */}
      <div className="header-badges">
        <div
          className="score-badge"
          title="Completed Challenges"
          onClick={() => setView('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <Trophy size={14} />
          <span>{totalScore}/2 ⭐</span>
        </div>

        <div
          className={`sync-status-badge ${syncStatus === 'local_only' ? 'local' : ''}`}
          title={syncStatus === 'synced' ? 'Progress synced to Supabase cloud' : 'Offline / Saved locally in browser'}
        >
          {syncStatus === 'synced' ? (
            <>
              <Cloud size={13} />
              <span>Cloud Synced</span>
            </>
          ) : (
            <>
              <HardDrive size={13} />
              <span>Saved Locally</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
