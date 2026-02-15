// ============================================================
// 검색 결과 포맷팅 — 각 서비스의 응답을 통일된 타입으로 변환
// ============================================================

import type { SearchResult, PaperResult, ImageResult } from '../services/types.js';

// ----- Brave Search -----

export function formatBraveWebResults(data: any): SearchResult[] {
    const results = data?.web?.results ?? [];
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.description ?? '',
        source: 'brave' as const,
        publishedDate: r.page_age ?? undefined,
        score: undefined,
        author: undefined,
        rawContent: r.extra_snippets?.join('\n') ?? undefined,
    }));
}

export function formatBraveNewsResults(data: any): SearchResult[] {
    const results = data?.news?.results ?? [];
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.description ?? '',
        source: 'brave' as const,
        publishedDate: r.age ?? r.page_age ?? undefined,
        score: undefined,
        author: r.meta_url?.hostname ?? undefined,
    }));
}

export function formatBraveImageResults(data: any): ImageResult[] {
    const results = data?.images?.results ?? [];
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.properties?.url ?? r.url ?? '',
        thumbnailUrl: r.thumbnail?.src ?? '',
        sourceUrl: r.url ?? '',
        width: r.properties?.width ?? undefined,
        height: r.properties?.height ?? undefined,
    }));
}

// ----- Tavily -----

export function formatTavilySearchResults(data: any): { answer?: string; results: SearchResult[] } {
    const results = (data?.results ?? []).map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.content ?? '',
        source: 'tavily' as const,
        publishedDate: r.published_date ?? undefined,
        score: r.score ?? undefined,
        author: undefined,
        rawContent: r.raw_content ?? undefined,
    }));
    return {
        answer: data?.answer ?? undefined,
        results,
    };
}

// ----- Exa -----

export function formatExaSearchResults(data: any): SearchResult[] {
    const results = data?.results ?? [];
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.summary ?? r.text?.substring(0, 500) ?? '',
        source: 'exa' as const,
        publishedDate: r.publishedDate ?? undefined,
        score: r.score ?? undefined,
        author: r.author ?? undefined,
        rawContent: r.text ?? undefined,
    }));
}

export function formatExaAnswerResponse(data: any): { answer: string; results: SearchResult[] } {
    return {
        answer: data?.answer ?? '',
        results: formatExaSearchResults(data),
    };
}

// ----- Semantic Scholar -----

export function formatScholarPaperResults(data: any): PaperResult[] {
    const papers = data?.data ?? [];
    return papers.map((p: any) => formatSingleScholarPaper(p));
}

export function formatSingleScholarPaper(p: any): PaperResult {
    return {
        title: p.title ?? '',
        url: p.url ?? `https://www.semanticscholar.org/paper/${p.paperId}`,
        abstract: p.abstract ?? '',
        source: 'semantic_scholar' as const,
        authors: (p.authors ?? []).map((a: any) => a.name ?? ''),
        year: p.year ?? undefined,
        publishedDate: p.publicationDate ?? undefined,
        doi: p.externalIds?.DOI ?? undefined,
        citationCount: p.citationCount ?? undefined,
        venue: p.venue ?? undefined,
        categories: p.fieldsOfStudy ?? undefined,
        pdfUrl: p.openAccessPdf?.url ?? undefined,
    };
}

// ----- arXiv -----

export function formatArxivResults(entries: any[]): PaperResult[] {
    return entries.map((entry: any) => ({
        title: cleanText(entry.title ?? ''),
        url: entry.id ?? '',
        abstract: cleanText(entry.summary ?? ''),
        source: 'arxiv' as const,
        authors: Array.isArray(entry.author)
            ? entry.author.map((a: any) => a.name ?? '')
            : entry.author?.name ? [entry.author.name] : [],
        year: entry.published ? new Date(entry.published).getFullYear() : undefined,
        publishedDate: entry.published ?? undefined,
        doi: entry.doi ?? undefined,
        citationCount: undefined,
        venue: undefined,
        categories: Array.isArray(entry.category)
            ? entry.category.map((c: any) => c?.['@_term'] ?? c)
            : entry.category?.['@_term'] ? [entry.category['@_term']] : [],
        pdfUrl: Array.isArray(entry.link)
            ? entry.link.find((l: any) => l['@_title'] === 'pdf')?.['@_href'] ?? undefined
            : undefined,
    }));
}

/** arXiv의 텍스트에서 불필요한 공백/줄바꿈 제거 */
function cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}
