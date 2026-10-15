// Pure scoring function: computeWeakTopics.ts
// Calculates student's weak topics based on failed challenge attempts, retries, and AI queries.

export interface ChallengeAttemptRecord {
  id?: string;
  sessionId: string;
  challengeId: string;
  topic: string;
  conceptTags: string[];
  success: boolean;
  attemptsCount: number;
  timeTakenMs?: number;
  createdAt: string; // ISO string
}

export interface AIQueryRecord {
  id?: string;
  sessionId: string;
  prompt: string;
  topic: string;
  conceptTags: string[];
  createdAt: string; // ISO string
}

export interface SuggestedChallenge {
  challengeId: string;
  title: string;
  engineMode: 'linear-algebra' | 'digital-logic';
}

export interface WeakTopicResult {
  tag: string;
  displayName: string;
  score: number;
  reason: string;
  failedAttempts: number;
  retries: number;
  aiQuestions: number;
  suggestedChallenge: SuggestedChallenge;
}

// Map from concept tags to existing challenges and engine modes
export const TAG_TO_CHALLENGE_MAP: Record<string, SuggestedChallenge> = {
  determinant: {
    challengeId: 'la-collapse',
    title: 'Collapse 2D Space (Zero Det)',
    engineMode: 'linear-algebra',
  },
  collapse: {
    challengeId: 'la-collapse',
    title: 'Collapse 2D Space (Zero Det)',
    engineMode: 'linear-algebra',
  },
  singularity: {
    challengeId: 'la-collapse',
    title: 'Collapse 2D Space (Zero Det)',
    engineMode: 'linear-algebra',
  },
  rotation: {
    challengeId: 'la-rotation',
    title: '90° Pure Rotation Matrix',
    engineMode: 'linear-algebra',
  },
  shear: {
    challengeId: 'la-shear',
    title: 'Horizontal Shear Matrix',
    engineMode: 'linear-algebra',
  },
  half_adder: {
    challengeId: 'dl-carry',
    title: 'Generate Carry Bit (A=1, B=1)',
    engineMode: 'digital-logic',
  },
  and: {
    challengeId: 'dl-carry',
    title: 'Generate Carry Bit (AND Gate)',
    engineMode: 'digital-logic',
  },
  and_gate: {
    challengeId: 'dl-carry',
    title: 'Generate Carry Bit (AND Gate)',
    engineMode: 'digital-logic',
  },
  carry: {
    challengeId: 'dl-carry',
    title: 'Generate Carry Bit (A=1, B=1)',
    engineMode: 'digital-logic',
  },
  xor: {
    challengeId: 'dl-sum',
    title: 'Generate Sum Bit (XOR Gate)',
    engineMode: 'digital-logic',
  },
  xor_gate: {
    challengeId: 'dl-sum',
    title: 'Generate Sum Bit (XOR Gate)',
    engineMode: 'digital-logic',
  },
  sum: {
    challengeId: 'dl-sum',
    title: 'Generate Sum Bit (XOR Gate)',
    engineMode: 'digital-logic',
  },
  eigenvector: {
    challengeId: 'la-eigenvector',
    title: 'Eigenvector Alignment',
    engineMode: 'linear-algebra',
  },
  eigenvalue: {
    challengeId: 'la-eigenvector',
    title: 'Eigenvector Alignment',
    engineMode: 'linear-algebra',
  },
};

const DEFAULT_CHALLENGE: SuggestedChallenge = {
  challengeId: 'la-collapse',
  title: 'Collapse 2D Space (Zero Det)',
  engineMode: 'linear-algebra',
};

/**
 * Calculates a time decay factor between 0.3 and 1.0 based on how recently an event occurred.
 * Events within the last 2 hours have weight 1.0, decaying gracefully over 7 days.
 */
