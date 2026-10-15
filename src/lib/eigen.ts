// 2x2 Eigenvalue and Eigenvector math module
import { Matrix2x2 } from '../types';

export interface Vector2D {
  x: number;
  y: number;
}

export interface EigenResult {
  hasRealEigenvalues: boolean;
  lambda1: number | null;
  lambda2: number | null;
  v1: Vector2D | null;
  v2: Vector2D | null;
  message?: string;
}

/**
 * Computes the real eigenvalues and normalized eigenvectors of a 2x2 matrix.
 * Matrix layout:
 * [ [a, b],
 *   [c, d] ]
 */
export function computeEigen2x2(matrix: Matrix2x2): EigenResult {
  const { a, b, c, d } = matrix;

  const trace = a + d;
  const det = a * d - b * c;
  const discriminant = trace * trace - 4 * det;

  // Numerical epsilon for floating point stability
  const EPSILON = 1e-6;

  // 1. Complex eigenvalues (e.g. pure rotation)
  if (discriminant < -EPSILON) {
    return {
      hasRealEigenvalues: false,
      lambda1: null,
      lambda2: null,
      v1: null,
      v2: null,
      message: 'No real eigenvectors: this transformation rotates every direction.',
    };
  }

  // Treat very small negative or near-zero discriminant as zero
  const safeDisc = Math.max(0, discriminant);
  const sqrtDisc = Math.sqrt(safeDisc);

  const lambda1 = Math.round(((trace + sqrtDisc) / 2) * 1000) / 1000;
  const lambda2 = Math.round(((trace - sqrtDisc) / 2) * 1000) / 1000;

  // Helper to find eigenvector for an eigenvalue
  const findEigenvector = (lambda: number): Vector2D => {
    // Equation: (a - lambda)*x + b*y = 0, c*x + (d - lambda)*y = 0
    let vx = 0;
    let vy = 0;

    if (Math.abs(c) > EPSILON) {
      vx = lambda - d;
      vy = c;
    } else if (Math.abs(b) > EPSILON) {
      vx = b;
      vy = lambda - a;
    } else {
      // Diagonal matrix
      if (Math.abs(a - lambda) <= EPSILON && Math.abs(d - lambda) <= EPSILON) {
        // Repeated eigenvalue in diagonal matrix (e.g. Identity or uniform scaling)
        vx = 1;
        vy = 0;
      } else if (Math.abs(a - lambda) <= EPSILON) {
        vx = 1;
        vy = 0;
      } else {
        vx = 0;
        vy = 1;
      }
    }

    // Normalize
    const len = Math.hypot(vx, vy);
    if (len < EPSILON) {
      return { x: 1, y: 0 };
    }
    return {
      x: Math.round((vx / len) * 1000) / 1000,
      y: Math.round((vy / len) * 1000) / 1000,
    };
  };

  const v1 = findEigenvector(lambda1);
  let v2 = findEigenvector(lambda2);

  // If diagonal with repeated eigenvalue (identity), provide orthogonal basis (0, 1)
  if (Math.abs(b) < EPSILON && Math.abs(c) < EPSILON && Math.abs(a - d) < EPSILON) {
    v2 = { x: 0, y: 1 };
  }

  return {
    hasRealEigenvalues: true,
    lambda1,
    lambda2,
    v1,
    v2,
  };
}
