import React, { useState, useCallback } from 'react';
import { AppView } from './types';
import { useGateMasterStore } from './hooks/useGateMasterStore';
import { usePersistence } from './hooks/usePersistence';
import { Header } from './components/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { LinearAlgebraView } from './components/linear-algebra/LinearAlgebraView';
import { DigitalLogicView } from './components/digital-logic/DigitalLogicView';
import { HackathonDocsView } from './components/docs/HackathonDocsView';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>('dashboard');

  const {
    matrix,
    updateMatrixCell,
    loadMatrixPreset,
    resetMatrix,
    determinant,
    isCollapsed,
    logicInputs,
    toggleLogicInput,
    resetLogic,
    halfAdderOutputs,
    laChallengeSolved,
    dlChallengeSolved,
    setLaChallengeSolved,
    setDlChallengeSolved,
    totalScore,
    showCelebration,
    celebrationMessage,
  } = useGateMasterStore();

  const handleHydrate = useCallback((saved: { laSolved: boolean; dlSolved: boolean }) => {
    if (saved.laSolved) setLaChallengeSolved(true);
    if (saved.dlSolved) setDlChallengeSolved(true);
  }, [setLaChallengeSolved, setDlChallengeSolved]);

  const { syncStatus } = usePersistence(
    laChallengeSolved,
    dlChallengeSolved,
    handleHydrate
  );

  return (
    <div className="app-container">
      {/* Toast notification on challenge victory */}
      {showCelebration && (
        <div className="celebration-toast">
          <Sparkles size={18} />
          <span>{celebrationMessage}</span>
        </div>
      )}

      {/* Persistent Header */}
      <Header
        currentView={currentView}
        setView={setView}
        totalScore={totalScore}
        syncStatus={syncStatus}
      />

      {/* Main View Router */}
      <main className="view-content-wrapper">
        {currentView === 'dashboard' && (
          <DashboardView
            setView={setView}
            laSolved={laChallengeSolved}
            dlSolved={dlChallengeSolved}
            totalScore={totalScore}
          />
        )}

        {currentView === 'linear-algebra' && (
          <div className="sandbox-wrapper">
            <div className="sandbox-top-bar">
              <button onClick={() => setView('dashboard')} className="sub-back-btn">
                <ArrowLeft size={14} />
                <span>Dashboard</span>
              </button>
              <div className="sandbox-title-tag">
                <span>LINEAR ALGEBRA 2D VECTOR SANDBOX</span>
              </div>
            </div>
            <LinearAlgebraView
              matrix={matrix}
              updateMatrixCell={updateMatrixCell}
              loadMatrixPreset={loadMatrixPreset}
              resetMatrix={resetMatrix}
              determinant={determinant}
              isCollapsed={isCollapsed}
              isSolved={laChallengeSolved}
            />
          </div>
        )}

        {currentView === 'digital-logic' && (
          <div className="sandbox-wrapper">
            <div className="sandbox-top-bar">
              <button onClick={() => setView('dashboard')} className="sub-back-btn">
                <ArrowLeft size={14} />
                <span>Dashboard</span>
              </button>
              <div className="sandbox-title-tag yellow">
                <span>DIGITAL LOGIC HALF-ADDER CIRCUIT SANDBOX</span>
              </div>
            </div>
            <DigitalLogicView
              inputs={logicInputs}
              outputs={halfAdderOutputs}
              toggleInput={toggleLogicInput}
              resetLogic={resetLogic}
              isSolved={dlChallengeSolved}
            />
          </div>
        )}

        {currentView === 'docs' && (
          <HackathonDocsView setView={setView} />
        )}
      </main>
    </div>
  );
};

export default App;
