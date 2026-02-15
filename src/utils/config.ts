// ============================================================
// 환경변수 / API 키 관리
// ============================================================

export interface ServiceConfig {
    braveApiKey?: string;
    tavilyApiKey?: string;
    exaApiKey?: string;
    semanticScholarApiKey?: string;
}

/**
 * 환경변수에서 API 키를 로드합니다.
 * 키가 없는 서비스는 해당 도구가 비활성화됩니다.
 */
export function loadConfig(): ServiceConfig {
    return {
        braveApiKey: process.env.BRAVE_API_KEY,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        exaApiKey: process.env.EXA_API_KEY,
        semanticScholarApiKey: process.env.SEMANTIC_SCHOLAR_API_KEY,
    };
}

/**
 * 활성화된 서비스 목록을 반환합니다.
 */
export function getEnabledServices(config: ServiceConfig): string[] {
    const services: string[] = [];
    if (config.braveApiKey) services.push('brave');
    if (config.tavilyApiKey) services.push('tavily');
    if (config.exaApiKey) services.push('exa');
    // Semantic Scholar와 arXiv는 API 키 없이도 사용 가능
    services.push('semantic_scholar', 'arxiv');
    return services;
}
