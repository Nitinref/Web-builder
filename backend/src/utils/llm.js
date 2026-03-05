/**
 * src/utils/llm.js
 * Claude model factory
 *
 * Builder  → claude-sonnet-4-6         (complex code gen, tool calling)
 * Planner  → claude-haiku-4-5-20251001 (fast, cheap, JSON only)
 */

import { ChatAnthropic } from '@langchain/anthropic';

const BUILDER_MODEL = process.env.CLAUDE_BUILDER_MODEL ?? 'claude-haiku-4-5-20251001';
const PLANNER_MODEL = process.env.CLAUDE_PLANNER_MODEL ?? 'claude-haiku-4-5-20251001';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * @param {'builder'|'planner'} modelType
 * @param {number} temperature
 * @param {number} maxTokens
 */
export function makeModel(modelType = 'builder', temperature = 0.2, maxTokens = 2048) {
  return new ChatAnthropic({
    model:      modelType === 'builder' ? BUILDER_MODEL : PLANNER_MODEL,
    apiKey:     ANTHROPIC_API_KEY,
    temperature,
    maxTokens,
  });
}

export { BUILDER_MODEL, PLANNER_MODEL };