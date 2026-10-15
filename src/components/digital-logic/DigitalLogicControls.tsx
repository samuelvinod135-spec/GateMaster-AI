import React from 'react';
import { LogicInputs } from '../../types';
import { TruthTable } from './TruthTable';
import { RotateCcw, Power } from 'lucide-react';

interface DigitalLogicControlsProps {
  inputs: LogicInputs;
  toggleInput: (input: 'a' | 'b') => void;
  resetLogic: () => void;
}

export const DigitalLogicControls: React.FC<DigitalLogicControlsProps> = ({
  inputs,
  toggleInput,
  resetLogic,
}) => {
  return (
    <div className="controls-panel">
      {/* Input Toggle Switches Card */}
      <div className="card">
        <div className="card-title">
          <span>Binary Inputs</span>
          <button
            onClick={resetLogic}
            className="preset-btn"
            title="Reset inputs to 0"
          >
            <RotateCcw size={13} />
            <span>Reset (0, 0)</span>
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Click inputs below to toggle between LOW (0) and HIGH (1) voltage signals.
        </p>

        <div className="toggle-group">
          {/* Toggle A */}
          <div
            className={`logic-toggle-card ${inputs.a ? 'active' : ''}`}
            onClick={() => toggleInput('a')}
            role="button"
            tabIndex={0}
          >
            <span className="toggle-label">INPUT A</span>
            <div className="toggle-state-pill">
              {inputs.a ? '1' : '0'}
            </div>
            <span style={{ fontSize: '0.7rem', color: inputs.a ? '#38bdf8' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Power size={11} />
              <span>{inputs.a ? 'HIGH' : 'LOW'}</span>
            </span>
          </div>

          {/* Toggle B */}
          <div
            className={`logic-toggle-card ${inputs.b ? 'active' : ''}`}
            onClick={() => toggleInput('b')}
            role="button"
            tabIndex={0}
          >
            <span className="toggle-label">INPUT B</span>
            <div className="toggle-state-pill">
              {inputs.b ? '1' : '0'}
            </div>
            <span style={{ fontSize: '0.7rem', color: inputs.b ? '#38bdf8' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Power size={11} />
              <span>{inputs.b ? 'HIGH' : 'LOW'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Truth Table Card */}
      <div className="card">
        <div className="card-title">
          <span>Half-Adder Truth Table</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Active state combination is highlighted in real time:
        </p>
        <TruthTable inputs={inputs} />
      </div>
    </div>
  );
};
