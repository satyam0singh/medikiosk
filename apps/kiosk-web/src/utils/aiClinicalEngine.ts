/**
 * Clinical AI Intelligence Engine
 * Provides resilient inference with automated key pooling, multi-key rotation,
 * exponential fallback, and model cascading for real-time multilingual triage,
 * voice summary synthesis, and OCR document extraction.
 */

export const CLINICAL_AI_KEYS: string[] = [
  (import.meta as any).env?.VITE_GROQ_API_KEY,
  (import.meta as any).env?.VITE_GROQ_API_KEY_FALLBACK_1,
  (import.meta as any).env?.VITE_GROQ_API_KEY_FALLBACK_2,
  (import.meta as any).env?.VITE_GROQ_API_KEY_FALLBACK_3,
].filter(Boolean);

export const CLINICAL_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
];

let currentKeyIndex = 0;

/**
 * Returns the currently active API key from the pool
 */
export function getActiveAiKey(): string {
  const envKey = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CLINICAL_AI_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return CLINICAL_AI_KEYS[currentKeyIndex % CLINICAL_AI_KEYS.length];
}

/**
 * Rotates to the next API key in the pool upon rate limit or failure
 */
export function rotateToNextAiKey(): string {
  currentKeyIndex = (currentKeyIndex + 1) % CLINICAL_AI_KEYS.length;
  console.info(`[Clinical AI Engine] Rotated to pool slot ${(currentKeyIndex % CLINICAL_AI_KEYS.length) + 1}/${CLINICAL_AI_KEYS.length}`);
  return CLINICAL_AI_KEYS[currentKeyIndex];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: ChatMessage[];
  preferredModel?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' };
}

/**
 * Executes chat completion with multi-key pool rotation and multi-model fallback.
 */
export async function executeClinicalAiCompletion(options: AiCompletionOptions): Promise<string> {
  const modelsToTry = options.preferredModel
    ? [options.preferredModel, ...CLINICAL_MODELS.filter((m) => m !== options.preferredModel)]
    : CLINICAL_MODELS;

  let lastError: Error | null = null;
  const totalKeys = CLINICAL_AI_KEYS.length;

  // Try across all keys in the pool
  for (let keyAttempt = 0; keyAttempt < totalKeys; keyAttempt++) {
    const key = CLINICAL_AI_KEYS[(currentKeyIndex + keyAttempt) % totalKeys];

    // Try cascading models for the current key
    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: options.messages,
            temperature: typeof options.temperature === 'number' ? options.temperature : 0.1,
            max_tokens: options.maxTokens || 1000,
            ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
          }),
        });

        if (response.status === 429 || response.status === 401 || response.status === 403) {
          console.warn(`[Clinical AI Engine] Key slot status ${response.status}. Rotating pool key...`);
          rotateToNextAiKey();
          break; // Move to next key in pool
        }

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          console.warn(`[Clinical AI Engine] Model ${model} returned HTTP ${response.status}: ${errBody.slice(0, 150)}`);
          continue; // Try next model on same key
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Success: update the base active index
          currentKeyIndex = (currentKeyIndex + keyAttempt) % totalKeys;
          return content;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Clinical AI Engine] Attempt error on model ${model}:`, err?.message || err);
      }
    }
  }

  throw lastError || new Error('All Clinical AI pool keys and models were exhausted');
}
