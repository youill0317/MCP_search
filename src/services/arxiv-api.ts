import { checkRateLimit } from '../utils/rate-limiter.js';

const ARXIV_BASE_URL = 'http://export.arxiv.org/api/query';

export interface ArxivSearchOptions {
    query?: string;
    raw_query?: string;
    id_list?: string[];
    category?: string;
    start?: number;
    max_results?: number;
    sort_by?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
    sort_order?: 'ascending' | 'descending';
}

export async function arxivSearch(options: ArxivSearchOptions): Promise<any[]> {
    await checkRateLimit('arxiv');

    const params = new URLSearchParams({
        start: String(options.start ?? 0),
        max_results: String(options.max_results ?? 10),
        sortBy: options.sort_by ?? 'relevance',
        sortOrder: options.sort_order ?? 'descending',
    });

    const rawQuery = resolveArxivQuery(options);
    if (rawQuery) {
        params.set('search_query', rawQuery);
    }

    if (options.id_list && options.id_list.length > 0) {
        params.set('id_list', options.id_list.join(','));
    }

    if (!params.get('search_query') && !params.get('id_list')) {
        throw new Error('arXiv search requires one of query, raw_query, or id_list');
    }

    const response = await fetch(`${ARXIV_BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`arXiv API error (${response.status})`);
    }

    const xml = await response.text();
    return parseArxivXml(xml);
}

function resolveArxivQuery(options: ArxivSearchOptions): string | undefined {
    if (options.raw_query) {
        return options.raw_query;
    }

    if (options.query) {
        return buildSearchQuery(options.query, options.category);
    }

    return undefined;
}

function buildSearchQuery(query: string, category?: string): string {
    if (category) {
        return `cat:${category} AND all:${query}`;
    }
    return `all:${query}`;
}

function parseArxivXml(xml: string): any[] {
    const entries: any[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        const entry: any = {
            id: extractTag(entryXml, 'id'),
            title: extractTag(entryXml, 'title'),
            summary: extractTag(entryXml, 'summary'),
            published: extractTag(entryXml, 'published'),
            updated: extractTag(entryXml, 'updated'),
            doi: extractTag(entryXml, 'arxiv:doi'),
            author: extractAuthors(entryXml),
            category: extractCategories(entryXml),
            link: extractLinks(entryXml),
        };
        entries.push(entry);
    }

    return entries;
}

function extractTag(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = regex.exec(xml);
    return match ? match[1].trim() : undefined;
}

function extractAuthors(xml: string): any[] {
    const authors: any[] = [];
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g;
    let match;
    while ((match = authorRegex.exec(xml)) !== null) {
        authors.push({ name: match[1].trim() });
    }
    return authors;
}

function extractCategories(xml: string): any[] {
    const categories: any[] = [];
    const catRegex = /<category[^>]*term="([^"]*)"[^>]*\/>/g;
    let match;
    while ((match = catRegex.exec(xml)) !== null) {
        categories.push({ '@_term': match[1] });
    }
    return categories;
}

function extractLinks(xml: string): any[] {
    const links: any[] = [];
    const linkRegex = /<link([^>]*)\/?>/g;
    let match;
    while ((match = linkRegex.exec(xml)) !== null) {
        const attrs = match[1];
        const href = attrs.match(/href="([^"]*)"/)?.[1];
        const title = attrs.match(/title="([^"]*)"/)?.[1];
        const rel = attrs.match(/rel="([^"]*)"/)?.[1];
        const type = attrs.match(/type="([^"]*)"/)?.[1];
        if (href) {
            links.push({ '@_href': href, '@_title': title, '@_rel': rel, '@_type': type });
        }
    }
    return links;
}
