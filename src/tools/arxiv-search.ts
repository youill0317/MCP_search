// ============================================================
// arXiv MCP 도구 정의 (1개 도구)
// ============================================================

import { z } from 'zod';
import { arxivSearch } from '../services/arxiv-api.js';
import { formatArxivResults } from '../utils/formatter.js';

export const arxivTools = {
    arxiv_search: {
        description: `Search the arXiv preprint repository for academic papers. Covers Computer Science, Physics, Mathematics, Quantitative Biology, Statistics, and more.

**When to use:** Finding the latest preprints and research papers, especially in CS/AI/ML, physics, and mathematics. Good for cutting-edge research not yet published in journals.
**Strengths:** Most up-to-date research (preprints appear before journal publication), free access to full PDF, category-based filtering, covers 155 subject categories.
**Returns:** Array of PaperResult objects with title, url, abstract, authors, year, publishedDate, categories, pdfUrl.

IMPORTANT: Each parameter must contain ONLY its own value. Do NOT combine multiple fields into one parameter.

**Common categories:**
- CS: cs.AI (AI), cs.CL (NLP), cs.CV (Computer Vision), cs.LG (Machine Learning), cs.SE (Software Engineering), cs.CR (Cryptography)
- Physics: physics.gen-ph, hep-th, quant-ph
- Math: math.CO, math.AG, math.ST

**Examples:**
- AI papers: { "query": "large language model reasoning", "category": "cs.AI" }
- Recent submissions: { "query": "diffusion models image generation", "sort_by": "submittedDate", "max_results": 10 }
- NLP papers: { "query": "BERT sentence embedding", "category": "cs.CL" }
- Broad search: { "query": "quantum computing error correction" }`,
        schema: z.object({
            query: z.string().describe('Search query string ONLY. Must be a single query. Do NOT append extra metadata like year, author, or category into this field. Example: "attention mechanism in vision transformers"'),
            category: z.string().optional().describe('arXiv category filter. Example: "cs.AI", "cs.CL", "cs.CV", "cs.LG", "math.CO", "physics.gen-ph", "quant-ph". See https://arxiv.org/category_taxonomy for full list.'),
            max_results: z.number().min(1).max(50).optional().describe('Number of results. Default: 10, max: 50. arXiv API is slower than other services, so keep this reasonable.'),
            sort_by: z.enum(['relevance', 'lastUpdatedDate', 'submittedDate']).optional().describe('Sort order. "relevance" (default): most relevant first. "submittedDate": newest submissions first. "lastUpdatedDate": recently updated first.'),
        }),
        handler: async (args: any) => {
            const entries = await arxivSearch(args);
            return formatArxivResults(entries);
        },
    },
};
