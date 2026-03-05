import { checkRateLimit } from '../utils/rate-limiter.js';

const TAVILY_BASE_URL = 'https://api.tavily.com';

interface TavilySearchOptions {
    query: string;
    search_depth?: 'basic' | 'advanced';
    include_raw_content?: boolean;
    max_results?: number;
    include_domains?: string[];
    exclude_domains?: string[];
    topic?: 'general' | 'news';
    days?: number;
    time_range?: 'day' | 'week' | 'month' | 'year';
}

interface TavilyCrawlOptions {
    url: string;
    max_depth?: number;
    max_breadth?: number;
    limit?: number;
    instructions?: string;
    select_paths?: string[];
    exclude_paths?: string[];
    allow_external?: boolean;
}

interface TavilyMapOptions {
    url: string;
    max_depth?: number;
    max_breadth?: number;
    max_results?: number;
    select_paths?: string[];
    exclude_paths?: string[];
    allow_external?: boolean;
}

async function tavilyPost(endpoint: string, apiKey: string, body: Record<string, any>): Promise<any> {
    await checkRateLimit('tavily');

    const response = await fetch(`${TAVILY_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function tavilySearch(apiKey: string, options: TavilySearchOptions): Promise<any> {
    return tavilyPost('/search', apiKey, {
        query: options.query,
        search_depth: options.search_depth ?? 'basic',
        include_raw_content: options.include_raw_content ?? false,
        max_results: options.max_results ?? 10,
        include_domains: options.include_domains,
        exclude_domains: options.exclude_domains,
        topic: options.topic,
        days: options.days,
        time_range: options.time_range,
        include_answer: false,
        include_images: false,
    });
}

export async function tavilyImageSearch(apiKey: string, options: TavilySearchOptions): Promise<any> {
    return tavilyPost('/search', apiKey, {
        query: options.query,
        search_depth: options.search_depth ?? 'basic',
        max_results: options.max_results ?? 10,
        include_domains: options.include_domains,
        exclude_domains: options.exclude_domains,
        topic: options.topic,
        days: options.days,
        time_range: options.time_range,
        include_answer: false,
        include_images: true,
    });
}

export async function tavilyExtract(apiKey: string, urls: string[]): Promise<any> {
    return tavilyPost('/extract', apiKey, {
        urls,
    });
}

export async function tavilyCrawl(apiKey: string, options: TavilyCrawlOptions): Promise<any> {
    return tavilyPost('/crawl', apiKey, {
        url: options.url,
        max_depth: options.max_depth,
        max_breadth: options.max_breadth,
        limit: options.limit,
        instructions: options.instructions,
        select_paths: options.select_paths,
        exclude_paths: options.exclude_paths,
        allow_external: options.allow_external,
    });
}

export async function tavilyMap(apiKey: string, options: TavilyMapOptions): Promise<any> {
    return tavilyPost('/map', apiKey, {
        url: options.url,
        max_depth: options.max_depth,
        max_breadth: options.max_breadth,
        max_results: options.max_results,
        select_paths: options.select_paths,
        exclude_paths: options.exclude_paths,
        allow_external: options.allow_external,
    });
}

export async function tavilyUsage(apiKey: string): Promise<any> {
    const response = await fetch(`${TAVILY_BASE_URL}/usage`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily Usage API error (${response.status}): ${text}`);
    }

    return response.json();
}
