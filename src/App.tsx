import React, { useCallback } from 'react';
import { useGateMasterStore } from './hooks/useGateMasterStore';
import { usePersistence } from './hooks/usePersistence';
import { Header } from './components/Header';
import { LinearAlgebraView } from './components/linear-algebra/LinearAlgebraView';
import { DigitalLogicView } from './components/digital-logic/DigitalLogicView';
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

      {/* Header with Navigation and Scores */}
      <Header
        mode={mode}
        setMode={setMode}
        totalScore={totalScore}
        syncStatus={syncStatus}
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
        <DigitalLogicView
          inputs={logicInputs}
          outputs={halfAdderOutputs}
          toggleInput={toggleLogicInput}
          resetLogic={resetLogic}
          isSolved={dlChallengeSolved}
        />
      )}
    </div>
  );
};

export default App;
