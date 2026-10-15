import React from 'react';
import { LogicInputs } from '../../types';

interface TruthTableProps {
  inputs: LogicInputs;
}

const TRUTH_TABLE_ROWS = [
  { a: false, b: false, sum: 0, carry: 0 },
  { a: false, b: true, sum: 1, carry: 0 },
  { a: true, b: false, sum: 1, carry: 0 },
  { a: true, b: true, sum: 0, carry: 1 },
];

export const TruthTable: React.FC<TruthTableProps> = ({ inputs }) => {
  return (
    <div className="truth-table-container">
      <table className="truth-table">
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th style={{ color: '#38bdf8' }}>Sum (A ⊕ B)</th>
            <th style={{ color: '#facc15' }}>Carry (A · B)</th>
          </tr>
        </thead>
        <tbody>
          {TRUTH_TABLE_ROWS.map((row, idx) => {
            const isActive = inputs.a === row.a && inputs.b === row.b;
            return (
              <tr key={idx} className={isActive ? 'active-row' : ''}>
                <td>{row.a ? 1 : 0}</td>
                <td>{row.b ? 1 : 0}</td>
                <td className={row.sum === 1 ? 'out-sky' : ''}>
                  {row.sum}
                </td>
                <td className={row.carry === 1 ? 'out-yellow' : ''}>
                  {row.carry}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
