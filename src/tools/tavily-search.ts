import { z } from 'zod';
import {
    tavilyCrawl,
    tavilyExtract,
    tavilyImageSearch,
    tavilyMap,
    tavilySearch,
} from '../services/tavily-api.js';
import {
    formatTavilyCrawlResults,
    formatTavilyExtractResults,
    formatTavilyImageResults,
    formatTavilyMapResults,
    formatTavilySearchResults,
} from '../utils/formatter.js';

const searchDepthSchema = z.enum(['basic', 'advanced']).optional();
const timeRangeSchema = z.enum(['day', 'week', 'month', 'year']).optional();

export const tavilyTools = {
    tavily_search: {
        description: `Search the web via Tavily and return titles, URLs, and content.

- **query**: Search keywords.
- **search_depth**: "basic" (fast, default) or "advanced" (thorough, slower).
- **include_raw_content**: Set true to include full page text in results.
- **max_results**: Number of results (1–20, default 10).
- **include_domains / exclude_domains**: Arrays of domain strings to filter (e.g. ["arxiv.org"]).
- **topic**: "general" (default) or "news".
- **days**: Limit results to the past N days (1–365).
- **time_range**: "day", "week", "month", or "year".`,
        schema: z.object({
            query: z.string(),
            search_depth: searchDepthSchema,
            include_raw_content: z.boolean().optional(),
            max_results: z.number().min(1).max(20).optional(),
            include_domains: z.array(z.string()).max(20).optional(),
            exclude_domains: z.array(z.string()).max(20).optional(),
            topic: z.enum(['general', 'news']).optional(),
            days: z.number().min(1).max(365).optional(),
            time_range: timeRangeSchema,
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilySearch(apiKey, args);
            return formatTavilySearchResults(data);
        },
    },

    tavily_extract: {
        description: `Extract clean, readable text content from given URLs via Tavily.

- **urls**: Array of full URLs to extract (1–20). Must be valid URLs starting with http(s)://.`,
        schema: z.object({
            urls: z.array(z.string().url()).min(1).max(20),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilyExtract(apiKey, args.urls);
            return formatTavilyExtractResults(data);
        },
    },

    tavily_crawl: {
        description: `Crawl a website starting from a root URL and extract content from discovered pages.

- **url**: Starting URL to crawl. Must be a valid URL.
- **max_depth**: How many link levels deep to crawl (1–10).
- **max_breadth**: Max pages per level (1–100).
- **limit**: Total page limit (1–200).
- **instructions**: Natural-language instructions to guide which content to extract.
- **select_paths / exclude_paths**: URL path patterns to include or exclude (e.g. ["/blog/*"]).
- **allow_external**: Set true to follow links to other domains.`,
        schema: z.object({
            url: z.string().url(),
            max_depth: z.number().min(1).max(10).optional(),
            max_breadth: z.number().min(1).max(100).optional(),
            limit: z.number().min(1).max(200).optional(),
            instructions: z.string().optional(),
            select_paths: z.array(z.string()).max(100).optional(),
            exclude_paths: z.array(z.string()).max(100).optional(),
            allow_external: z.boolean().optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilyCrawl(apiKey, args);
            return formatTavilyCrawlResults(data);
        },
    },

    tavily_map: {
        description: `Map a website's structure and return all discovered URLs without extracting content.

- **url**: Root URL to map. Must be a valid URL.
- **max_depth**: How many link levels deep to map (1–10).
- **max_breadth**: Max links per level (1–100).
- **max_results**: Total URL limit (1–200).
- **select_paths / exclude_paths**: URL path patterns to include or exclude.
- **allow_external**: Set true to include links to other domains.`,
        schema: z.object({
            url: z.string().url(),
            max_depth: z.number().min(1).max(10).optional(),
            max_breadth: z.number().min(1).max(100).optional(),
            max_results: z.number().min(1).max(200).optional(),
            select_paths: z.array(z.string()).max(100).optional(),
            exclude_paths: z.array(z.string()).max(100).optional(),
            allow_external: z.boolean().optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilyMap(apiKey, args);
            return formatTavilyMapResults(data, args.url);
        },
    },

    tavily_image_search: {
        description: `Search for images via Tavily.

- **query**: Image search keywords.
- **search_depth**: "basic" (default) or "advanced".
- **max_results**: Number of results (1–20, default 10).
- **include_domains / exclude_domains**: Domain filter arrays.
- **topic**: "general" (default) or "news".
- **days**: Limit to past N days (1–365).
- **time_range**: "day", "week", "month", or "year".`,
        schema: z.object({
            query: z.string(),
            search_depth: searchDepthSchema,
            max_results: z.number().min(1).max(20).optional(),
            include_domains: z.array(z.string()).max(20).optional(),
            exclude_domains: z.array(z.string()).max(20).optional(),
            topic: z.enum(['general', 'news']).optional(),
            days: z.number().min(1).max(365).optional(),
            time_range: timeRangeSchema,
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilyImageSearch(apiKey, args);
            return formatTavilyImageResults(data);
        },
    },
};
