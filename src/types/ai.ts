import { z } from 'zod';

// ========================================================
// 1. Visual Config Schemas
// ========================================================

/**
 * Visual config for Linear Algebra 2D transformations:
 * Matrix is [[a, b], [c, d]] where:
 * a = Row 1, Col 1 (i-hat x)
 * b = Row 1, Col 2 (j-hat x)
 * c = Row 2, Col 1 (i-hat y)
 * d = Row 2, Col 2 (j-hat y)
 */
export const MatrixVisualSchema = z.object({
  type: z.literal('matrix'),
  matrix: z.tuple([
    z.tuple([z.number(), z.number()]),
    z.tuple([z.number(), z.number()]),
  ]),
  show_determinant: z.boolean().default(true),
});

/**
 * Visual config for Digital Logic Half-Adder circuit:
 * Only circuits the engine can currently render (half_adder).
 */
export const CircuitVisualSchema = z.object({
  type: z.literal('circuit'),
  circuit: z.literal('half_adder'),
  inputs: z.object({
    A: z.union([z.literal(0), z.literal(1)]),
    B: z.union([z.literal(0), z.literal(1)]),
  }),
  highlight_gate: z.enum(['XOR', 'AND']).nullable().default(null),
});

export const VisualConfigSchema = z.discriminatedUnion('type', [
  MatrixVisualSchema,
  CircuitVisualSchema,
]);

// ========================================================
// 2. Step and Problem Response Schemas
// ========================================================

export const StepSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  visual: VisualConfigSchema.nullable().default(null),
});

export const AIProblemResponseSchema = z.object({
  topic: z.enum(['linear_algebra', 'digital_logic', 'unsupported']),
  concept_tags: z.array(z.string()).default([]),
  title: z.string().min(1),
  steps: z.array(StepSchema).min(1),
  final_visual: VisualConfigSchema.nullable().default(null),
  unsupported_reason: z.string().nullable().default(null),
});

// TypeScript Types inferred from Zod schemas
export type MatrixVisual = z.infer<typeof MatrixVisualSchema>;
export type CircuitVisual = z.infer<typeof CircuitVisualSchema>;
export type VisualConfig = z.infer<typeof VisualConfigSchema>;
export type AIStep = z.infer<typeof StepSchema>;
export type AIProblemResponse = z.infer<typeof AIProblemResponseSchema>;

export interface WeakTopicStat {
  tag: string;
  count: number;
}
