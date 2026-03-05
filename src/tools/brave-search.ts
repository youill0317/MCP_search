import { z } from 'zod';
import {
    braveImageSearch,
    braveNewsSearch,
    braveVideoSearch,
    braveWebSearch,
} from '../services/brave-api.js';
import {
    formatBraveImageResults,
    formatBraveNewsResults,
    formatBraveVideoResults,
    formatBraveWebResults,
} from '../utils/formatter.js';

const freshnessSchema = z.enum(['pd', 'pw', 'pm', 'py']).optional();

export const braveTools = {
    brave_web_search: {
        description: `Search the web via Brave and return titles, URLs, and snippets.

- **query**: Search keywords.
- **count**: Number of results (1–20, default 10).
- **country**: Two-letter country code (e.g. "US", "KR").
- **freshness**: Time filter — "pd" (past day), "pw" (past week), "pm" (past month), "py" (past year).`,
        schema: z.object({
            query: z.string(),
            count: z.number().min(1).max(20).optional(),
            country: z.string().optional(),
            freshness: freshnessSchema,
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveWebSearch(apiKey, args);
            return formatBraveWebResults(data);
        },
    },

    brave_news_search: {
        description: `Search recent news articles via Brave.

- **query**: News search keywords.
- **count**: Number of results (1–20, default 10).
- **freshness**: Time filter — "pd" (past day), "pw" (past week), "pm" (past month), "py" (past year).`,
        schema: z.object({
            query: z.string(),
            count: z.number().min(1).max(20).optional(),
            freshness: freshnessSchema,
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveNewsSearch(apiKey, args);
            return formatBraveNewsResults(data);
        },
    },

    brave_image_search: {
        description: `Search images via Brave.

- **query**: Image search keywords.
- **count**: Number of results (1–20, default 10).`,
        schema: z.object({
            query: z.string(),
            count: z.number().min(1).max(20).optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveImageSearch(apiKey, args);
            return formatBraveImageResults(data);
        },
    },

    brave_video_search: {
        description: `Search videos via Brave.

- **query**: Video search keywords.
- **count**: Number of results (1–20, default 10).
- **country**: Two-letter country code (e.g. "US", "KR").
- **freshness**: Time filter — "pd" (past day), "pw" (past week), "pm" (past month), "py" (past year).`,
        schema: z.object({
            query: z.string(),
            count: z.number().min(1).max(20).optional(),
            country: z.string().optional(),
            freshness: freshnessSchema,
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveVideoSearch(apiKey, args);
            return formatBraveVideoResults(data);
        },
    },
};
