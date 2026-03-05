import { z } from 'zod';
import { arxivSearch } from '../services/arxiv-api.js';
import { formatArxivResults } from '../utils/formatter.js';

const arxivSortBySchema = z.enum(['relevance', 'lastUpdatedDate', 'submittedDate']).optional();
const arxivSortOrderSchema = z.enum(['ascending', 'descending']).optional();

export const arxivTools = {
    arxiv_search: {
        description: `Search arXiv preprint papers. Provide at least one of query, raw_query, or id_list.

- **query**: Simple search keywords. Automatically searches all fields.
- **raw_query**: Raw arXiv query syntax for advanced searches (e.g. "au:Einstein AND ti:relativity", "cat:cs.AI AND all:transformer"). Use this for field-specific searches.
- **id_list**: Array of arXiv IDs to fetch directly (e.g. ["2301.00001", "2301.00002"]).
- **category**: arXiv category prefix (e.g. "cs.AI", "math.CO", "physics.hep-th"). Combined with query using AND.
- **start**: Pagination offset (0-based, default 0).
- **max_results**: Number of results (1–100, default 10).
- **sort_by**: "relevance" (default), "lastUpdatedDate", or "submittedDate".
- **sort_order**: "descending" (default) or "ascending".`,
        schema: z.object({
            query: z.string().optional(),
            raw_query: z.string().optional(),
            id_list: z.array(z.string()).min(1).max(50).optional(),
            category: z.string().optional(),
            start: z.number().min(0).optional(),
            max_results: z.number().min(1).max(100).optional(),
            sort_by: arxivSortBySchema,
            sort_order: arxivSortOrderSchema,
        }),
        handler: async (args: any) => {
            if (!args.query && !args.raw_query && (!args.id_list || args.id_list.length === 0)) {
                throw new Error('Provide one of query, raw_query, or id_list.');
            }
            const entries = await arxivSearch(args);
            return formatArxivResults(entries);
        },
    },
};
