import { z } from 'zod';
import {
    scholarAuthorBatch,
    scholarAuthorDetails,
    scholarAuthorPapers,
    scholarAuthorSearch,
    scholarCitations,
    scholarPaperAuthors,
    scholarPaperBatch,
    scholarPaperCitations,
    scholarPaperDetails,
    scholarPaperReferences,
    scholarPaperSearch,
    scholarPaperSearchBulk,
    scholarPaperSearchMatch,
    scholarRecommendSingle,
    scholarRecommendList,
} from '../services/scholar-api.js';
import {
    formatScholarAuthor,
    formatScholarAuthorPage,
    formatScholarMatchResult,
    formatScholarPaperPage,
    formatScholarPaperResults,
    formatSingleScholarPaper,
} from '../utils/formatter.js';
import type { CitationGraphResponse, PagedResponse, PaperResult } from '../services/types.js';

const paperFilterSchema = {
    publication_types: z.string().optional(),
    open_access_pdf: z.boolean().optional(),
    min_citation_count: z.number().min(0).optional(),
    publication_date_or_year: z.string().optional(),
    year: z.string().optional(),
    venue: z.string().optional(),
    fields_of_study: z.string().optional(),
};

function toPaperFilterArgs(args: any): any {
    return {
        publicationTypes: args.publication_types,
        openAccessPdf: args.open_access_pdf,
        minCitationCount: args.min_citation_count,
        publicationDateOrYear: args.publication_date_or_year,
        year: args.year,
        venue: args.venue,
        fieldsOfStudy: args.fields_of_study,
    };
}

function formatCitationOrReferencePage(data: any, direction: 'citations' | 'references'): PagedResponse<PaperResult> {
    const papers = (data?.data ?? []).map((item: any) => {
        const paper = direction === 'citations' ? item.citingPaper : item.citedPaper;
        return formatSingleScholarPaper(paper);
    });

    return {
        data: papers,
        total: data?.total ?? undefined,
        offset: data?.offset ?? undefined,
        next: data?.next ?? undefined,
    };
}

function normalizeRecommendationResults(data: any): { data: any[] } {
    return {
        data: Array.isArray(data?.recommendedPapers) ? data.recommendedPapers : [],
    };
}

