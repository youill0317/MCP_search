// ============================================================
// Brave Search MCP 도구 정의 (3개 도구)
// ============================================================

import { z } from 'zod';
import { braveWebSearch, braveNewsSearch, braveImageSearch } from '../services/brave-api.js';
import { formatBraveWebResults, formatBraveNewsResults, formatBraveImageResults } from '../utils/formatter.js';

export const braveTools = {
    brave_web_search: {
        description: 'General web search using Brave Search. Independent index of 35B+ pages. Best for broad web queries, general information, and diverse results.',
        schema: z.object({
            query: z.string().describe('Search query'),
            count: z.number().min(1).max(20).optional().describe('Number of results (default: 10, max: 20)'),
            country: z.string().optional().describe('Country code (e.g., "US", "KR")'),
            freshness: z.string().optional().describe('Time filter: "pd" (24h), "pw" (7d), "pm" (31d), "py" (365d)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveWebSearch(apiKey, args);
            return formatBraveWebResults(data);
        },
    },

    brave_news_search: {
        description: 'News search using Brave Search. Best for current events, breaking news, and time-sensitive topics.',
        schema: z.object({
            query: z.string().describe('News search query'),
            count: z.number().min(1).max(20).optional().describe('Number of results (default: 10)'),
            freshness: z.string().optional().describe('Time filter: "pd" (24h), "pw" (7d), "pm" (31d)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveNewsSearch(apiKey, args);
            return formatBraveNewsResults(data);
        },
    },

    brave_image_search: {
        description: 'Image search using Brave Search. Returns image URLs, thumbnails, and dimensions.',
        schema: z.object({
            query: z.string().describe('Image search query'),
            count: z.number().min(1).max(20).optional().describe('Number of results (default: 10)'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveImageSearch(apiKey, args);
            return formatBraveImageResults(data);
        },
    },
};
