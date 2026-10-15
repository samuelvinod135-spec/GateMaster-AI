export type AppView = 'dashboard' | 'linear-algebra' | 'digital-logic' | 'docs';

export type EngineMode = 'linear-algebra' | 'digital-logic';

export interface Matrix2x2 {
  a: number; // Row 1, Col 1 (i-hat x)
  b: number; // Row 1, Col 2 (j-hat x)
  c: number; // Row 2, Col 1 (i-hat y)
  d: number; // Row 2, Col 2 (j-hat y)
}

export interface LogicInputs {
  a: boolean;
  b: boolean;
}

export interface HalfAdderOutputs {
  sum: boolean;
  carry: boolean;
}

export interface UserProgress {
  sessionId: string;
  linearAlgebraSolved: boolean;
  digitalLogicSolved: boolean;
  score: number;
  updatedAt: string;
}

export type SyncStatus = 'synced' | 'local_only' | 'syncing' | 'error';