export const scholarTools = {
    scholar_paper_search: {
        description: `Search academic papers on Semantic Scholar by keywords.

- **query**: Search keywords (e.g. "transformer attention mechanism").
- **limit**: Number of results (1–100, default 10).
- **offset**: Pagination offset (0-based).
- **publication_types**: Comma-separated list (e.g. "JournalArticle,Conference"). Values: Review, JournalArticle, CaseReport, ClinicalTrial, Conference, Dataset, Editorial, LettersAndComments, MetaAnalysis, News, Study, Book, BookSection.
- **open_access_pdf**: Set true to return only papers with free PDF.
- **min_citation_count**: Minimum citation count filter.
- **publication_date_or_year**: Date range string (e.g. "2020-01-01:2024-12-31" or "2020:").
- **year**: Year range (e.g. "2020-2024" or "2020").
- **venue**: Venue filter (e.g. "Nature,Science").
- **fields_of_study**: Comma-separated fields (e.g. "Computer Science,Mathematics").`,
        schema: z.object({
            query: z.string(),
            limit: z.number().min(1).max(100).optional(),
            offset: z.number().min(0).optional(),
            ...paperFilterSchema,
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperSearch(
                {
                    query: args.query,
                    limit: args.limit,
                    offset: args.offset,
                    ...toPaperFilterArgs(args),
                },
                apiKey
            );
            return formatScholarPaperResults(data);
        },
    },

    scholar_paper_search_bulk: {
        description: `Bulk search papers with cursor-based pagination. Returns up to 1000 results per call. Use for large-scale paper collection.

- **query**: Search keywords.
- **token**: Continuation token from previous response for pagination. Omit for first call.
- **sort**: Sort field (e.g. "citationCount:desc", "publicationDate:asc").
- **publication_types / open_access_pdf / min_citation_count / publication_date_or_year / year / venue / fields_of_study**: Same filters as scholar_paper_search.`,
        schema: z.object({
            query: z.string(),
            token: z.string().optional(),
            sort: z.string().optional(),
            ...paperFilterSchema,
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperSearchBulk(
                {
                    query: args.query,
                    token: args.token,
                    sort: args.sort,
                    ...toPaperFilterArgs(args),
                },
                apiKey
            );
            return formatScholarPaperPage(data);
        },
    },

    scholar_paper_search_match: {
        description: `Find the single best-matching paper for a query. Useful for locating a specific known paper.

- **query**: Paper title or descriptive text to match against.
- **publication_types / open_access_pdf / min_citation_count / publication_date_or_year / year / venue / fields_of_study**: Same filters as scholar_paper_search.`,
        schema: z.object({
            query: z.string(),
            ...paperFilterSchema,
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperSearchMatch(
                {
                    query: args.query,
                    ...toPaperFilterArgs(args),
                },
                apiKey
            );
            return formatScholarMatchResult(data);
        },
    },

    scholar_paper_details: {
        description: `Get full metadata for a single paper by its identifier.

- **paper_id**: Paper identifier. Accepts multiple formats: Semantic Scholar ID (hex hash), DOI ("DOI:10.xxxx/..."), arXiv ("arXiv:2301.00001"), PubMed ("PMID:12345678"), CorpusId ("CorpusId:12345"), or full URL.`,
        schema: z.object({
            paper_id: z.string(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperDetails(args.paper_id, apiKey);
            return formatSingleScholarPaper(data);
        },
    },

    scholar_paper_batch: {
        description: `Get metadata for multiple papers in a single request.

- **paper_ids**: Array of paper identifiers (1–500). Each ID accepts the same formats as scholar_paper_details (S2 ID, DOI:xxx, arXiv:xxx, etc.).`,
        schema: z.object({
            paper_ids: z.array(z.string()).min(1).max(500),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperBatch(args.paper_ids, apiKey);
            return (data ?? []).map((paper: any) => formatSingleScholarPaper(paper));
        },
    },

    scholar_paper_authors: {
        description: `List all authors of a paper with their profile information.

- **paper_id**: Paper identifier (same formats as scholar_paper_details).
- **offset**: Pagination offset (0-based).
- **limit**: Number of authors to return (1–1000, default 10).`,
        schema: z.object({
            paper_id: z.string(),
            offset: z.number().min(0).optional(),
            limit: z.number().min(1).max(1000).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperAuthors(
                args.paper_id,
                {
                    offset: args.offset,
                    limit: args.limit,
                },
                apiKey
            );
            return formatScholarAuthorPage(data);
        },
    },

    scholar_paper_citations: {
        description: `List papers that cite the target paper (incoming citations).

- **paper_id**: Paper identifier (same formats as scholar_paper_details).
- **publication_date_or_year**: Filter citing papers by date range (e.g. "2023:").
- **offset**: Pagination offset (0-based).
- **limit**: Number of results (1–1000, default 20).`,
        schema: z.object({
            paper_id: z.string(),
            publication_date_or_year: z.string().optional(),
            offset: z.number().min(0).optional(),
            limit: z.number().min(1).max(1000).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperCitations(
                args.paper_id,
                {
                    publicationDateOrYear: args.publication_date_or_year,
                    offset: args.offset,
                    limit: args.limit,
                },
                apiKey
            );
            return formatCitationOrReferencePage(data, 'citations');
        },
    },

    scholar_paper_references: {
        description: `List papers referenced by the target paper (outgoing references).

- **paper_id**: Paper identifier (same formats as scholar_paper_details).
- **offset**: Pagination offset (0-based).
- **limit**: Number of results (1–1000, default 20).`,
        schema: z.object({
            paper_id: z.string(),
            offset: z.number().min(0).optional(),
            limit: z.number().min(1).max(1000).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarPaperReferences(
                args.paper_id,
                {
                    offset: args.offset,
                    limit: args.limit,
                },
                apiKey
            );
            return formatCitationOrReferencePage(data, 'references');
        },
    },

    scholar_author_search: {
        description: `Search for academic authors by name on Semantic Scholar.

- **query**: Author name to search for.
- **offset**: Pagination offset (0-based).
- **limit**: Number of results (1–100, default 10).`,
        schema: z.object({
            query: z.string(),
            offset: z.number().min(0).optional(),
            limit: z.number().min(1).max(100).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarAuthorSearch(
                {
                    query: args.query,
                    offset: args.offset,
                    limit: args.limit,
                },
                apiKey
            );
            return formatScholarAuthorPage(data);
        },
    },

    scholar_author_details: {
        description: `Get detailed profile for a single author by their Semantic Scholar author ID.

- **author_id**: Semantic Scholar author ID (numeric string).`,
        schema: z.object({
            author_id: z.string(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarAuthorDetails(args.author_id, apiKey);
            return formatScholarAuthor(data);
        },
    },

    scholar_author_papers: {
        description: `List papers written by a specific author.

- **author_id**: Semantic Scholar author ID (numeric string).
- **publication_date_or_year**: Filter by date range (e.g. "2020-01-01:2024-12-31").
- **offset**: Pagination offset (0-based).
- **limit**: Number of results (1–1000, default 20).`,
        schema: z.object({
            author_id: z.string(),
            publication_date_or_year: z.string().optional(),
            offset: z.number().min(0).optional(),
            limit: z.number().min(1).max(1000).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarAuthorPapers(
                args.author_id,
                {
                    publicationDateOrYear: args.publication_date_or_year,
                    offset: args.offset,
                    limit: args.limit,
                },
                apiKey
            );

            const papers = (data?.data ?? []).map((item: any) => formatSingleScholarPaper(item.paper ?? item));
            return {
                data: papers,
                total: data?.total ?? undefined,
                offset: data?.offset ?? undefined,
                next: data?.next ?? undefined,
            };
        },
    },

    scholar_author_batch: {
        description: `Get profile information for multiple authors in a single request.

- **author_ids**: Array of Semantic Scholar author IDs (1–1000).`,
        schema: z.object({
            author_ids: z.array(z.string()).min(1).max(1000),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarAuthorBatch(args.author_ids, apiKey);
            return (data ?? []).map((author: any) => formatScholarAuthor(author));
        },
    },

    scholar_citation_graph: {
        description: `Get a paper's full citation or reference graph in one call. Returns the root paper details plus its citing or referenced papers.

- **paper_id**: Paper identifier (same formats as scholar_paper_details).
- **direction**: "citations" (papers citing this one) or "references" (papers this one cites).
- **limit**: Number of related papers to return (1–100, default 20).`,
        schema: z.object({
            paper_id: z.string(),
            direction: z.enum(['citations', 'references']),
            limit: z.number().min(1).max(100).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const [paperData, data] = await Promise.all([
                scholarPaperDetails(args.paper_id, apiKey),
                scholarCitations(args.paper_id, args.direction, args.limit, apiKey),
            ]);

            const items = (data?.data ?? []).map((item: any) => {
                const paper = args.direction === 'citations' ? item.citingPaper : item.citedPaper;
                return formatSingleScholarPaper(paper);
            });

            const result: CitationGraphResponse = {
                paper: formatSingleScholarPaper(paperData),
                items,
                direction: args.direction,
                totalCount: data?.total ?? items.length,
            };
            return result;
        },
    },

    scholar_recommend_single: {
        description: `Get paper recommendations based on a single seed paper via Semantic Scholar Recommendations API.

- **paper_id**: Paper identifier (same formats as scholar_paper_details).
- **limit**: Number of recommendations (1–500, default 100).`,
        schema: z.object({
            paper_id: z.string(),
            limit: z.number().min(1).max(500).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarRecommendSingle(
                args.paper_id,
                { limit: args.limit },
                apiKey
            );
            return formatScholarPaperResults(normalizeRecommendationResults(data));
        },
    },

    scholar_recommend_list: {
        description: `Get paper recommendations based on lists of positive and optional negative example papers.

- **positive_paper_ids**: Array of paper IDs the user likes (1–100). These serve as positive examples for the recommendation engine.
- **negative_paper_ids**: Optional array of paper IDs to avoid (up to 100). Recommendations will diverge from these.
- **limit**: Number of recommendations (1–500, default 100).`,
        schema: z.object({
            positive_paper_ids: z.array(z.string()).min(1).max(100),
            negative_paper_ids: z.array(z.string()).max(100).optional(),
            limit: z.number().min(1).max(500).optional(),
        }),
        handler: async (args: any, apiKey?: string) => {
            const data = await scholarRecommendList(
                {
                    positivePaperIds: args.positive_paper_ids,
                    negativePaperIds: args.negative_paper_ids,
                    limit: args.limit,
                },
                apiKey
            );
            return formatScholarPaperResults(normalizeRecommendationResults(data));
        },
    },
};
