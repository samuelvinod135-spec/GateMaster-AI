import { describe, it, expect } from 'vitest';
import {
  computeWeakTopics,
  calculateTimeDecay,
  ChallengeAttemptRecord,
  AIQueryRecord,
} from '../services/computeWeakTopics';

describe('computeWeakTopics Pure Scoring Function', () => {
  const baseTime = 1700000000000; // Fixed timestamp for deterministic testing
  const nowIso = new Date(baseTime).toISOString();
  const oneHourAgoIso = new Date(baseTime - 3600 * 1000).toISOString();
  const fiveDaysAgoIso = new Date(baseTime - 5 * 24 * 3600 * 1000).toISOString();

  it('calculates score according to formula: (failed * 2) + (retries * 1) + (ai * 1)', () => {
    // 2 failed attempts on determinant, 1 retry beyond first
    const attempts: ChallengeAttemptRecord[] = [
      {
        sessionId: 'session-1',
        challengeId: 'la-collapse',
        topic: 'linear_algebra',
        conceptTags: ['determinant'],
        success: false,
        attemptsCount: 2, // 1 retry beyond first
        createdAt: nowIso,
      },
      {
        sessionId: 'session-1',
        challengeId: 'la-collapse',
        topic: 'linear_algebra',
        conceptTags: ['determinant'],
        success: false,
        attemptsCount: 1,
        createdAt: nowIso,
      },
    ];

    // 2 AI queries asking about determinant
    const aiQueries: AIQueryRecord[] = [
      {
        sessionId: 'session-1',
        prompt: 'what does determinant of 0 mean',
        topic: 'linear_algebra',
        conceptTags: ['determinant'],
        createdAt: nowIso,
      },
      {
        sessionId: 'session-1',
        prompt: 'why is determinant zero singular',
        topic: 'linear_algebra',
        conceptTags: ['determinant'],
        createdAt: nowIso,
      },
    ];

    const results = computeWeakTopics(attempts, aiQueries, baseTime);
    expect(results.length).toBe(1);

    const detResult = results[0];
    expect(detResult.tag).toBe('determinant');
    expect(detResult.displayName).toBe('Determinant');
    expect(detResult.failedAttempts).toBe(2);
    expect(detResult.retries).toBe(1);
    expect(detResult.aiQuestions).toBe(2);

    // Expected score: (2 * 2) + (1 * 1) + (2 * 1) = 4 + 1 + 2 = 7.0
    expect(detResult.score).toBe(7.0);

    // Plain English reason
    expect(detResult.reason).toContain('2 failed attempts');
    expect(detResult.reason).toContain('1 retry');
    expect(detResult.reason).toContain('asked AI 2 times');

    // Suggested challenge
    expect(detResult.suggestedChallenge.challengeId).toBe('la-collapse');
    expect(detResult.suggestedChallenge.engineMode).toBe('linear-algebra');
  });

  it('weights recent activity higher via time decay', () => {
    expect(calculateTimeDecay(oneHourAgoIso, baseTime)).toBe(1.0);
    const olderDecay = calculateTimeDecay(fiveDaysAgoIso, baseTime);
    expect(olderDecay).toBeLessThan(1.0);
    expect(olderDecay).toBeGreaterThan(0.3);

    // Recent XOR query vs Older rotation query with same counts
    const aiQueries: AIQueryRecord[] = [
      {
        sessionId: 's',
        prompt: 'xor gate',
        topic: 'digital_logic',
        conceptTags: ['xor'],
        createdAt: nowIso,
      },
      {
        sessionId: 's',
        prompt: 'rotate',
        topic: 'linear_algebra',
        conceptTags: ['rotation'],
        createdAt: fiveDaysAgoIso,
      },
    ];

    const results = computeWeakTopics([], aiQueries, baseTime);
    expect(results[0].tag).toBe('xor');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('returns maximum top 3 weak topics sorted by descending score', () => {
    const aiQueries: AIQueryRecord[] = [
      { sessionId: 's', prompt: 'p1', topic: 'la', conceptTags: ['tag_a', 'tag_b', 'tag_c', 'tag_d'], createdAt: nowIso },
      { sessionId: 's', prompt: 'p2', topic: 'la', conceptTags: ['tag_a', 'tag_b'], createdAt: nowIso },
      { sessionId: 's', prompt: 'p3', topic: 'la', conceptTags: ['tag_a'], createdAt: nowIso },
    ];

    const results = computeWeakTopics([], aiQueries, baseTime);
    expect(results.length).toBe(3);
    expect(results[0].tag).toBe('tag_a');
    expect(results[1].tag).toBe('tag_b');
    expect(results[2].tag).toBe('tag_c');
  });

  it('returns empty array when there are no failures or queries', () => {
    const results = computeWeakTopics([], [], baseTime);
    expect(results).toEqual([]);
  });
});
