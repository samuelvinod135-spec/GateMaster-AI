import { AIProblemResponse } from '../types/ai';

export const FALLBACK_RESPONSES: Record<string, AIProblemResponse> = {
  // 1. Linear Algebra: Rotation + Shear
  rotate_and_shear: {
    topic: 'linear_algebra',
    concept_tags: ['rotation', 'shear', 'matrix_multiplication', 'composition', 'determinant'],
    title: '2D Rotation and Horizontal Shear Composition',
    steps: [
      {
        title: 'Step 1: Apply 90° Counter-Clockwise Rotation',
        explanation:
          'Rotating space by +90° sends î (1, 0) to (0, 1) and ĵ (0, 1) to (-1, 0). The rotation matrix is [[0, -1], [1, 0]]. The determinant is (0)(0) - (-1)(1) = 1.0, preserving unit area.',
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
        title: 'Step 2: Apply Horizontal Shear (k = 1.0)',
        explanation:
          'A horizontal shear slides coordinate lines parallel to the x-axis proportional to their height y. The shear matrix is [[1, 1], [0, 1]], with determinant = 1.0.',
        visual: {
          type: 'matrix',
          matrix: [
            [1, 1],
            [0, 1],
          ],
          show_determinant: true,
        },
      },
      {
        title: 'Step 3: Composed Transformation (Shear × Rotation)',
        explanation:
          'Transformations compose right-to-left: [[1, 1], [0, 1]] × [[0, -1], [1, 0]] = [[1, -1], [1, 0]]. The canvas reflects the combined warp while maintaining a non-zero determinant of 1.0.',
        visual: {
          type: 'matrix',
          matrix: [
            [1, -1],
            [1, 0],
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
  },

  // 2. Digital Logic: Half-Adder Design
  half_adder: {
    topic: 'digital_logic',
    concept_tags: ['half_adder', 'xor_gate', 'and_gate', 'sum', 'carry', 'binary_addition'],
    title: 'Digital Logic Half-Adder Circuit Architecture',
    steps: [
      {
        title: 'Step 1: Sum Bit via XOR Gate (A=1, B=0)',
        explanation:
          'In binary addition (1 + 0 = 1), the Sum bit equals 1 while Carry is 0. The XOR gate performs modulo-2 addition: it outputs High (1) only when exactly one input is High.',
        visual: {
          type: 'circuit',
          circuit: 'half_adder',
          inputs: { A: 1, B: 0 },
          highlight_gate: 'XOR',
        },
      },
      {
        title: 'Step 2: Carry Bit via AND Gate (A=1, B=1)',
        explanation:
          'When both inputs are High (1 + 1 = 10 in binary), the Sum drops to 0 and the Carry bit lights up (1). The AND gate detects this condition and illuminates the Carry LED.',
        visual: {
          type: 'circuit',
          circuit: 'half_adder',
          inputs: { A: 1, B: 1 },
          highlight_gate: 'AND',
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
  },

  // 3. Linear Algebra: Determinant of 0
  determinant_zero: {
    topic: 'linear_algebra',
    concept_tags: ['determinant', 'collapse', 'singularity', 'dimension_loss', 'linear_dependency'],
    title: 'Geometric Meaning of Determinant = 0',
    steps: [
      {
        title: 'Step 1: Standard Full 2D Space (det = 1.0)',
        explanation:
          'In standard Cartesian space with the identity matrix [[1, 0], [0, 1]], the basis vectors î and ĵ span a 2D parallelogram of area 1.0. Space has 2 full dimensions.',
        visual: {
          type: 'matrix',
          matrix: [
            [1, 0],
            [0, 1],
          ],
          show_determinant: true,
        },
      },
      {
        title: 'Step 2: Linear Dependency & Dimensional Collapse (det = 0.0)',
        explanation:
          'When columns are scalar multiples of each other—such as matrix [[2, 1], [2, 1]]—both î and ĵ land along the exact same 1D line y = x. The 2D area completely vanishes into 0. The matrix cannot be inverted because 2D information is permanently squished.',
        visual: {
          type: 'matrix',
          matrix: [
            [2, 1],
            [2, 1],
          ],
          show_determinant: true,
        },
      },
    ],
    final_visual: {
      type: 'matrix',
      matrix: [
        [2, 1],
        [2, 1],
      ],
      show_determinant: true,
    },
    unsupported_reason: null,
  },

  // 4. Unsupported fallback
  unsupported_generic: {
    topic: 'unsupported',
    concept_tags: ['out_of_scope'],
    title: 'Topic Outside Engine Scope',
    steps: [
      {
        title: 'Topic Not Supported in PoC',
        explanation:
          "GateMaster AI is focused on 2D Linear Algebra transformations (2x2 matrices) and Digital Logic Half-Adder combinational circuits. Queries about calculus, 3D matrices, differential equations, or sequential circuits are out of scope.",
        visual: null,
      },
    ],
    final_visual: null,
    unsupported_reason:
      'This concept cannot be visualized on our 2D Linear Algebra grid or Half-Adder logic circuit. Try asking about "rotate 90 degrees then shear", "design a half adder", or "what does determinant of 0 mean".',
  },
};

/**
 * Finds the best matching cached fallback response based on prompt text keywords.
 */
export function getFallbackResponseForPrompt(prompt: string): AIProblemResponse {
  const normalized = prompt.toLowerCase().trim();

  // Check for rotation/shear
  if (
    normalized.includes('shear') ||
    normalized.includes('rotate') ||
    normalized.includes('rotation')
  ) {
    return FALLBACK_RESPONSES.rotate_and_shear;
  }

  // Check for half adder / logic
  if (
    normalized.includes('half adder') ||
    normalized.includes('half-adder') ||
    normalized.includes('circuit') ||
    normalized.includes('xor') ||
    normalized.includes('sum and carry')
  ) {
    return FALLBACK_RESPONSES.half_adder;
  }

  // Check for determinant / collapse
  if (
    normalized.includes('determinant') ||
    normalized.includes('collapse') ||
    normalized.includes('singular') ||
    normalized.includes('zero')
  ) {
    return FALLBACK_RESPONSES.determinant_zero;
  }

  // Otherwise return unsupported response with clear reason
  return {
    ...FALLBACK_RESPONSES.unsupported_generic,
    unsupported_reason: `"${prompt}" is currently outside GateMaster AI's engine capabilities. Our sandbox visualizes 2D transformation matrices and Half-Adder logic circuits.`,
  };
}
