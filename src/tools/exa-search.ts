// ============================================================
// Exa MCP 도구 정의 (2개 도구)
// ============================================================

import { z } from 'zod';
import { exaSearch, exaAnswer } from '../services/exa-api.js';
import { formatExaSearchResults, formatExaAnswerResponse } from '../utils/formatter.js';

export const exaTools = {
    exa_search: {
        description: `Semantic/neural search using Exa AI. Ultra-low latency (100-200ms). Understands meaning and context, not just keywords.

**When to use:** Technical documentation, code/programming topics, finding semantically similar content, research papers, deep technical research.
**Strengths:** Neural search understands intent (e.g., "how to handle errors in async Python" finds relevant guides even without exact keyword matches), extremely fast, excellent for code and technical content.
**Returns:** Array of SearchResult objects with title, url, content, source, publishedDate, score, author.

**Examples:**
- Technical search: { "query": "best practices for error handling in TypeScript async functions" }
- Neural (semantic) mode: { "query": "lightweight alternatives to Elasticsearch for small projects", "type": "neural" }
- With full text: { "query": "implementing JWT authentication in Node.js", "include_text": true, "num_results": 5 }
- Keyword mode: { "query": "RFC 7519 JWT specification", "type": "keyword" }`,
        schema: z.object({
            query: z.string().describe('Search query. Exa understands natural language well, so descriptive queries work great. Example: "Python libraries for processing large CSV files efficiently"'),
            num_results: z.number().min(1).max(25).optional().describe('Number of results to return. Default: 10, max: 25.'),
            type: z.enum(['auto', 'neural', 'keyword']).optional().describe('Search mode. "auto" (default): Exa decides best approach. "neural": semantic/meaning-based search, best for natural language queries. "keyword": traditional keyword matching, best for exact terms, error codes, or specific identifiers.'),
            include_text: z.boolean().optional().describe('If true, includes full extracted page text in results. Default: false. Useful when you need the complete content for analysis.'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaSearch(apiKey, args);
            return formatExaSearchResults(data);
        },
    },

    exa_answer: {
        description: `Get a direct, cited answer to a question using Exa AI. Synthesizes information from multiple sources into a single answer.

**When to use:** When you need a concise, definitive answer to a factual question with source citations. Similar to tavily_search's "answer" field but powered by Exa's neural search.
**Returns:** Object with "answer" (string) and "results" (array of SearchResult sources).

**Examples:**
- Factual: { "query": "What is the maximum context window of Claude 3.5 Sonnet?" }
- Comparison: { "query": "What are the key differences between PostgreSQL and MySQL?" }
- Technical: { "query": "What is the time complexity of Dijkstra's algorithm?" }`,
        schema: z.object({
            query: z.string().describe('Question to answer. Phrase as a clear question for best results. Example: "What are the main features of HTTP/3?"'),
        }),
        handler: async (args: any, apiKey: string) => {
            const data = await exaAnswer(apiKey, args.query);
            return formatExaAnswerResponse(data);
        },
    },
};
