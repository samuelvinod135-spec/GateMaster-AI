import React from 'react';
import { LogicInputs, HalfAdderOutputs } from '../../types';
import { DigitalLogicControls } from './DigitalLogicControls';
import { CircuitCanvas } from './CircuitCanvas';
import { ChallengeCard } from '../ChallengeCard';

interface DigitalLogicViewProps {
  inputs: LogicInputs;
  outputs: HalfAdderOutputs;
  toggleInput: (input: 'a' | 'b') => void;
  resetLogic: () => void;
  isSolved: boolean;
}

export const DigitalLogicView: React.FC<DigitalLogicViewProps> = ({
  inputs,
  outputs,
  toggleInput,
  resetLogic,
  isSolved,
}) => {
  return (
    <div className="main-content">
      {/* Left Controls & Challenge */}
      <div className="controls-panel">
        <ChallengeCard
          title="Challenge 2: Carry Bit Generation"
          description="Toggle inputs A and B so both are set to HIGH (1). Watch the AND gate activate and trigger the Carry LED!"
          isSolved={isSolved}
          scoreText="0/1 ⭐"
        />

        <DigitalLogicControls
          inputs={inputs}
          toggleInput={toggleInput}
          resetLogic={resetLogic}
        />
      </div>

      {/* Right Canvas */}
      <div className="canvas-panel">
        <CircuitCanvas inputs={inputs} outputs={outputs} />
      </div>
    </div>
  );
};
