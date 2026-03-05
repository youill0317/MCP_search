import { z } from 'zod';
import { exaContents, exaCrawl, exaFindSimilar, exaPeopleSearch, exaSearch, exaSearchAdvanced } from '../services/exa-api.js';
import { formatExaContentsResults, formatExaSearchResults } from '../utils/formatter.js';

const exaTypeSchema = z.enum(['auto', 'fast', 'neural', 'keyword']).optional();
const exaLivecrawlSchema = z.enum(['never', 'fallback', 'always', 'preferred']).optional();

export const exaTools = {
    exa_search: {
        description: `Semantic search via Exa. Best for finding pages by meaning rather than exact keywords.

- **query**: Natural-language search query.
- **num_results**: Number of results (1–25, default 10).
- **type**: Search mode — "auto" (default), "fast", "neural", or "keyword".
- **include_text**: Set true to return page text content in results.`,
        schema: z.object({
            query: z.string(),
            num_results: z.number().min(1).max(25).optional(),
            type: exaTypeSchema,
            include_text: z.boolean().optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaSearch(apiKey, args);
            return formatExaSearchResults(data);
        },
    },

    exa_contents: {
        description: `Fetch full page text content for a list of URLs via Exa.

- **urls**: Array of valid URLs (1–25). Must start with http(s)://.
- **include_text**: Set true to return text content (default true).`,
        schema: z.object({
            urls: z.array(z.string().url()).min(1).max(25),
            include_text: z.boolean().optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaContents(apiKey, args);
            return formatExaContentsResults(data);
        },
    },

    exa_find_similar: {
        description: `Find pages semantically similar to a given URL via Exa.

- **url**: Reference URL to find similar pages for. Must be a valid URL.
- **num_results**: Number of results (1–25, default 10).
- **type**: Search mode — "auto" (default), "fast", "neural", or "keyword".
- **include_text**: Set true to return page text content.`,
        schema: z.object({
            url: z.string().url(),
            num_results: z.number().min(1).max(25).optional(),
            type: exaTypeSchema,
            include_text: z.boolean().optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaFindSimilar(apiKey, args);
            return formatExaSearchResults(data);
        },
    },

    exa_search_advanced: {
        description: `Advanced Exa search with full filtering options.

- **query**: Natural-language search query.
- **num_results**: Number of results (1–100, default 10).
- **type**: "auto" (default), "fast", "neural", or "keyword".
- **category**: Content category filter (e.g. "research paper", "company", "news", "tweet", "github", "linkedin", "pdf", "personal site", "people").
- **include_domains / exclude_domains**: Domain filter arrays (e.g. ["arxiv.org"]).
- **start_published_date / end_published_date**: ISO date strings (e.g. "2024-01-01T00:00:00.000Z").
- **start_crawl_date / end_crawl_date**: ISO date strings for crawl time filter.
- **include_text / exclude_text**: Arrays of strings that must/must not appear in results.
- **livecrawl**: "never", "fallback" (default), "always", or "preferred" — controls whether to fetch live content.
- **text_max_characters**: Max characters of text to return (1–200000).
- **subpages**: Number of subpages to include per result (1–10).
- **subpage_target**: Array of subpage URL patterns to target.`,
        schema: z.object({
            query: z.string(),
            num_results: z.coerce.number().min(1).max(100).optional(),
            type: exaTypeSchema,
            category: z.string().optional(),
            include_domains: z.array(z.string()).max(50).optional(),
            exclude_domains: z.array(z.string()).max(50).optional(),
            start_published_date: z.string().optional(),
            end_published_date: z.string().optional(),
            start_crawl_date: z.string().optional(),
            end_crawl_date: z.string().optional(),
            include_text: z.array(z.string()).max(50).optional(),
            exclude_text: z.array(z.string()).max(50).optional(),
            user_location: z.string().optional(),
            moderation: z.boolean().optional(),
            text_max_characters: z.coerce.number().min(1).max(200000).optional(),
            livecrawl: exaLivecrawlSchema,
            livecrawl_timeout: z.coerce.number().min(1).max(120000).optional(),
            subpages: z.coerce.number().min(1).max(10).optional(),
            subpage_target: z.array(z.string()).max(50).optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaSearchAdvanced(apiKey, args);
            return formatExaSearchResults(data);
        },
    },

    exa_crawl: {
        description: `Extract full text content from a known URL via Exa with live crawling.

- **url**: URL to extract content from. Must be a valid URL.
- **max_characters**: Max characters to return (1–200000, default 3000).`,
        schema: z.object({
            url: z.string().url(),
            max_characters: z.coerce.number().min(1).max(200000).optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaCrawl(apiKey, args);
            return formatExaContentsResults(data);
        },
    },

    exa_people_search: {
        description: `Search for people profiles and their links via Exa.

- **query**: Person name or description to search for.
- **num_results**: Number of results (1–25, default 5).
- **text_max_characters**: Max characters of profile text to return (1–200000, default 3000).`,
        schema: z.object({
            query: z.string(),
            num_results: z.coerce.number().min(1).max(25).optional(),
            text_max_characters: z.coerce.number().min(1).max(200000).optional(),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaPeopleSearch(apiKey, args);
            return formatExaSearchResults(data);
        },
    },
};
