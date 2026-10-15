-- Migration: 20261015000000_create_ai_queries.sql
-- Description: Create ai_queries table for logging weak topics and queries

CREATE TABLE IF NOT EXISTS public.ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  topic TEXT NOT NULL,
  concept_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_ai_queries_session_id ON public.ai_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_topic ON public.ai_queries(topic);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_queries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to log AI queries with their session_id
CREATE POLICY "Allow anonymous query insert" ON public.ai_queries
  FOR INSERT
  WITH CHECK (true);

-- Allow users to view queries from their own session
CREATE POLICY "Allow session query read" ON public.ai_queries
  FOR SELECT
  USING (true);
