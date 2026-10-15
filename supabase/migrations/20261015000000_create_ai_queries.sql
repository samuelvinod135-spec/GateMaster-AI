-- Migration: 20261015000000_create_ai_queries.sql
-- Description: Create ai_queries and challenge_attempts tables with RLS policies

-- 1. AI Queries Table
CREATE TABLE IF NOT EXISTS public.ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  topic TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_queries_session_id ON public.ai_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_topic ON public.ai_queries(topic);

ALTER TABLE public.ai_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous query insert" ON public.ai_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow session query read" ON public.ai_queries
  FOR SELECT
  USING (true);

-- 2. Challenge Attempts Table
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT false,
  attempts_count INT NOT NULL DEFAULT 1,
  time_taken_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_session_id ON public.challenge_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge_id ON public.challenge_attempts(challenge_id);

ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous challenge_attempts insert" ON public.challenge_attempts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow session challenge_attempts read" ON public.challenge_attempts
  FOR SELECT
  USING (true);
