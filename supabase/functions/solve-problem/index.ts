// Supabase Edge Function: solve-problem
// Deno runtime: handles server-side LLM completion, validation, rate limiting, and safe error handling.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://esm.sh/zod@3.23.8';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

// ========================================================
// Dynamic CORS Restricted to Localhost & Deployed Domain
// ========================================================
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOriginEnv = Deno.env.get('ALLOWED_ORIGIN') || '';

  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  const isAllowedDomain = Boolean(allowedOriginEnv && origin.includes(allowedOriginEnv));
  const isVercel = origin.endsWith('.vercel.app');

  const allowOrigin =
    isLocalhost || isAllowedDomain || isVercel
      ? origin
      : allowedOriginEnv || 'http://localhost:5173';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ========================================================
// Strict Zod Schemas
// ========================================================
const MatrixVisualSchema = z.object({
  type: z.literal('matrix'),
  matrix: z.tuple([
    z.tuple([z.number(), z.number()]),
    z.tuple([z.number(), z.number()]),
  ]),
  show_determinant: z.boolean().default(true),
});

const CircuitVisualSchema = z.object({
  type: z.literal('circuit'),
  circuit: z.literal('half_adder'),
  inputs: z.object({
    A: z.union([z.literal(0), z.literal(1)]),
    B: z.union([z.literal(0), z.literal(1)]),
  }),
  highlight_gate: z.enum(['XOR', 'AND']).nullable().default(null),
});

const VisualConfigSchema = z.discriminatedUnion('type', [
  MatrixVisualSchema,
  CircuitVisualSchema,
]);

const StepSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  visual: VisualConfigSchema.nullable().default(null),
});

const AIProblemResponseSchema = z.object({
  topic: z.enum(['linear_algebra', 'digital_logic', 'unsupported']),
  concept_tags: z.array(z.string()).default([]),
  title: z.string().min(1),
  steps: z.array(StepSchema).min(1),
  final_visual: VisualConfigSchema.nullable().default(null),
  unsupported_reason: z.string().nullable().default(null),
});

// ========================================================
// Helper to clean raw LLM output
// ========================================================
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

const SYSTEM_PROMPT = `You are a first-year engineering tutor for GateMaster AI, a visual sandbox tool.
Your goal is to explain student problems step-by-step and provide interactive visual configurations for our two engines:
1. Linear Algebra: 2D Cartesian grid transformations represented as a 2x2 matrix [[a, b], [c, d]] (where a=î.x, b=ĵ.x, c=î.y, d=ĵ.y).
2. Digital Logic: Combinational Half-Adder circuit (XOR and AND gates) with inputs A (0 or 1) and B (0 or 1).

HARD RULES:
1. Respond with JSON ONLY matching this exact schema:
{
  "topic": "linear_algebra" | "digital_logic" | "unsupported",
  "concept_tags": string[],
  "title": string,
  "steps": [
    { "title": string, "explanation": string, "visual": <visual config or null> }
  ],
  "final_visual": <visual config or null>,
  "unsupported_reason": string | null
}

Visual config for linear_algebra:
{ "type": "matrix", "matrix": [[a, b], [c, d]], "show_determinant": true }
(For multi-step problems like "rotate then shear", return one matrix per step AND the composed final matrix.)

Visual config for digital_logic:
{ "type": "circuit", "circuit": "half_adder", "inputs": { "A": 0|1, "B": 0|1 }, "highlight_gate": "XOR"|"AND"|null }

2. NEVER output code (no HTML, JS, Python, LaTeX blocks). Only pure JSON matching the schema.
3. No markdown code blocks (do not wrap in \`\`\`json or \`\`\`).
4. Explanations must be short, intuitive, and beginner-friendly (2-3 sentences max per step).
5. If the request cannot be rendered by a 2x2 matrix or a Half-Adder (e.g. 3D matrices, calculus, full adders, flip-flops, or unrelated topics), return topic "unsupported" with a friendly unsupported_reason.`;

// Call provider (Gemini or OpenAI)
async function callLLM(prompt: string, correctiveFeedback?: string): Promise<string> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const openAiKey = Deno.env.get('OPENAI_API_KEY');

  if (geminiKey) {
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text:
              SYSTEM_PROMPT +
              '\n\n' +
              (correctiveFeedback ? `PREVIOUS ATTEMPT FAILED: ${correctiveFeedback}\n\n` : '') +
              `Student Query: "${prompt}"`,
          },
        ],
      },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Upstream LLM request failed (${res.status})`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (openAiKey) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(correctiveFeedback ? [{ role: 'system', content: `Correction needed: ${correctiveFeedback}` }] : []),
      { role: 'user', content: prompt },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Upstream LLM request failed (${res.status})`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error('No LLM API key configured on server.');
}

// ========================================================
// Rate Limiter: Max 20 queries/hour per session_id
// ========================================================
async function checkRateLimit(sessionId: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !sessionId) return true;

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('ai_queries')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.warn('Rate limit query warning:', error.message);
      return true; // Fail open on db network blip
    }

    return (count || 0) < 20;
  } catch (_e) {
    return true;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const sessionId = body?.session_id || 'anonymous';

    // 1. Prompt validations
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid "prompt" parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. 500-character input limit
    if (prompt.trim().length > 500) {
      return new Response(
        JSON.stringify({ error: 'Prompt exceeds maximum limit of 500 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Per-session Rate Limit check (20 requests/hour)
    const isAllowed = await checkRateLimit(sessionId);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded: maximum 20 requests per hour per session. Please wait before asking more questions.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Call LLM (First attempt)
    let rawOutput = await callLLM(prompt);
    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(rawOutput));
    } catch (_e) {
      // Retry once on parse failure
      rawOutput = await callLLM(prompt, 'Your previous response was not valid JSON. Output strictly valid JSON.');
      parsed = JSON.parse(stripCodeFences(rawOutput));
    }

    // 5. Validate with Zod
    const validation = AIProblemResponseSchema.safeParse(parsed);
    if (!validation.success) {
      // Retry once with validation errors
      const errorMsg = validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      rawOutput = await callLLM(prompt, `Your previous JSON failed schema validation: ${errorMsg}. Fix the schema.`);
      parsed = JSON.parse(stripCodeFences(rawOutput));
      const retryValidation = AIProblemResponseSchema.safeParse(parsed);
      if (!retryValidation.success) {
        return new Response(
          JSON.stringify({
            error: 'AI response failed schema validation. Please rephrase your query.',
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify(retryValidation.data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(validation.data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    // Sanitize error: never return stack traces or raw secret error messages to client
    console.error('Edge function caught error:', err);
    return new Response(
      JSON.stringify({ error: 'Unable to process engineering query at this time. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
