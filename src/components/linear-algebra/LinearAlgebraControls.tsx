import React from 'react';
import { Matrix2x2 } from '../../types';
import { RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface LinearAlgebraControlsProps {
  matrix: Matrix2x2;
  updateMatrixCell: (cell: keyof Matrix2x2, val: number) => void;
  loadMatrixPreset: (preset: Matrix2x2) => void;
  resetMatrix: () => void;
  determinant: number;
  isCollapsed: boolean;
}

export const LinearAlgebraControls: React.FC<LinearAlgebraControlsProps> = ({
  matrix,
  updateMatrixCell,
  loadMatrixPreset,
  resetMatrix,
  determinant,
  isCollapsed,
}) => {
  return (
    <div className="controls-panel">
      {/* 2x2 Matrix Controls Card */}
      <div className="card">
        <div className="card-title">
          <span>Transformation Matrix M</span>
          <button
            onClick={resetMatrix}
            className="preset-btn"
            title="Reset to Identity Matrix"
          >
            <RotateCcw size={13} />
            <span>Identity</span>
          </button>
        </div>

        {/* 2x2 Matrix Input Grid */}
        <div className="matrix-grid">
          {/* Cell a */}
          <div className="matrix-cell">
            <div className="cell-label i-hat">
              <span>a (î.x)</span>
              <span>{matrix.a.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={matrix.a}
              onChange={(e) => updateMatrixCell('a', parseFloat(e.target.value))}
              className="cell-slider"
            />
          </div>

          {/* Cell b */}
          <div className="matrix-cell">
            <div className="cell-label j-hat">
              <span>b (ĵ.x)</span>
              <span>{matrix.b.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={matrix.b}
              onChange={(e) => updateMatrixCell('b', parseFloat(e.target.value))}
              className="cell-slider magenta-thumb"
            />
          </div>

          {/* Cell c */}
          <div className="matrix-cell">
            <div className="cell-label i-hat">
              <span>c (î.y)</span>
              <span>{matrix.c.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={matrix.c}
              onChange={(e) => updateMatrixCell('c', parseFloat(e.target.value))}
              className="cell-slider"
            />
          </div>

          {/* Cell d */}
          <div className="matrix-cell">
            <div className="cell-label j-hat">
              <span>d (ĵ.y)</span>
              <span>{matrix.d.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-4"
              max="4"
              step="0.1"
              value={matrix.d}
              onChange={(e) => updateMatrixCell('d', parseFloat(e.target.value))}
              className="cell-slider magenta-thumb"
            />
          </div>
        </div>

        {/* Presets Group */}
        <div className="presets-group">
          <button
            className="preset-btn"
            onClick={() => loadMatrixPreset({ a: 1, b: 1.5, c: 0, d: 1 })}
          >
            <Sparkles size={12} />
            <span>Shear X</span>
          </button>
          <button
            className="preset-btn"
            onClick={() => loadMatrixPreset({ a: 2, b: 0, c: 0, d: 2 })}
          >
            <Sparkles size={12} />
            <span>2x Scale</span>
          </button>
          <button
            className="preset-btn"
            onClick={() => loadMatrixPreset({ a: 0, b: -1, c: 1, d: 0 })}
          >
            <Sparkles size={12} />
            <span>90° Rotate</span>
          </button>
          <button
            className="preset-btn"
            onClick={() => loadMatrixPreset({ a: 2, b: 2, c: 1, d: 1 })}
          >
            <Sparkles size={12} />
            <span>Zero Det</span>
          </button>
        </div>
      </div>

      {/* Determinant & Calculation Card */}
      <div className="card">
        <div className="card-title">
          <span>Determinant Area Factor</span>
        </div>

        <div className="determinant-card">
          <div className="formula-line">
            det(M) = ad - bc
          </div>
          <div className="formula-line" style={{ color: 'var(--text-muted)' }}>
            = ({matrix.a.toFixed(1)} × {matrix.d.toFixed(1)}) - ({matrix.b.toFixed(1)} × {matrix.c.toFixed(1)})
          </div>
          <div className="det-value-display">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Area Factor:</span>
            <span className={`det-number ${isCollapsed ? 'collapsed' : ''}`}>
              {determinant.toFixed(2)}
            </span>
          </div>
        </div>

        {isCollapsed && (
          <div className="collapse-alert">
            <AlertTriangle size={16} />
            <span>Space collapsed into 1D line/point! Determinant = 0. No inverse matrix exists.</span>
          </div>
        )}
      </div>
    </div>
  );
};
