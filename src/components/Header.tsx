import React from 'react';
import { EngineMode, SyncStatus } from '../types';
import { Network, Grid, Trophy, Cloud, HardDrive, Check } from 'lucide-react';

interface HeaderProps {
  mode: EngineMode;
  setMode: (mode: EngineMode) => void;
  totalScore: number;
  syncStatus: SyncStatus;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  totalScore,
  syncStatus,
}) => {
  return (
    <header className="app-header">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-icon-box">
          <Network size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="brand-title">GateMaster AI</h1>
            <span className="brand-tag">Dual Sandbox</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <nav className="mode-tabs">
        <button
          className={`mode-tab-btn ${mode === 'linear-algebra' ? 'active' : ''}`}
          onClick={() => setMode('linear-algebra')}
        >
          <Grid size={16} />
          <span>Linear Algebra</span>
        </button>
        <button
          className={`mode-tab-btn ${mode === 'digital-logic' ? 'active' : ''}`}
          onClick={() => setMode('digital-logic')}
        >
          <Network size={16} />
          <span>Digital Logic</span>
        </button>
      </nav>

      {/* Header Right Badges */}
      <div className="header-badges">
        <div className="score-badge" title="Completed Challenges">
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
