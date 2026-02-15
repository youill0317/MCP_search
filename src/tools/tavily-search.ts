// ============================================================
// Tavily MCP 도구 정의 (2개 도구)
// ============================================================

import { z } from 'zod';
import { tavilySearch, tavilyExtract } from '../services/tavily-api.js';
import { formatTavilySearchResults } from '../utils/formatter.js';

export const tavilyTools = {
    tavily_search: {
        description: 'AI-optimized search using Tavily. Returns fact-based answers with sources. Best for RAG, factual verification, and getting concise AI-ready results.',
        schema: z.object({
            query: z.string().describe('Search query'),
            search_depth: z.enum(['basic', 'advanced']).optional().describe('Search depth: "basic" (1 credit) or "advanced" (2 credits, more thorough)'),
            include_raw_content: z.boolean().optional().describe('Include raw page content (default: false)'),
            max_results: z.number().min(1).max(20).optional().describe('Number of results (default: 10)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilySearch(apiKey, args);
            return formatTavilySearchResults(data);
        },
    },

    tavily_extract: {
        description: 'Extract clean text content from web pages using Tavily. Provide URLs to get structured, readable text.',
        schema: z.object({
            urls: z.array(z.string().url()).min(1).max(5).describe('URLs to extract content from (max 5)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilyExtract(apiKey, args.urls);
            const results = (data?.results ?? []).map((r: any) => ({
                url: r.url ?? '',
                rawContent: r.raw_content ?? '',
                extractedAt: new Date().toISOString(),
            }));
            return results;
        },
    },
};
