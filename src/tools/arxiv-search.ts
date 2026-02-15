// ============================================================
// arXiv MCP 도구 정의 (1개 도구)
// ============================================================

import { z } from 'zod';
import { arxivSearch } from '../services/arxiv-api.js';
import { formatArxivResults } from '../utils/formatter.js';

export const arxivTools = {
    arxiv_search: {
        description: 'Search arXiv preprint repository for academic papers in Computer Science, Physics, Mathematics, and more. Free, no API key required. Good for finding the latest research papers and preprints.',
        schema: z.object({
            query: z.string().describe('Search query (keywords, paper title, author)'),
            category: z.string().optional().describe('arXiv category, e.g., "cs.AI", "cs.CL", "math.CO", "physics.gen-ph"'),
            max_results: z.number().min(1).max(50).optional().describe('Number of results (default: 10, max: 50)'),
            sort_by: z.enum(['relevance', 'lastUpdatedDate', 'submittedDate']).optional().describe('Sort order (default: relevance)'),
        }),
        handler: async (args: any) => {
            const entries = await arxivSearch(args);
            return formatArxivResults(entries);
        },
    },
};
