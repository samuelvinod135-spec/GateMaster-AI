import React from 'react';
import { useGateMasterStore } from './hooks/useGateMasterStore';
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
