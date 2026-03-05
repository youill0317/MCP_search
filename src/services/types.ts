export interface SearchResult {
    title: string;
    url: string;
    content: string;
    source: 'brave' | 'tavily' | 'exa';
    publishedDate?: string;
    score?: number;
    author?: string;
    rawContent?: string;
}

export interface PaperResult {
    title: string;
    url: string;
    abstract: string;
    source: 'semantic_scholar' | 'arxiv';
    authors: string[];
    year?: number;
    publishedDate?: string;
    doi?: string;
    citationCount?: number;
    venue?: string;
    categories?: string[];
    pdfUrl?: string;
}

export interface ImageResult {
    title: string;
    url: string;
    thumbnailUrl: string;
    sourceUrl: string;
    width?: number;
    height?: number;
}

export interface VideoResult {
    title: string;
    url: string;
    content: string;
    source: 'brave';
    thumbnailUrl?: string;
    publishedDate?: string;
    duration?: string;
    creator?: string;
}

export interface ExtractResult {
    url: string;
    rawContent: string;
    extractedAt: string;
}

export interface CrawlResult {
    url: string;
    title?: string;
    rawContent: string;
    source: 'tavily';
    extractedAt: string;
}

export interface MapResult {
    rootUrl: string;
    urls: string[];
    source: 'tavily';
}

export interface AuthorResult {
    authorId: string;
    name: string;
    source: 'semantic_scholar';
    url?: string;
    affiliations?: string[];
    paperCount?: number;
    citationCount?: number;
    hIndex?: number;
    homepage?: string;
}

export interface ScholarMatchResult {
    matched: boolean;
    paper?: PaperResult;
}

export interface PagedResponse<T> {
    data: T[];
    total?: number;
    offset?: number;
    next?: number;
    token?: string;
}

export interface CitationGraphResponse {
    paper: PaperResult;
    items: PaperResult[];
    direction: 'citations' | 'references';
    totalCount: number;
}

export interface UsageInfo {
    service: string;
    available: boolean;
    usage?: {
        used: number;
        limit?: number;
        remaining?: number;
        resetDate?: string;
    };
    message?: string;
}
