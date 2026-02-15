// ============================================================
// Exa MCP 도구 정의 (2개 도구)
// ============================================================

import { z } from 'zod';
import { exaSearch, exaAnswer } from '../services/exa-api.js';
import { formatExaSearchResults, formatExaAnswerResponse } from '../utils/formatter.js';

export const exaTools = {
    exa_search: {
        description: 'Semantic/neural search using Exa. Ultra-low latency (100-200ms). Best for technical docs, code, semantic similarity, and deep research.',
        schema: z.object({
            query: z.string().describe('Search query'),
            num_results: z.number().min(1).max(25).optional().describe('Number of results (default: 10)'),
            type: z.enum(['auto', 'neural', 'keyword']).optional().describe('Search type: "auto", "neural" (semantic), or "keyword"'),
            include_text: z.boolean().optional().describe('Include full page text (default: false)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaSearch(apiKey, args);
            return formatExaSearchResults(data);
        },
    },

    exa_answer: {
        description: 'Get a direct answer to a question with citations using Exa. Best for factual questions that need a concise answer backed by sources.',
        schema: z.object({
            query: z.string().describe('Question to answer'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaAnswer(apiKey, args.query);
            return formatExaAnswerResponse(data);
        },
    },
};
