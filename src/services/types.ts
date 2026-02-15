// ============================================================
// 공통 타입 정의 — 모든 검색 서비스의 결과를 통일된 포맷으로 변환
// ============================================================

/** 웹/뉴스/AI 검색 결과 */
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

/** 학술 논문 검색 결과 */
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

/** 이미지 검색 결과 */
export interface ImageResult {
    title: string;
    url: string;
    thumbnailUrl: string;
    sourceUrl: string;
    width?: number;
    height?: number;
}

/** 콘텐츠 추출 결과 */
export interface ExtractResult {
    url: string;
    rawContent: string;
    extractedAt: string;
}

/** 답변 포함 검색 결과 */
export interface AnswerResponse {
    answer: string;
    results: SearchResult[];
}

/** 논문 인용 그래프 */
export interface CitationGraphResponse {
    paper: PaperResult;
    items: PaperResult[];
    direction: 'citations' | 'references';
    totalCount: number;
}

/** API 사용량 정보 */
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