export function calculateTimeDecay(eventDateIso: string, referenceMs = Date.now()): number {
  try {
    const eventMs = new Date(eventDateIso).getTime();
    if (isNaN(eventMs)) return 1.0;
    const ageMs = Math.max(0, referenceMs - eventMs);
    const twoHoursMs = 2 * 3600 * 1000;
    if (ageMs <= twoHoursMs) return 1.0;

    const sevenDaysMs = 7 * 24 * 3600 * 1000;
    const progress = Math.min(1.0, (ageMs - twoHoursMs) / sevenDaysMs);
    // Linear decay down to minimum weight 0.35
    return Math.round((1.0 - progress * 0.65) * 100) / 100;
  } catch (_e) {
    return 1.0;
  }
}

/**
 * Pure scoring function:
 * score = (failed_attempts * 2) + (retries beyond the first * 1) + (AI questions asking about that tag * 1)
 * weighted by time decay.
 *
 * Returns top 3 tags with score, plain-English reason, and suggested challenge.
 */
export function computeWeakTopics(
  attempts: ChallengeAttemptRecord[],
  aiQueries: AIQueryRecord[],
  referenceMs = Date.now()
): WeakTopicResult[] {
  interface TagAccumulator {
    failedAttempts: number;
    retries: number;
    aiQuestions: number;
    weightedScore: number;
    latestEventIso: string;
  }

  const accumulators: Record<string, TagAccumulator> = {};

  const getOrCreate = (tag: string, eventIso: string) => {
    const key = tag.toLowerCase().trim();
    if (!accumulators[key]) {
      accumulators[key] = {
        failedAttempts: 0,
        retries: 0,
        aiQuestions: 0,
        weightedScore: 0,
        latestEventIso: eventIso,
      };
    }
    return accumulators[key];
  };

  // 1. Process Challenge Attempts
  for (const att of attempts) {
    const decay = calculateTimeDecay(att.createdAt, referenceMs);
    const isFailure = !att.success;
    const retriesBeyondFirst = Math.max(0, att.attemptsCount - 1);

    for (const tag of att.conceptTags) {
      if (!tag || tag === 'out_of_scope') continue;
      const acc = getOrCreate(tag, att.createdAt);

      if (isFailure) {
        acc.failedAttempts += 1;
        acc.weightedScore += 2 * decay;
      }
      if (retriesBeyondFirst > 0) {
        acc.retries += retriesBeyondFirst;
        acc.weightedScore += retriesBeyondFirst * 1 * decay;
      }
    }
  }

  // 2. Process AI Queries
  for (const q of aiQueries) {
    const decay = calculateTimeDecay(q.createdAt, referenceMs);
    for (const tag of q.conceptTags) {
      if (!tag || tag === 'out_of_scope') continue;
      const acc = getOrCreate(tag, q.createdAt);
      acc.aiQuestions += 1;
      acc.weightedScore += 1 * decay;
    }
  }

  // 3. Transform to array and generate plain-English explanations
  const results: WeakTopicResult[] = Object.entries(accumulators)
    .filter(([_, acc]) => acc.weightedScore > 0)
    .map(([tag, acc]) => {
      // Build plain-English reason
      const parts: string[] = [];
      if (acc.failedAttempts > 0) {
        parts.push(`${acc.failedAttempts} failed attempt${acc.failedAttempts > 1 ? 's' : ''}`);
      }
      if (acc.retries > 0) {
        parts.push(`${acc.retries} retry${acc.retries > 1 ? 'ies' : ''}`);
      }
      if (acc.aiQuestions > 0) {
        parts.push(`asked AI ${acc.aiQuestions} time${acc.aiQuestions > 1 ? 's' : ''}`);
      }

      const reason = parts.length > 0 ? parts.join(', ') : 'Practice recommended';
      const displayName = tag
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const suggestedChallenge = TAG_TO_CHALLENGE_MAP[tag] || DEFAULT_CHALLENGE;

      return {
        tag,
        displayName,
        score: Math.round(acc.weightedScore * 10) / 10,
        reason,
        failedAttempts: acc.failedAttempts,
        retries: acc.retries,
        aiQuestions: acc.aiQuestions,
        suggestedChallenge,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return results;
}
