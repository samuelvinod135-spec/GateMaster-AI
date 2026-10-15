import React from 'react';
import { Matrix2x2 } from '../../types';
import { computeEigen2x2 } from '../../lib/eigen';
import { RotateCcw, AlertTriangle, Sparkles, Compass } from 'lucide-react';

interface LinearAlgebraControlsProps {
  matrix: Matrix2x2;
  updateMatrixCell: (cell: keyof Matrix2x2, val: number) => void;
  loadMatrixPreset: (preset: Matrix2x2) => void;
  resetMatrix: () => void;
  determinant: number;
  isCollapsed: boolean;
  showEigenvectors?: boolean;
  onToggleEigenvectors?: (show: boolean) => void;
}

export const LinearAlgebraControls: React.FC<LinearAlgebraControlsProps> = ({
  matrix,
  updateMatrixCell,
  loadMatrixPreset,
  resetMatrix,
  determinant,
  isCollapsed,
  showEigenvectors = false,
  onToggleEigenvectors,
}) => {
  const eigen = computeEigen2x2(matrix);
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
              className="cell-slider yellow-thumb"
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
              className="cell-slider yellow-thumb"
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
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Area Scale Factor:</span>
            <span className={`det-number ${isCollapsed ? 'collapsed' : ''}`}>
              {determinant.toFixed(2)}
            </span>
          </div>
        </div>

        {isCollapsed && (
          <div className="collapse-alert">
            <AlertTriangle size={15} />
            <span>Space collapsed into 1D line/point! Determinant = 0. No inverse matrix exists.</span>
          </div>
        )}
      </div>

      {/* Eigenvalues & Eigenvectors Diagnostic Card */}
      <div className="card">
        <div className="card-title">
          <span>Eigenvalues & Directions</span>
          {onToggleEigenvectors && (
            <button
              onClick={() => onToggleEigenvectors(!showEigenvectors)}
              className={`preset-btn ${showEigenvectors ? 'active' : ''}`}
              title="Toggle highlighted eigenvector lines on the canvas"
            >
              <Compass size={13} />
              <span>{showEigenvectors ? 'Hide Eigenvectors' : 'Show Eigenvectors'}</span>
            </button>
          )}
        </div>

        {showEigenvectors ? (
          <div className="eigen-diagnostic-box">
            {eigen.hasRealEigenvalues && eigen.v1 && eigen.v2 ? (
              <div className="eigen-values-grid">
                <div className="eigen-val-item sky">
                  <span className="eigen-label">Eigenvalue λ₁</span>
                  <span className="eigen-val">{eigen.lambda1}</span>
                  <span className="eigen-vec">Dir: [{eigen.v1.x.toFixed(2)}, {eigen.v1.y.toFixed(2)}]</span>
                </div>
                <div className="eigen-val-item yellow">
                  <span className="eigen-label">Eigenvalue λ₂</span>
                  <span className="eigen-val">{eigen.lambda2}</span>
                  <span className="eigen-vec">Dir: [{eigen.v2.x.toFixed(2)}, {eigen.v2.y.toFixed(2)}]</span>
                </div>
              </div>
            ) : (
              <div className="eigen-complex-alert">
                <AlertTriangle size={14} className="text-yellow" />
                <span>No real eigenvectors: this transformation rotates every direction.</span>
              </div>
            )}
          </div>
        ) : (
          <p className="eigen-prompt-hint">
            Click 'Show Eigenvectors' above to highlight span directions that scale without rotating.
          </p>
        )}
      </div>
    </div>
  );
};
