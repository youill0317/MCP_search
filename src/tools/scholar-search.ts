// ============================================================
// Semantic Scholar MCP 도구 정의 (3개 도구)
// ============================================================

import { z } from 'zod';
import { scholarPaperSearch, scholarPaperDetails, scholarCitations } from '../services/scholar-api.js';
import { formatScholarPaperResults, formatSingleScholarPaper } from '../utils/formatter.js';
import type { CitationGraphResponse } from '../services/types.js';

export const scholarTools = {
    scholar_paper_search: {
        description: `Search 200M+ academic papers on Semantic Scholar. Covers all fields of study including CS, Medicine, Biology, Physics, and more.

**When to use:** Finding academic/research papers, literature review, exploring a research topic, finding papers by specific authors or in specific fields.
**Strengths:** Massive database (200M+ papers), field-of-study filtering, year filtering, free with no API key required, includes citation counts.
**Returns:** Array of PaperResult objects with title, url, abstract, authors, year, doi, citationCount, venue, categories, pdfUrl.

**Examples:**
- Topic search: { "query": "transformer attention mechanism" }
- Year-filtered: { "query": "large language model alignment", "year": "2024-2025" }
- Field-specific: { "query": "drug discovery", "fields_of_study": "Medicine" }
- Fewer results: { "query": "BERT fine-tuning techniques", "limit": 5 }`,
        schema: z.object({
            query: z.string().describe('Search query — keywords, paper title, or research topic. Example: "attention is all you need transformer"'),
            year: z.string().optional().describe('Year filter. Single year: "2024". Range: "2020-2024". From year: "2023-". Example: "2024-2025"'),
            fields_of_study: z.string().optional().describe('Filter by academic field. Options include: "Computer Science", "Medicine", "Biology", "Physics", "Mathematics", "Chemistry", "Engineering", "Economics", "Philosophy", "Psychology", etc.'),
            limit: z.number().min(1).max(100).optional().describe('Number of results. Default: 10, max: 100. Use 5-10 for focused searches, 20-50 for literature surveys.'),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperSearch({
                query: args.query,
                year: args.year,
                fieldsOfStudy: args.fields_of_study,
                limit: args.limit,
            }, apiKey);
            return formatScholarPaperResults(data);
        },
    },

    scholar_paper_details: {
        description: `Get detailed metadata for a specific academic paper: full abstract, all authors, DOI, citation count, venue, open access PDF link, and more.

**When to use:** Looking up a specific paper you already know about, getting full details after finding a paper via search, checking citation counts, finding the PDF link.
**Accepts multiple ID formats:** Semantic Scholar ID, DOI, arXiv ID, PubMed ID, ACL ID.
**Returns:** Single PaperResult object with all fields populated.

**Examples:**
- By DOI: { "paper_id": "10.18653/v1/N19-1423" }
- By arXiv ID: { "paper_id": "arXiv:1706.03762" }
- By S2 ID: { "paper_id": "204e3073870fae3d05bcbc2f6a8e263d9b72e776" }
- By PubMed ID: { "paper_id": "PMID:29233942" }`,
        schema: z.object({
            paper_id: z.string().describe('Paper identifier. Supports multiple formats: Semantic Scholar ID (hash), DOI (e.g., "10.1234/..."), arXiv ID (e.g., "arXiv:2301.00001"), PubMed ID (e.g., "PMID:12345678"), ACL ID (e.g., "ACL:W12-3456").'),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperDetails(args.paper_id, apiKey);
            return formatSingleScholarPaper(data);
        },
    },

    scholar_citation_graph: {
        description: `Explore the citation graph of an academic paper. Get papers that cite it ("citations") or papers it references ("references").

**When to use:** Literature review (finding related/newer work), impact analysis (who cited this paper), understanding a paper's foundations (what it builds on), tracing the evolution of an idea.
**Returns:** Object with paper info, array of PaperResult items, direction, and totalCount.

**Examples:**
- Who cited this paper: { "paper_id": "arXiv:1706.03762", "direction": "citations", "limit": 20 }
- What this paper references: { "paper_id": "10.18653/v1/N19-1423", "direction": "references" }
- Top citations only: { "paper_id": "arXiv:2005.14165", "direction": "citations", "limit": 10 }`,
        schema: z.object({
            paper_id: z.string().describe('Paper identifier (same formats as scholar_paper_details). Example: "arXiv:1706.03762"'),
            direction: z.enum(['citations', 'references']).describe('"citations": papers that cite this paper (newer work that builds on it). "references": papers this paper cites (its foundations/sources).'),
            limit: z.number().min(1).max(100).optional().describe('Number of results. Default: 20, max: 100.'),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarCitations(args.paper_id, args.direction, args.limit, apiKey);

            const items = (data?.data ?? []).map((item: any) => {
                const paper = args.direction === 'citations' ? item.citingPaper : item.citedPaper;
                return formatSingleScholarPaper(paper);
            });

            const result: CitationGraphResponse = {
                paper: { title: args.paper_id, url: '', abstract: '', source: 'semantic_scholar', authors: [] },
                items,
                direction: args.direction,
                totalCount: data?.total ?? items.length,
            };
            return result;
        },
    },
};
