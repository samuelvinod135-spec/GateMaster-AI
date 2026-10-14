import React from 'react';
import { Matrix2x2 } from '../../types';
import { LinearAlgebraControls } from './LinearAlgebraControls';
import { VectorCanvas } from './VectorCanvas';
import { ChallengeCard } from '../ChallengeCard';

interface LinearAlgebraViewProps {
  matrix: Matrix2x2;
  updateMatrixCell: (cell: keyof Matrix2x2, val: number) => void;
  loadMatrixPreset: (preset: Matrix2x2) => void;
  resetMatrix: () => void;
  determinant: number;
  isCollapsed: boolean;
  isSolved: boolean;
}

export const LinearAlgebraView: React.FC<LinearAlgebraViewProps> = ({
  matrix,
  updateMatrixCell,
  loadMatrixPreset,
  resetMatrix,
  determinant,
  isCollapsed,
  isSolved,
}) => {
  return (
    <div className="main-content">
      {/* Left Controls & Challenge */}
      <div className="controls-panel">
        <ChallengeCard
          title="Challenge 1: Space Collapse"
          description="Drag matrix sliders or select 'Zero Det' until determinant = 0. Watch 2D space compress into a 1D line!"
          isSolved={isSolved}
          scoreText="0/1 ⭐"
        />

        <LinearAlgebraControls
          matrix={matrix}
          updateMatrixCell={updateMatrixCell}
          loadMatrixPreset={loadMatrixPreset}
          resetMatrix={resetMatrix}
          determinant={determinant}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Right Canvas */}
      <div className="canvas-panel">
        <VectorCanvas matrix={matrix} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};
