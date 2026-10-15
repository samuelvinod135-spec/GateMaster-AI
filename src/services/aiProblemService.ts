import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AIProblemResponse, AIProblemResponseSchema, WeakTopicStat } from '../types/ai';
import { getCachedResponse } from '../data/cachedResponses';
import { getFallbackResponseForPrompt } from './aiFallbackData';

const LOCAL_STORAGE_QUERIES_KEY = 'gatemaster_ai_queries_history';
const API_TIMEOUT_MS = 8000;

export interface SolveProblemResult {
  data: AIProblemResponse;
  isOfflineDemo: boolean;
  error?: string;
}

export interface StoredQueryRecord {
  id: string;
  sessionId: string;
  prompt: string;
  topic: string;
  conceptTags: string[];
  createdAt: string;
}

/**
 * Checks if demo mode is explicitly forced via URL param ?demo=1
 */
export function isDemoModeForced(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === '1';
  } catch (_e) {
    return false;
  }
}

/**
 * Retrieves the local session ID from localStorage or creates a fresh one.
 */
function getLocalSessionId(): string {
  try {
    const existing = localStorage.getItem('gatemaster_session_id');
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem('gatemaster_session_id', fresh);
    return fresh;
  } catch (_e) {
    return 'anon-session-' + Date.now();
  }
}

/**
 * Saves a query record to localStorage for offline resilience and weak-topic tracking.
 */
function logQueryLocally(record: StoredQueryRecord): void {
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_QUERIES_KEY);
    const existing: StoredQueryRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(record);
    // Keep last 50 queries locally
    localStorage.setItem(LOCAL_STORAGE_QUERIES_KEY, JSON.stringify(existing.slice(0, 50)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gatemaster:weak-topics-updated'));
    }
  } catch (e) {
    console.warn('Failed to save query locally:', e);
  }
}

/**
 * Loads query records from localStorage.
 */
export function getLocalQueryHistory(): StoredQueryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_QUERIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

/**
 * Asynchronously logs query to Supabase ai_queries table.
 */
async function logQueryToSupabase(record: StoredQueryRecord): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('ai_queries').insert({
      id: record.id,
      session_id: record.sessionId,
      prompt: record.prompt,
      topic: record.topic,
      concept_tags: record.conceptTags,
      created_at: record.createdAt,
    });
  } catch (err) {
    console.warn('Background sync to ai_queries failed (non-critical):', err);
  }
}

/**
 * Main service method: Calls the solve-problem edge function with an 8s timeout,
 * validates the response with Zod, and falls back gracefully to offline cached responses.
 */
export async function solveProblemWithAI(prompt: string): Promise<SolveProblemResult> {
  const sessionId = getLocalSessionId();
  const trimmed = prompt.trim();

  // 1. Check if ?demo=1 URL flag is active (Forces cached mode for reliable recording)
  if (isDemoModeForced()) {
    const cached = getCachedResponse(trimmed) || getFallbackResponseForPrompt(trimmed);
    const record: StoredQueryRecord = {
      id: crypto.randomUUID(),
      sessionId,
      prompt: trimmed,
      topic: cached.topic,
      conceptTags: cached.concept_tags,
      createdAt: new Date().toISOString(),
    };
    logQueryLocally(record);

    return {
      data: cached,
      isOfflineDemo: true,
      error: 'Demo URL mode active (?demo=1). Loaded verified cached response.',
    };
  }

  // 2. If Supabase is not configured, immediately use cached demo fallback
  if (!isSupabaseConfigured || !supabase) {
    const cached = getCachedResponse(trimmed) || getFallbackResponseForPrompt(trimmed);
    const record: StoredQueryRecord = {
      id: crypto.randomUUID(),
      sessionId,
      prompt: trimmed,
      topic: cached.topic,
      conceptTags: cached.concept_tags,
      createdAt: new Date().toISOString(),
    };
    logQueryLocally(record);

    return {
      data: cached,
      isOfflineDemo: true,
      error: 'Supabase credentials unconfigured. Using offline demo model.',
    };
  }

  // 3. Attempt live Edge Function with 8-second AbortController timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('solve-problem', {
      body: { prompt: trimmed, session_id: sessionId },
    });

    clearTimeout(timeoutId);

    if (edgeError) {
      throw new Error(edgeError.message || 'Edge function error');
    }

    // Validate structured JSON with Zod
    const validated = AIProblemResponseSchema.safeParse(edgeData);
    if (!validated.success) {
      throw new Error('Edge function response failed schema validation');
    }

    // Log query in background
    const record: StoredQueryRecord = {
      id: crypto.randomUUID(),
      sessionId,
      prompt: trimmed,
      topic: validated.data.topic,
      conceptTags: validated.data.concept_tags,
      createdAt: new Date().toISOString(),
    };
    logQueryLocally(record);
    void logQueryToSupabase(record);

    return {
      data: validated.data,
      isOfflineDemo: false,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'Edge function timed out after 8s. Loaded verified cached response.'
      : err instanceof Error
      ? err.message
      : 'Network error';

    // Fall back to offline cached response if matched
    const cached = getCachedResponse(trimmed);
    if (cached) {
      const record: StoredQueryRecord = {
        id: crypto.randomUUID(),
        sessionId,
        prompt: trimmed,
        topic: cached.topic,
        conceptTags: cached.concept_tags,
        createdAt: new Date().toISOString(),
      };
      logQueryLocally(record);

      return {
        data: cached,
        isOfflineDemo: true,
        error: errorMsg,
      };
    }

    // If no direct cached match, fallback to keyword matcher or throw friendly error
    const fallback = getFallbackResponseForPrompt(trimmed);
    const record: StoredQueryRecord = {
      id: crypto.randomUUID(),
      sessionId,
      prompt: trimmed,
      topic: fallback.topic,
      conceptTags: fallback.concept_tags,
      createdAt: new Date().toISOString(),
    };
    logQueryLocally(record);

    return {
      data: fallback,
      isOfflineDemo: true,
      error: errorMsg,
    };
  }
}

/**
 * Aggregates concept tags from query history to identify the student's most queried or weak topics.
 */
export function computeWeakTopics(queries: StoredQueryRecord[]): WeakTopicStat[] {
  const counts: Record<string, number> = {};

  for (const q of queries) {
    for (const tag of q.conceptTags) {
      if (tag === 'out_of_scope') continue;
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
