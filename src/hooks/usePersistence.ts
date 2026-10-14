import { useState, useEffect, useCallback } from 'react';
import { SyncStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_SESSION_KEY = 'gatemaster_session_id';
const STORAGE_PROGRESS_KEY = 'gatemaster_progress';

export interface StoredProgress {
  sessionId: string;
  laSolved: boolean;
  dlSolved: boolean;
  score: number;
}

export function usePersistence(
  laSolved: boolean,
  dlSolved: boolean,
  onHydrate: (progress: { laSolved: boolean; dlSolved: boolean }) => void
) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local_only');
  const [sessionId, setSessionId] = useState<string>('');

  // 1. Initialize anonymous UUID and hydrate progress from localStorage
  useEffect(() => {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    setSessionId(sid);

    // Hydrate
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.laSolved || parsed.dlSolved) {
          onHydrate({
            laSolved: Boolean(parsed.laSolved),
            dlSolved: Boolean(parsed.dlSolved),
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse local storage progress:', e);
    }
  }, [onHydrate]);

  // 2. Sync to localStorage and Supabase on challenge changes
  const syncProgress = useCallback(async (la: boolean, dl: boolean) => {
    if (!sessionId) return;

    const score = (la ? 1 : 0) + (dl ? 1 : 0);

    // Always persist to localStorage first (zero latency)
    try {
      localStorage.setItem(
        STORAGE_PROGRESS_KEY,
        JSON.stringify({
          sessionId,
          laSolved: la,
          dlSolved: dl,
          score,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // Attempt background Supabase sync if configured
    if (isSupabaseConfigured && supabase) {
      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('user_progress')
          .upsert(
            {
              session_id: sessionId,
              linear_algebra_solved: la,
              digital_logic_solved: dl,
              score,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'session_id' }
          );

        if (error) {
          console.warn('Supabase upsert note:', error.message);
          setSyncStatus('local_only');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Network issue reaching Supabase:', err);
        setSyncStatus('local_only');
      }
    } else {
      setSyncStatus('local_only');
    }
  }, [sessionId]);

  // Trigger sync whenever challenge states change
  useEffect(() => {
    if (sessionId) {
      syncProgress(laSolved, dlSolved);
    }
  }, [laSolved, dlSolved, sessionId, syncProgress]);

  return {
    sessionId,
    syncStatus,
    syncProgress,
  };
}
