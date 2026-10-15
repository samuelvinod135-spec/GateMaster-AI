import { describe, it, expect } from 'vitest';
import {
  AIProblemResponseSchema,
  MatrixVisualSchema,
  CircuitVisualSchema,
} from '../types/ai';
import {
  mapMatrixVisualToEngine,
  mapCircuitVisualToEngine,
  mapVisualConfigToEngine,
  clampMatrixValue,
} from '../services/mapAIResultToEngine';
import { getFallbackResponseForPrompt } from '../services/aiFallbackData';
import { computeWeakTopics, StoredQueryRecord } from '../services/aiProblemService';

describe('AI Problem Box - Zod Schemas', () => {
  it('validates a valid Linear Algebra response with multi-step matrices', () => {
    const validData = {
      topic: 'linear_algebra',
      concept_tags: ['rotation', 'shear'],
      title: 'Rotate then Shear',
      steps: [
        {
          title: 'Step 1: Rotate',
          explanation: 'Rotate by 90 degrees.',
          visual: {
            type: 'matrix',
            matrix: [
              [0, -1],
              [1, 0],
            ],
            show_determinant: true,
          },
        },
        {
          title: 'Step 2: Shear',
          explanation: 'Shear horizontally.',
          visual: {
            type: 'matrix',
            matrix: [
              [1, 1],
              [0, 1],
            ],
            show_determinant: true,
          },
        },
      ],
      final_visual: {
        type: 'matrix',
        matrix: [
          [1, -1],
          [1, 0],
        ],
        show_determinant: true,
      },
      unsupported_reason: null,
    };

    const result = AIProblemResponseSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates a valid Digital Logic response with Half-Adder circuit', () => {
    const validCircuit = {
      topic: 'digital_logic',
      concept_tags: ['half_adder', 'xor', 'and'],
      title: 'Design Half Adder',
      steps: [
        {
          title: 'XOR Sum Step',
          explanation: 'Produces sum bit.',
          visual: {
            type: 'circuit',
            circuit: 'half_adder',
            inputs: { A: 1, B: 0 },
            highlight_gate: 'XOR',
          },
        },
      ],
      final_visual: {
        type: 'circuit',
        circuit: 'half_adder',
        inputs: { A: 1, B: 1 },
        highlight_gate: null,
      },
      unsupported_reason: null,
    };

    const result = AIProblemResponseSchema.safeParse(validCircuit);
    expect(result.success).toBe(true);
  });

  it('validates an unsupported topic with a friendly reason', () => {
    const unsupported = {
      topic: 'unsupported',
      concept_tags: ['calculus'],
      title: 'Calculus Query',
      steps: [
        {
          title: 'Out of Scope',
          explanation: 'Calculus is not supported.',
          visual: null,
        },
      ],
      final_visual: null,
      unsupported_reason: 'Only 2D matrices and Half-Adder circuits are supported.',
    };

    const result = AIProblemResponseSchema.safeParse(unsupported);
    expect(result.success).toBe(true);
  });

  it('rejects invalid matrix shapes (e.g. 3x3 or 1D array)', () => {
    const invalidMatrix = {
      type: 'matrix',
      matrix: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      show_determinant: true,
    };

    const result = MatrixVisualSchema.safeParse(invalidMatrix);
    expect(result.success).toBe(false);
  });

  it('rejects digital logic input values other than 0 or 1', () => {
    const invalidCircuit = {
      type: 'circuit',
      circuit: 'half_adder',
      inputs: { A: 2, B: 0 }, // 2 is invalid
      highlight_gate: null,
    };

    const result = CircuitVisualSchema.safeParse(invalidCircuit);
    expect(result.success).toBe(false);
  });

  it('rejects response missing required steps array', () => {
    const missingSteps = {
      topic: 'linear_algebra',
      concept_tags: ['matrix'],
      title: 'Test',
      steps: [], // empty steps array is disallowed
      final_visual: null,
      unsupported_reason: null,
    };

    const result = AIProblemResponseSchema.safeParse(missingSteps);
    expect(result.success).toBe(false);
  });
});

