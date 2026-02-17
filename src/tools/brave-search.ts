// ============================================================
// Brave Search MCP 도구 정의 (3개 도구)
// ============================================================

import { z } from 'zod';
import { braveWebSearch, braveNewsSearch, braveImageSearch } from '../services/brave-api.js';
import { formatBraveWebResults, formatBraveNewsResults, formatBraveImageResults } from '../utils/formatter.js';

export const braveTools = {
    brave_web_search: {
        description: `General web search powered by Brave Search's independent index of 35 billion+ pages.

**When to use:** Broad web queries, general information lookup, getting diverse results from across the web.
**Strengths:** Privacy-focused, independent index (not reliant on Google/Bing), supports freshness filters for time-sensitive queries.
**Returns:** Array of SearchResult objects with title, url, content, source, publishedDate.

IMPORTANT: Each parameter must contain ONLY its own value. Do NOT combine multiple fields into one parameter.

**Examples:**
- General lookup: { "query": "TypeScript best practices 2025" }
- Regional results: { "query": "서울 맛집 추천", "country": "KR" }
- Recent results only: { "query": "OpenAI GPT-5 release", "freshness": "pw" }
- Fewer results: { "query": "React vs Vue comparison", "count": 5 }`,
        schema: z.object({
            query: z.string().describe('Search query string ONLY. Must be a single query. Do NOT append extra metadata. Example: "machine learning for beginners"'),
            count: z.number().min(1).max(20).optional().describe('Number of results to return. Default: 10, max: 20. Use smaller values (3-5) for quick lookups.'),
            country: z.string().optional().describe('2-letter country code to localize results. Example: "US", "KR", "JP", "DE"'),
            freshness: z.string().optional().describe('Time filter for result freshness. Options: "pd" (past 24 hours), "pw" (past week), "pm" (past month), "py" (past year). Omit for all time.'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveWebSearch(apiKey, args);
            return formatBraveWebResults(data);
        },
    },

    brave_news_search: {
        description: `News-specific search using Brave Search. Retrieves current news articles with publication dates.

**When to use:** Breaking news, current events, recent announcements, time-sensitive topics.
**Strengths:** Dedicated news index, fast freshness filtering, good for tracking unfolding stories.
**Returns:** Array of SearchResult objects with title, url, content, source, publishedDate.

IMPORTANT: Each parameter must contain ONLY its own value. Do NOT combine multiple fields into one parameter.

**Examples:**
- Breaking news: { "query": "AI regulation 2026", "freshness": "pd" }
- Weekly roundup: { "query": "tech industry layoffs", "freshness": "pw", "count": 10 }
- Topic monitoring: { "query": "climate change COP summit" }`,
        schema: z.object({
            query: z.string().describe('News search query string ONLY. Must be a single query. Do NOT append extra metadata. Example: "Tesla earnings Q1 2026"'),
            count: z.number().min(1).max(20).optional().describe('Number of news articles to return. Default: 10.'),
            freshness: z.string().optional().describe('Time filter: "pd" (past 24h), "pw" (past week), "pm" (past month). Recommended for news searches.'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveNewsSearch(apiKey, args);
            return formatBraveNewsResults(data);
        },
    },

    brave_image_search: {
        description: `Image search using Brave Search. Returns image URLs with thumbnails and dimensions.

**When to use:** Finding images, visual references, diagrams, infographics.
**Returns:** Array of ImageResult objects with title, url, thumbnailUrl, sourceUrl, width, height.

IMPORTANT: Each parameter must contain ONLY its own value. Do NOT combine multiple fields into one parameter.

**Examples:**
- Find diagrams: { "query": "neural network architecture diagram" }
- Find logos: { "query": "TypeScript logo transparent PNG", "count": 5 }`,
        schema: z.object({
            query: z.string().describe('Image search query string ONLY. Must be a single query. Do NOT append extra metadata. Example: "sunset over mountains high resolution"'),
            count: z.number().min(1).max(20).optional().describe('Number of image results to return. Default: 10.'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await braveImageSearch(apiKey, args);
            return formatBraveImageResults(data);
        },
    },
};
