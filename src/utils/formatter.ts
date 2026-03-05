import type {
    AuthorResult,
    CrawlResult,
    ExtractResult,
    ImageResult,
    MapResult,
    PagedResponse,
    PaperResult,
    ScholarMatchResult,
    SearchResult,
    VideoResult,
} from '../services/types.js';

function asArray<T = any>(value: any): T[] {
    return Array.isArray(value) ? value : [];
}

function cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

// ----- Brave -----

export function formatBraveWebResults(data: any): SearchResult[] {
    const results = asArray(data?.web?.results);
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.description ?? '',
        source: 'brave' as const,
        publishedDate: r.page_age ?? undefined,
        rawContent: asArray<string>(r.extra_snippets).join('\n') || undefined,
    }));
}

export function formatBraveNewsResults(data: any): SearchResult[] {
    const results = asArray(data?.news?.results);
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.description ?? '',
        source: 'brave' as const,
        publishedDate: r.age ?? r.page_age ?? undefined,
        author: r.meta_url?.hostname ?? undefined,
    }));
}

export function formatBraveImageResults(data: any): ImageResult[] {
    const results = asArray(data?.images?.results);
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.properties?.url ?? r.url ?? '',
        thumbnailUrl: r.thumbnail?.src ?? '',
        sourceUrl: r.url ?? '',
        width: r.properties?.width ?? undefined,
        height: r.properties?.height ?? undefined,
    }));
}

export function formatBraveVideoResults(data: any): VideoResult[] {
    const results = asArray(data?.videos?.results ?? data?.video?.results ?? data?.results);
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.description ?? r.snippet ?? '',
        source: 'brave' as const,
        thumbnailUrl: r.thumbnail?.src ?? r.thumbnail?.url ?? undefined,
        publishedDate: r.age ?? r.page_age ?? undefined,
        duration: r.video?.duration ?? r.duration ?? undefined,
        creator: r.creator ?? r.publisher ?? undefined,
    }));
}

// ----- Tavily -----

export function formatTavilySearchResults(data: any): SearchResult[] {
    return asArray(data?.results).map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.content ?? '',
        source: 'tavily' as const,
        publishedDate: r.published_date ?? undefined,
        score: r.score ?? undefined,
        rawContent: r.raw_content ?? undefined,
    }));
}

export function formatTavilyExtractResults(data: any): ExtractResult[] {
    return asArray(data?.results).map((r: any) => ({
        url: r.url ?? '',
        rawContent: r.raw_content ?? '',
        extractedAt: new Date().toISOString(),
    }));
}

export function formatTavilyCrawlResults(data: any): CrawlResult[] {
    return asArray(data?.results ?? data?.pages).map((r: any) => ({
        url: r.url ?? '',
        title: r.title ?? undefined,
        rawContent: r.raw_content ?? r.content ?? '',
        source: 'tavily' as const,
        extractedAt: new Date().toISOString(),
    }));
}

export function formatTavilyMapResults(data: any, rootUrl: string): MapResult {
    const urls = asArray<string>(data?.urls ?? data?.results).filter((u) => typeof u === 'string');
    return {
        rootUrl,
        urls,
        source: 'tavily' as const,
    };
}

export function formatTavilyImageResults(data: any): ImageResult[] {
    const images = asArray(data?.images ?? data?.results?.flatMap?.((r: any) => asArray(r.images)));
    return images.map((img: any) => {
        if (typeof img === 'string') {
            return {
                title: '',
                url: img,
                thumbnailUrl: img,
                sourceUrl: img,
                width: undefined,
                height: undefined,
            };
        }

        const imageUrl = img.url ?? img.image_url ?? '';
        return {
            title: img.title ?? img.alt ?? '',
            url: imageUrl,
            thumbnailUrl: img.thumbnail_url ?? imageUrl,
            sourceUrl: img.source_url ?? img.host_page ?? imageUrl,
            width: img.width ?? undefined,
            height: img.height ?? undefined,
        };
    });
}

// ----- Exa -----

export function formatExaSearchResults(data: any): SearchResult[] {
    const results = asArray(data?.results);
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

export function formatExaContentsResults(data: any): SearchResult[] {
    const results = asArray(data?.results);
    return results.map((r: any) => ({
        title: r.title ?? '',
        url: r.url ?? '',
        content: r.text?.substring(0, 500) ?? '',
        source: 'exa' as const,
        publishedDate: r.publishedDate ?? undefined,
        rawContent: r.text ?? undefined,
    }));
}

// ----- Semantic Scholar -----

export function formatSingleScholarPaper(p: any): PaperResult {
    return {
        title: p?.title ?? '',
        url: p?.url ?? (p?.paperId ? `https://www.semanticscholar.org/paper/${p.paperId}` : ''),
        abstract: p?.abstract ?? '',
        source: 'semantic_scholar' as const,
        authors: asArray(p?.authors).map((a: any) => a.name ?? '').filter(Boolean),
        year: p?.year ?? undefined,
        publishedDate: p?.publicationDate ?? undefined,
        doi: p?.externalIds?.DOI ?? undefined,
        citationCount: p?.citationCount ?? undefined,
        venue: p?.venue ?? undefined,
        categories: asArray<string>(p?.fieldsOfStudy).filter(Boolean),
        pdfUrl: p?.openAccessPdf?.url ?? undefined,
    };
}

export function formatScholarPaperResults(data: any): PaperResult[] {
    return asArray(data?.data).map((p: any) => formatSingleScholarPaper(p));
}

export function formatScholarPaperPage(data: any): PagedResponse<PaperResult> {
    return {
        data: formatScholarPaperResults(data),
        total: typeof data?.total === 'number' ? data.total : undefined,
        offset: typeof data?.offset === 'number' ? data.offset : undefined,
        next: typeof data?.next === 'number' ? data.next : undefined,
        token: typeof data?.token === 'string' ? data.token : undefined,
    };
}

export function formatScholarMatchResult(data: any): ScholarMatchResult {
    if (!data || !data.paperId) {
        return { matched: false };
    }

    return {
        matched: true,
        paper: formatSingleScholarPaper(data),
    };
}

export function formatScholarAuthor(author: any): AuthorResult {
    return {
        authorId: String(author?.authorId ?? ''),
        name: author?.name ?? '',
        source: 'semantic_scholar' as const,
        url: author?.url ?? (author?.authorId ? `https://www.semanticscholar.org/author/${author.authorId}` : undefined),
        affiliations: asArray<string>(author?.affiliations).filter(Boolean),
        paperCount: author?.paperCount ?? undefined,
        citationCount: author?.citationCount ?? undefined,
        hIndex: author?.hIndex ?? undefined,
        homepage: author?.homepage ?? undefined,
    };
}

export function formatScholarAuthorResults(data: any): AuthorResult[] {
    return asArray(data?.data).map((a: any) => formatScholarAuthor(a));
}

export function formatScholarAuthorPage(data: any): PagedResponse<AuthorResult> {
    return {
        data: formatScholarAuthorResults(data),
        total: typeof data?.total === 'number' ? data.total : undefined,
        offset: typeof data?.offset === 'number' ? data.offset : undefined,
        next: typeof data?.next === 'number' ? data.next : undefined,
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
