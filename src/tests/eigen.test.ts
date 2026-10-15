import { describe, it, expect } from 'vitest';
import { computeEigen2x2 } from '../lib/eigen';

describe('2x2 Eigenvalue and Eigenvector Computations', () => {
  it('computes eigenvalues and eigenvectors for Identity matrix', () => {
    const identity = { a: 1, b: 0, c: 0, d: 1 };
    const res = computeEigen2x2(identity);

    expect(res.hasRealEigenvalues).toBe(true);
    expect(res.lambda1).toBe(1);
    expect(res.lambda2).toBe(1);
    expect(res.v1).toEqual({ x: 1, y: 0 });
    expect(res.v2).toEqual({ x: 0, y: 1 });
  });

  it('computes eigenvalues and eigenvectors for Non-uniform Scaling matrix', () => {
    const scaling = { a: 2, b: 0, c: 0, d: 3 };
    const res = computeEigen2x2(scaling);

    expect(res.hasRealEigenvalues).toBe(true);
    expect(res.lambda1).toBe(3);
    expect(res.lambda2).toBe(2);
    expect(res.v1).toEqual({ x: 0, y: 1 });
    expect(res.v2).toEqual({ x: 1, y: 0 });
  });

  it('computes eigenvalues and eigenvectors for Horizontal Shear matrix', () => {
    const shear = { a: 1, b: 1, c: 0, d: 1 };
    const res = computeEigen2x2(shear);

    expect(res.hasRealEigenvalues).toBe(true);
    expect(res.lambda1).toBe(1);
    expect(res.lambda2).toBe(1);
    // Eigenvector points horizontally along x-axis
    expect(res.v1?.y).toBe(0);
    expect(Math.abs(res.v1?.x || 0)).toBe(1);
  });

  it('correctly detects complex eigenvalues for pure 90° rotation and returns message', () => {
    const rotation = { a: 0, b: -1, c: 1, d: 0 };
    const res = computeEigen2x2(rotation);

    expect(res.hasRealEigenvalues).toBe(false);
    expect(res.lambda1).toBeNull();
    expect(res.lambda2).toBeNull();
    expect(res.v1).toBeNull();
    expect(res.v2).toBeNull();
    expect(res.message).toBe('No real eigenvectors: this transformation rotates every direction.');
  });

  it('computes eigenvalues and eigenvectors for Singular (det=0) matrix', () => {
    const singular = { a: 2, b: 1, c: 2, d: 1 };
    const res = computeEigen2x2(singular);

    expect(res.hasRealEigenvalues).toBe(true);
    expect(res.lambda1).toBe(3);
    expect(res.lambda2).toBe(0);
    expect(res.v1).toBeTruthy();
    expect(res.v2).toBeTruthy();
  });
});
