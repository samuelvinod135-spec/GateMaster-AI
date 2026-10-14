import { Matrix2x2 } from '../types';

export function calculateDeterminant(m: Matrix2x2): number {
  const det = m.a * m.d - m.b * m.c;
  // Round to 3 decimal places to prevent floating point jitter (e.g. -0.0000000000000002)
  return Math.round(det * 1000) / 1000;
}

export function isDeterminantZero(det: number, tolerance = 0.05): boolean {
  return Math.abs(det) <= tolerance;
}

export function transformPoint(x: number, y: number, m: Matrix2x2): [number, number] {
  return [
    m.a * x + m.b * y,
    m.c * x + m.d * y,
  ];
}
