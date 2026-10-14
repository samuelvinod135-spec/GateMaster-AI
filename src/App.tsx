import React from 'react';
import { useGateMasterStore } from './hooks/useGateMasterStore';
import { Header } from './components/Header';
import { LinearAlgebraView } from './components/linear-algebra/LinearAlgebraView';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const {
    mode,
    setMode,
    matrix,
    updateMatrixCell,
    loadMatrixPreset,
    resetMatrix,
    determinant,
    isCollapsed,
    laChallengeSolved,
    totalScore,
    showCelebration,
    celebrationMessage,
  } = useGateMasterStore();

  return (
    <div className="app-container">
      {/* Toast notification on challenge victory */}
      {showCelebration && (
        <div className="celebration-toast">
          <Sparkles size={18} />
          <span>{celebrationMessage}</span>
        </div>
      )}

      {/* Header with Navigation and Scores */}
      <Header
        mode={mode}
        setMode={setMode}
        totalScore={totalScore}
        syncStatus="local_only"
      />

      {/* Main Views */}
      {mode === 'linear-algebra' ? (
        <LinearAlgebraView
          matrix={matrix}
          updateMatrixCell={updateMatrixCell}
          loadMatrixPreset={loadMatrixPreset}
          resetMatrix={resetMatrix}
          determinant={determinant}
          isCollapsed={isCollapsed}
          isSolved={laChallengeSolved}
        />
      ) : (
        <div className="main-content">
          <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--cyan-primary)' }}>Digital Logic Mode</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Half-Adder Schematic and interactive Truth Table will be activated in Slice 3!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
