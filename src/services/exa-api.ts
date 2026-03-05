import { checkRateLimit } from '../utils/rate-limiter.js';

const EXA_BASE_URL = 'https://api.exa.ai';

async function exaRequest(endpoint: string, body: any, apiKey: string): Promise<any> {
    await checkRateLimit('exa');

    const response = await fetch(`${EXA_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Exa API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function exaSearch(
    apiKey: string,
    options: {
        query: string;
        num_results?: number;
        type?: 'auto' | 'neural' | 'keyword';
        include_text?: boolean;
    }
): Promise<any> {
    const body: any = {
        query: options.query,
        numResults: options.num_results ?? 10,
        type: options.type ?? 'auto',
    };

    if (options.include_text) {
        body.contents = { text: true };
    }

    return exaRequest('/search', body, apiKey);
}

export async function exaContents(
    apiKey: string,
    options: {
        urls: string[];
        include_text?: boolean;
    }
): Promise<any> {
    return exaRequest(
        '/contents',
        {
            ids: options.urls,
            text: options.include_text ?? true,
        },
        apiKey
    );
}

export async function exaFindSimilar(
    apiKey: string,
    options: {
        url: string;
        num_results?: number;
        include_text?: boolean;
        type?: 'auto' | 'neural' | 'keyword';
    }
): Promise<any> {
    const body: any = {
        url: options.url,
        numResults: options.num_results ?? 10,
        type: options.type ?? 'auto',
    };

    if (options.include_text) {
        body.contents = { text: true };
    }

    return exaRequest('/findSimilar', body, apiKey);
}

export async function exaSearchAdvanced(
    apiKey: string,
    options: {
        query: string;
        num_results?: number;
        type?: 'auto' | 'fast' | 'neural' | 'keyword';
        category?: string;
        include_domains?: string[];
        exclude_domains?: string[];
        start_published_date?: string;
        end_published_date?: string;
        start_crawl_date?: string;
        end_crawl_date?: string;
        include_text?: string[];
        exclude_text?: string[];
        user_location?: string;
        moderation?: boolean;
        text_max_characters?: number;
        livecrawl?: 'never' | 'fallback' | 'always' | 'preferred';
        livecrawl_timeout?: number;
        subpages?: number;
        subpage_target?: string[];
    }
): Promise<any> {
    const body: any = {
        query: options.query,
        numResults: options.num_results ?? 10,
        type: options.type ?? 'auto',
        contents: {
            text: options.text_max_characters ? { maxCharacters: options.text_max_characters } : true,
            livecrawl: options.livecrawl ?? 'fallback',
        },
    };

    if (options.category) body.category = options.category;
    if (options.include_domains?.length) body.includeDomains = options.include_domains;
    if (options.exclude_domains?.length) body.excludeDomains = options.exclude_domains;
    if (options.start_published_date) body.startPublishedDate = options.start_published_date;
    if (options.end_published_date) body.endPublishedDate = options.end_published_date;
    if (options.start_crawl_date) body.startCrawlDate = options.start_crawl_date;
    if (options.end_crawl_date) body.endCrawlDate = options.end_crawl_date;
    if (options.include_text?.length) body.includeText = options.include_text;
    if (options.exclude_text?.length) body.excludeText = options.exclude_text;
    if (options.user_location) body.userLocation = options.user_location;
    if (typeof options.moderation === 'boolean') body.moderation = options.moderation;
    if (options.livecrawl_timeout) body.contents.livecrawlTimeout = options.livecrawl_timeout;
    if (options.subpages) body.contents.subpages = options.subpages;
    if (options.subpage_target?.length) body.contents.subpageTarget = options.subpage_target;

    return exaRequest('/search', body, apiKey);
}

export async function exaCrawl(
    apiKey: string,
    options: {
        url: string;
        max_characters?: number;
    }
): Promise<any> {
    return exaRequest(
        '/contents',
        {
            ids: [options.url],
            contents: {
                text: {
                    maxCharacters: options.max_characters ?? 3000,
                },
                livecrawl: 'preferred',
            },
        },
        apiKey
    );
}

export async function exaPeopleSearch(
    apiKey: string,
    options: {
        query: string;
        num_results?: number;
        text_max_characters?: number;
    }
): Promise<any> {
    return exaRequest(
        '/search',
        {
            query: `${options.query} profile`,
            type: 'auto',
            numResults: options.num_results ?? 5,
            category: 'people',
            contents: {
                text: {
                    maxCharacters: options.text_max_characters ?? 3000,
                },
            },
        },
        apiKey
    );
}
