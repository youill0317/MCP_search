// ============================================================
// arXiv API 클라이언트
// arXiv API는 Atom XML을 반환하므로 간이 XML 파서를 사용합니다.
// ============================================================

import { checkRateLimit } from '../utils/rate-limiter.js';

const ARXIV_BASE_URL = 'http://export.arxiv.org/api/query';

export async function arxivSearch(options: {
    query: string;
    category?: string;
    max_results?: number;
    sort_by?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
}): Promise<any[]> {
    await checkRateLimit('arxiv');

    let searchQuery = options.query;
    if (options.category) {
        searchQuery = `cat:${options.category}+AND+all:${encodeURIComponent(options.query)}`;
    } else {
        searchQuery = `all:${encodeURIComponent(options.query)}`;
    }

    const params = new URLSearchParams({
        search_query: searchQuery,
        start: '0',
        max_results: String(options.max_results ?? 10),
        sortBy: options.sort_by ?? 'relevance',
        sortOrder: 'descending',
    });

    const response = await fetch(`${ARXIV_BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`arXiv API error (${response.status})`);
    }

    const xml = await response.text();
    return parseArxivXml(xml);
}

/**
 * 간이 arXiv Atom XML 파서.
 * 외부 XML 라이브러리 의존성 없이 기본적인 파싱을 수행합니다.
 */
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
