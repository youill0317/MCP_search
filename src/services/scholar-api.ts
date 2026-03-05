import { checkRateLimit } from '../utils/rate-limiter.js';

const S2_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export const PAPER_FIELDS_DEFAULT = [
    'paperId',
    'title',
    'abstract',
    'url',
    'venue',
    'year',
    'authors',
    'citationCount',
    'publicationDate',
    'externalIds',
    'openAccessPdf',
    'fieldsOfStudy',
].join(',');

export const AUTHOR_FIELDS_DEFAULT = [
    'authorId',
    'name',
    'url',
    'affiliations',
    'homepage',
    'paperCount',
    'citationCount',
    'hIndex',
].join(',');

type ScholarQueryValue = string | number | boolean | undefined;

interface ScholarPaperFilterOptions {
    fields?: string;
    publicationTypes?: string;
    openAccessPdf?: boolean;
    minCitationCount?: number;
    publicationDateOrYear?: string;
    year?: string;
    venue?: string;
    fieldsOfStudy?: string;
}

function buildQueryString(params: Record<string, ScholarQueryValue>): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;

        if (typeof value === 'boolean') {
            if (value) {
                search.set(key, '');
            }
            continue;
        }

        search.set(key, String(value));
    }

    return search.toString();
}

async function s2Request(path: string, apiKey?: string, init?: RequestInit): Promise<any> {
    await checkRateLimit('semantic_scholar');

    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
    };

    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${S2_BASE_URL}${path}`, {
        ...init,
        headers,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Semantic Scholar API error (${response.status}): ${text}`);
    }

    return response.json();
}

function paperFilterParams(options: ScholarPaperFilterOptions): Record<string, ScholarQueryValue> {
    return {
        publicationTypes: options.publicationTypes,
        openAccessPdf: options.openAccessPdf,
        minCitationCount: options.minCitationCount,
        publicationDateOrYear: options.publicationDateOrYear,
        year: options.year,
        venue: options.venue,
        fieldsOfStudy: options.fieldsOfStudy,
    };
}

export async function scholarPaperSearch(
    options: ScholarPaperFilterOptions & {
        query: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        query: options.query,
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        offset: options.offset,
        limit: options.limit ?? 10,
        ...paperFilterParams(options),
    });

    return s2Request(`/paper/search?${query}`, apiKey);
}

export async function scholarPaperSearchBulk(
    options: ScholarPaperFilterOptions & {
        query: string;
        token?: string;
        sort?: string;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        query: options.query,
        token: options.token,
        sort: options.sort,
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        ...paperFilterParams(options),
    });

    return s2Request(`/paper/search/bulk?${query}`, apiKey);
}

export async function scholarPaperSearchMatch(
    options: ScholarPaperFilterOptions & {
        query: string;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        query: options.query,
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        ...paperFilterParams(options),
    });

    return s2Request(`/paper/search/match?${query}`, apiKey);
}

export async function scholarPaperDetails(paperId: string, apiKey?: string, fields: string = PAPER_FIELDS_DEFAULT): Promise<any> {
    const query = buildQueryString({ fields });
    return s2Request(`/paper/${encodeURIComponent(paperId)}?${query}`, apiKey);
}

export async function scholarPaperBatch(paperIds: string[], apiKey?: string, fields: string = PAPER_FIELDS_DEFAULT): Promise<any> {
    const query = buildQueryString({ fields });
    return s2Request(`/paper/batch?${query}`, apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: paperIds }),
    });
}

export async function scholarPaperAuthors(
    paperId: string,
    options: {
        fields?: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? AUTHOR_FIELDS_DEFAULT,
        offset: options.offset,
        limit: options.limit ?? 10,
    });

    return s2Request(`/paper/${encodeURIComponent(paperId)}/authors?${query}`, apiKey);
}

export async function scholarPaperCitations(
    paperId: string,
    options: {
        fields?: string;
        publicationDateOrYear?: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? `citingPaper.${PAPER_FIELDS_DEFAULT}`,
        publicationDateOrYear: options.publicationDateOrYear,
        offset: options.offset,
        limit: options.limit ?? 20,
    });

    return s2Request(`/paper/${encodeURIComponent(paperId)}/citations?${query}`, apiKey);
}

export async function scholarPaperReferences(
    paperId: string,
    options: {
        fields?: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? `citedPaper.${PAPER_FIELDS_DEFAULT}`,
        offset: options.offset,
        limit: options.limit ?? 20,
    });

    return s2Request(`/paper/${encodeURIComponent(paperId)}/references?${query}`, apiKey);
}

export async function scholarCitations(
    paperId: string,
    direction: 'citations' | 'references',
    limit: number = 20,
    apiKey?: string
): Promise<any> {
    if (direction === 'citations') {
        return scholarPaperCitations(paperId, { limit }, apiKey);
    }

    return scholarPaperReferences(paperId, { limit }, apiKey);
}

export async function scholarAuthorSearch(
    options: {
        query: string;
        fields?: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        query: options.query,
        fields: options.fields ?? AUTHOR_FIELDS_DEFAULT,
        offset: options.offset,
        limit: options.limit ?? 10,
    });

    return s2Request(`/author/search?${query}`, apiKey);
}

export async function scholarAuthorDetails(authorId: string, apiKey?: string, fields: string = AUTHOR_FIELDS_DEFAULT): Promise<any> {
    const query = buildQueryString({ fields });
    return s2Request(`/author/${encodeURIComponent(authorId)}?${query}`, apiKey);
}

export async function scholarAuthorPapers(
    authorId: string,
    options: {
        fields?: string;
        publicationDateOrYear?: string;
        offset?: number;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        publicationDateOrYear: options.publicationDateOrYear,
        offset: options.offset,
        limit: options.limit ?? 20,
    });

    return s2Request(`/author/${encodeURIComponent(authorId)}/papers?${query}`, apiKey);
}

export async function scholarAuthorBatch(authorIds: string[], apiKey?: string, fields: string = AUTHOR_FIELDS_DEFAULT): Promise<any> {
    const query = buildQueryString({ fields });
    return s2Request(`/author/batch?${query}`, apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: authorIds }),
    });
}

// ============================================================
// Recommendations API (separate base URL)
// ============================================================

const S2_RECOMMEND_URL = 'https://api.semanticscholar.org/recommendations/v1';

async function s2RecommendRequest(path: string, apiKey?: string, init?: RequestInit): Promise<any> {
    await checkRateLimit('semantic_scholar');

    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
    };

    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${S2_RECOMMEND_URL}${path}`, {
        ...init,
        headers,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Semantic Scholar Recommendations API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function scholarRecommendSingle(
    paperId: string,
    options: {
        fields?: string;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        limit: options.limit ?? 100,
    });

    return s2RecommendRequest(`/papers/forpaper/${encodeURIComponent(paperId)}?${query}`, apiKey);
}

export async function scholarRecommendList(
    options: {
        positivePaperIds: string[];
        negativePaperIds?: string[];
        fields?: string;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const query = buildQueryString({
        fields: options.fields ?? PAPER_FIELDS_DEFAULT,
        limit: options.limit ?? 100,
    });

    return s2RecommendRequest(`/papers/?${query}`, apiKey, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            positivePaperIds: options.positivePaperIds,
            negativePaperIds: options.negativePaperIds ?? [],
        }),
    });
}
