import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChallengeAttemptRecord, AIQueryRecord, computeWeakTopics, WeakTopicResult } from './computeWeakTopics';
import { getLocalQueryHistory } from './aiProblemService';

const LOCAL_STORAGE_ATTEMPTS_KEY = 'gatemaster_challenge_attempts';

/**
 * Retrieves the local anonymous session ID.
 */
export function getSessionId(): string {
  try {
    const existing = localStorage.getItem('gatemaster_session_id');
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem('gatemaster_session_id', fresh);
    return fresh;
  } catch (_e) {
    return 'anon-' + Date.now();
  }
}

/**
 * Loads challenge attempt history from localStorage.
 */
export function getLocalAttemptsHistory(): ChallengeAttemptRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

/**
 * Logs a challenge attempt locally and syncs to Supabase challenge_attempts table.
 */
export async function logChallengeAttempt(
  challengeId: string,
  topic: string,
  conceptTags: string[],
  success: boolean,
  attemptsCount = 1,
  timeTakenMs = 0
): Promise<void> {
  const sessionId = getSessionId();
  const record: ChallengeAttemptRecord = {
    id: crypto.randomUUID(),
    sessionId,
    challengeId,
    topic,
    conceptTags,
    success,
    attemptsCount,
    timeTakenMs,
    createdAt: new Date().toISOString(),
  };

  // 1. Save locally
  try {
    const existing = getLocalAttemptsHistory();
    existing.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_ATTEMPTS_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save challenge attempt locally:', e);
  }

  // Notify listeners of state change
  window.dispatchEvent(new CustomEvent('gatemaster:weak-topics-updated'));

  // 2. Background sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('challenge_attempts').insert({
        id: record.id,
        session_id: record.sessionId,
        challenge_id: record.challengeId,
        topic: record.topic,
        concept_tags: record.conceptTags,
        success: record.success,
        attempts_count: record.attemptsCount,
        time_taken_ms: record.timeTakenMs,
        created_at: record.createdAt,
      });
    } catch (err) {
      console.warn('Background sync to challenge_attempts failed:', err);
    }
  }
}

/**
 * Fetches and computes the current student's top weak topics combining both challenge attempts and AI queries.
 */
export async function getStudentWeakTopics(): Promise<WeakTopicResult[]> {
  const sessionId = getSessionId();
  let attempts: ChallengeAttemptRecord[] = getLocalAttemptsHistory();
  let aiQueries: AIQueryRecord[] = getLocalQueryHistory();

  // Try fetching fresh data from Supabase if online
  if (isSupabaseConfigured && supabase) {
    try {
      const [attRes, aiRes] = await Promise.all([
        supabase
          .from('challenge_attempts')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('ai_queries')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      if (attRes.data && attRes.data.length > 0) {
        attempts = attRes.data.map((r: any) => ({
          sessionId: r.session_id,
          challengeId: r.challenge_id,
          topic: r.topic,
          conceptTags: r.concept_tags || [],
          success: r.success,
          attemptsCount: r.attempts_count || 1,
          timeTakenMs: r.time_taken_ms,
          createdAt: r.created_at,
        }));
      }

      if (aiRes.data && aiRes.data.length > 0) {
        aiQueries = aiRes.data.map((r: any) => ({
          sessionId: r.session_id,
          prompt: r.prompt,
          topic: r.topic,
          conceptTags: r.concept_tags || [],
          createdAt: r.created_at,
        }));
      }
    } catch (err) {
      // Fallback silently to local cache
    }
  }

  return computeWeakTopics(attempts, aiQueries);
}
