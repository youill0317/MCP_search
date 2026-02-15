// ============================================================
// Semantic Scholar MCP 도구 정의 (3개 도구)
// ============================================================

import { z } from 'zod';
import { scholarPaperSearch, scholarPaperDetails, scholarCitations } from '../services/scholar-api.js';
import { formatScholarPaperResults, formatSingleScholarPaper } from '../utils/formatter.js';
import type { CitationGraphResponse } from '../services/types.js';

export const scholarTools = {
    scholar_paper_search: {
        description: 'Search 200M+ academic papers on Semantic Scholar. Supports keyword, author, year, and field-of-study filters. Free, no API key required.',
        schema: z.object({
            query: z.string().describe('Search query (keywords, paper title, or topic)'),
            year: z.string().optional().describe('Year filter, e.g., "2024" or "2020-2024"'),
            fields_of_study: z.string().optional().describe('Field filter, e.g., "Computer Science", "Medicine"'),
            limit: z.number().min(1).max(100).optional().describe('Number of results (default: 10)'),
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
        description: 'Get detailed information about a specific paper: abstract, authors, DOI, citation count, venue, PDF link. Accepts Semantic Scholar ID, DOI, arXiv ID (e.g., "arXiv:2301.00001"), or PMID.',
        schema: z.object({
            paper_id: z.string().describe('Paper identifier: S2 ID, DOI, "arXiv:XXXX.XXXXX", "PMID:XXXXX", etc.'),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperDetails(args.paper_id, apiKey);
            return formatSingleScholarPaper(data);
        },
    },

    scholar_citation_graph: {
        description: 'Get citation graph for a paper: who cited it (citations) or what it references. Useful for literature review and finding related work.',
        schema: z.object({
            paper_id: z.string().describe('Paper identifier'),
            direction: z.enum(['citations', 'references']).describe('"citations" = papers that cite this, "references" = papers this cites'),
            limit: z.number().min(1).max(100).optional().describe('Number of results (default: 20)'),
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
