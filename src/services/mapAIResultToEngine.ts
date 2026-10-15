import { Matrix2x2, LogicInputs } from '../types';
import { MatrixVisual, CircuitVisual, VisualConfig } from '../types/ai';

export const MATRIX_MIN_SAFE = -4.0;
export const MATRIX_MAX_SAFE = 4.0;

export interface MappedMatrixResult {
  matrix: Matrix2x2;
  wasClamped: boolean;
  rawMatrix: [[number, number], [number, number]];
}

export interface MappedCircuitResult {
  inputs: LogicInputs;
  highlightGate: 'XOR' | 'AND' | null;
}

export interface MappedEngineState {
  type: 'matrix' | 'circuit' | 'none';
  matrix?: Matrix2x2;
  logicInputs?: LogicInputs;
  highlightGate?: 'XOR' | 'AND' | null;
  wasClamped?: boolean;
}

/**
 * Pure clamp function for safe matrix values.
 * Keeps coordinates within the visible bounds of the HTML5 Canvas viewport.
 */
export function clampMatrixValue(val: number, min = MATRIX_MIN_SAFE, max = MATRIX_MAX_SAFE): number {
  if (Number.isNaN(val)) {
    return 0;
  }
  const clamped = Math.max(min, Math.min(max, val));
  // Round to 2 decimal places for clean floating-point display
  return Math.round(clamped * 100) / 100;
}

/**
 * Pure mapping from AI-generated MatrixVisual to engine Matrix2x2 state.
 * Schema layout:
 * [ [a, b],
 *   [c, d] ]
 * where a = î.x, b = ĵ.x, c = î.y, d = ĵ.y
 */
export function mapMatrixVisualToEngine(visual: MatrixVisual): MappedMatrixResult {
  const [[aRaw, bRaw], [cRaw, dRaw]] = visual.matrix;

  const a = clampMatrixValue(aRaw);
  const b = clampMatrixValue(bRaw);
  const c = clampMatrixValue(cRaw);
  const d = clampMatrixValue(dRaw);

  const wasClamped =
    a !== aRaw ||
    b !== bRaw ||
    c !== cRaw ||
    d !== dRaw;

  return {
    matrix: { a, b, c, d },
    wasClamped,
    rawMatrix: visual.matrix,
  };
}

/**
 * Pure mapping from AI-generated CircuitVisual to engine LogicInputs state.
 * Inputs schema: { A: 0 | 1, B: 0 | 1 }
 * Engine inputs: { a: boolean, b: boolean }
 */
export function mapCircuitVisualToEngine(visual: CircuitVisual): MappedCircuitResult {
  return {
    inputs: {
      a: visual.inputs.A === 1,
      b: visual.inputs.B === 1,
    },
    highlightGate: visual.highlight_gate,
  };
}

/**
 * Unified pure dispatcher to convert any VisualConfig into engine props.
 */
export function mapVisualConfigToEngine(visual: VisualConfig | null): MappedEngineState {
  if (!visual) {
    return { type: 'none' };
  }

  if (visual.type === 'matrix') {
    const mapped = mapMatrixVisualToEngine(visual);
    return {
      type: 'matrix',
      matrix: mapped.matrix,
      wasClamped: mapped.wasClamped,
    };
  }

  if (visual.type === 'circuit') {
    const mapped = mapCircuitVisualToEngine(visual);
    return {
      type: 'circuit',
      logicInputs: mapped.inputs,
      highlightGate: mapped.highlightGate,
    };
  }

  return { type: 'none' };
}
