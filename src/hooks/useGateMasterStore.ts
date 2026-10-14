import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Matrix2x2, LogicInputs, EngineMode, HalfAdderOutputs } from '../types';
import { calculateDeterminant, isDeterminantZero } from '../lib/math';

export const INITIAL_MATRIX: Matrix2x2 = {
  a: 2.0,
  b: 1.0,
  c: 0.0,
  d: 1.0,
};

export const INITIAL_LOGIC: LogicInputs = {
  a: false,
  b: false,
};

function fireConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#06b6d4', '#ec4899', '#10b981', '#fbbf24'],
    });
  } catch (e) {
    // Graceful fallback if window or canvas not available
  }
}

export function useGateMasterStore() {
  const [mode, setMode] = useState<EngineMode>('linear-algebra');
  const [matrix, setMatrix] = useState<Matrix2x2>(INITIAL_MATRIX);
  const [logicInputs, setLogicInputs] = useState<LogicInputs>(INITIAL_LOGIC);

  // Challenges
  const [laChallengeSolved, setLaChallengeSolved] = useState<boolean>(false);
  const [dlChallengeSolved, setDlChallengeSolved] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');

  // Matrix actions
  const updateMatrixCell = useCallback((cell: keyof Matrix2x2, value: number) => {
    setMatrix((prev) => {
      const next = { ...prev, [cell]: value };
      const det = calculateDeterminant(next);
      if (isDeterminantZero(det) && !laChallengeSolved) {
        setLaChallengeSolved(true);
        setCelebrationMessage('Challenge Solved! 2D Space Collapsed! 🎉');
        setShowCelebration(true);
        fireConfetti();
        setTimeout(() => setShowCelebration(false), 3500);
      }
      return next;
    });
  }, [laChallengeSolved]);

  const loadMatrixPreset = useCallback((preset: Matrix2x2) => {
    setMatrix(preset);
    const det = calculateDeterminant(preset);
    if (isDeterminantZero(det) && !laChallengeSolved) {
      setLaChallengeSolved(true);
      setCelebrationMessage('Challenge Solved! 2D Space Collapsed! 🎉');
      setShowCelebration(true);
      fireConfetti();
      setTimeout(() => setShowCelebration(false), 3500);
    }
  }, [laChallengeSolved]);

  const resetMatrix = useCallback(() => {
    setMatrix({ a: 1, b: 0, c: 0, d: 1 });
  }, []);

  // Digital Logic actions
  const toggleLogicInput = useCallback((input: 'a' | 'b') => {
    setLogicInputs((prev) => {
      const next = { ...prev, [input]: !prev[input] };
      // Half-Adder: Sum = A XOR B, Carry = A AND B
      const carry = next.a && next.b;
      if (carry && !dlChallengeSolved) {
        setDlChallengeSolved(true);
        setCelebrationMessage('Challenge Solved! Carry Bit Generated! 🎉');
        setShowCelebration(true);
        fireConfetti();
        setTimeout(() => setShowCelebration(false), 3500);
      }
      return next;
    });
  }, [dlChallengeSolved]);

  const resetLogic = useCallback(() => {
    setLogicInputs(INITIAL_LOGIC);
  }, []);

  // Compute outputs
  const determinant = calculateDeterminant(matrix);
  const isCollapsed = isDeterminantZero(determinant);

  const halfAdderOutputs: HalfAdderOutputs = {
    sum: logicInputs.a !== logicInputs.b,
    carry: logicInputs.a && logicInputs.b,
  };

  const totalScore = (laChallengeSolved ? 1 : 0) + (dlChallengeSolved ? 1 : 0);

  return {
    mode,
    setMode,
    matrix,
    updateMatrixCell,
    loadMatrixPreset,
    resetMatrix,
    determinant,
    isCollapsed,
    logicInputs,
    toggleLogicInput,
    resetLogic,
    halfAdderOutputs,
    laChallengeSolved,
    dlChallengeSolved,
    setLaChallengeSolved,
    setDlChallengeSolved,
    totalScore,
    showCelebration,
    celebrationMessage,
  };
}