describe('Mapping Layer - mapAIResultToEngine', () => {
  it('correctly maps MatrixVisual to engine Matrix2x2', () => {
    const visual = {
      type: 'matrix' as const,
      matrix: [
        [2, -1],
        [0.5, 3],
      ] as [[number, number], [number, number]],
      show_determinant: true,
    };

    const mapped = mapMatrixVisualToEngine(visual);
    expect(mapped.matrix).toEqual({ a: 2, b: -1, c: 0.5, d: 3 });
    expect(mapped.wasClamped).toBe(false);
  });

  it('clamps extreme out-of-range matrix values to [-4, 4]', () => {
    const extremeVisual = {
      type: 'matrix' as const,
      matrix: [
        [25, -50],
        [0, 10],
      ] as [[number, number], [number, number]],
      show_determinant: true,
    };

    const mapped = mapMatrixVisualToEngine(extremeVisual);
    expect(mapped.matrix.a).toBe(4.0);
    expect(mapped.matrix.b).toBe(-4.0);
    expect(mapped.matrix.c).toBe(0.0);
    expect(mapped.matrix.d).toBe(4.0);
    expect(mapped.wasClamped).toBe(true);
  });

  it('handles NaN and non-finite numbers safely', () => {
    expect(clampMatrixValue(NaN)).toBe(0);
    expect(clampMatrixValue(Infinity)).toBe(4);
    expect(clampMatrixValue(-Infinity)).toBe(-4);
  });

  it('correctly maps CircuitVisual to engine LogicInputs', () => {
    const circuitA1B0 = {
      type: 'circuit' as const,
      circuit: 'half_adder' as const,
      inputs: { A: 1 as const, B: 0 as const },
      highlight_gate: 'XOR' as const,
    };

    const mapped = mapCircuitVisualToEngine(circuitA1B0);
    expect(mapped.inputs).toEqual({ a: true, b: false });
    expect(mapped.highlightGate).toBe('XOR');

    const circuitA1B1 = {
      type: 'circuit' as const,
      circuit: 'half_adder' as const,
      inputs: { A: 1 as const, B: 1 as const },
      highlight_gate: 'AND' as const,
    };

    const mapped2 = mapCircuitVisualToEngine(circuitA1B1);
    expect(mapped2.inputs).toEqual({ a: true, b: true });
    expect(mapped2.highlightGate).toBe('AND');
  });

  it('unified mapVisualConfigToEngine handles null and unsupported visuals', () => {
    expect(mapVisualConfigToEngine(null)).toEqual({ type: 'none' });
  });
});

describe('Fallback and Weak Topics Service', () => {
  it('returns valid cached fallback for shear/rotation prompt', () => {
    const res = getFallbackResponseForPrompt('rotate 90 degrees and shear');
    expect(res.topic).toBe('linear_algebra');
    expect(res.steps.length).toBeGreaterThan(0);
    expect(AIProblemResponseSchema.safeParse(res).success).toBe(true);
  });

  it('returns valid cached fallback for half adder prompt', () => {
    const res = getFallbackResponseForPrompt('design a half adder');
    expect(res.topic).toBe('digital_logic');
    expect(res.final_visual?.type).toBe('circuit');
    expect(AIProblemResponseSchema.safeParse(res).success).toBe(true);
  });

  it('returns friendly unsupported response for out of scope prompt', () => {
    const res = getFallbackResponseForPrompt('solve complex differential equation');
    expect(res.topic).toBe('unsupported');
    expect(res.unsupported_reason).toBeTruthy();
  });

  it('aggregates weak topics by frequency', () => {
    const mockQueries: StoredQueryRecord[] = [
      { id: '1', sessionId: 's1', prompt: 'p1', topic: 'linear_algebra', conceptTags: ['rotation', 'shear'], createdAt: '' },
      { id: '2', sessionId: 's1', prompt: 'p2', topic: 'linear_algebra', conceptTags: ['determinant', 'rotation'], createdAt: '' },
      { id: '3', sessionId: 's1', prompt: 'p3', topic: 'digital_logic', conceptTags: ['half_adder', 'xor'], createdAt: '' },
      { id: '4', sessionId: 's1', prompt: 'p4', topic: 'linear_algebra', conceptTags: ['rotation'], createdAt: '' },
    ];

    const weak = computeWeakTopics(mockQueries);
    expect(weak[0].tag).toBe('rotation');
    expect(weak[0].count).toBe(3);
  });
});
