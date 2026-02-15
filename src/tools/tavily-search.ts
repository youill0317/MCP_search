// ============================================================
// Tavily MCP 도구 정의 (2개 도구)
// ============================================================

import { z } from 'zod';
import { tavilySearch, tavilyExtract } from '../services/tavily-api.js';
import { formatTavilySearchResults } from '../utils/formatter.js';

export const tavilyTools = {
    tavily_search: {
        description: `AI-optimized search using Tavily. Designed specifically for LLM/RAG pipelines. Returns concise, fact-based answers with cited sources.

**When to use:** Factual verification, getting concise AI-ready content, RAG retrieval, when you need an AI-generated answer along with supporting sources.
**Strengths:** Returns a direct "answer" field with a synthesized response, relevance-scored results, optional raw content extraction.
**Returns:** Object with optional "answer" (string) and "results" (array of SearchResult with score 0-1).

**Examples:**
- Factual question: { "query": "What is the current population of South Korea?" }
- Deep research: { "query": "advantages of Rust over C++", "search_depth": "advanced" }
- With full content: { "query": "how does BERT tokenization work", "include_raw_content": true, "max_results": 5 }
- Quick lookup: { "query": "Python 3.13 new features", "max_results": 3 }`,
        schema: z.object({
            query: z.string().describe('Search query. Works best with natural language questions or specific topics. Example: "What are the benefits of microservices architecture?"'),
            search_depth: z.enum(['basic', 'advanced']).optional().describe('Search depth. "basic" (default, 1 credit): fast, good for simple queries. "advanced" (2 credits): more thorough, better for complex or nuanced topics.'),
            include_raw_content: z.boolean().optional().describe('If true, includes full raw page content in results. Default: false. Use sparingly as it increases response size significantly.'),
            max_results: z.number().min(1).max(20).optional().describe('Number of results to return. Default: 10. Use 3-5 for focused queries, 10-20 for comprehensive research.'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await tavilySearch(apiKey, args);
            return formatTavilySearchResults(data);
        },
    },

    tavily_extract: {
        description: `Extract clean, readable text content from web page URLs using Tavily. Strips HTML and returns structured text.

**When to use:** Reading full article content from a URL, extracting text from pages found via search, getting clean content for analysis or summarization.
**Strengths:** Handles JavaScript-rendered pages, removes ads/navigation, returns clean text.
**Returns:** Array of ExtractResult objects with url, rawContent, extractedAt.

**Examples:**
- Single URL: { "urls": ["https://example.com/article"] }
- Multiple URLs: { "urls": ["https://blog.example.com/post1", "https://news.example.com/story2"] }`,
        schema: z.object({
            urls: z.array(z.string().url()).min(1).max(5).describe('Array of URLs to extract content from. Must be valid HTTP/HTTPS URLs. Maximum 5 URLs per request. Example: ["https://example.com/article"]'),
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
