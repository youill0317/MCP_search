// ============================================================
// 입력 값 sanitize 유틸리티
// LLM이 파라미터에 불필요한 텍스트를 붙여 보내는 오류를 방어
// ============================================================

/**
 * 문자열 파라미터에서 불필요한 후미 텍스트를 제거합니다.
 *
 * LLM이 종종 파라미터 값 뒤에 메타데이터(인용수, 연도, 저자명 등)를
 * 붙여 보내는 경우가 있습니다. 이 함수는 해당 패턴을 감지하고 정리합니다.
 *
 * 예시:
 *   "10.36628/ijhf.2026.0001" → "10.36628/ijhf.2026.0001" (변화 없음)
 *   "arXiv:1706.03762" → "arXiv:1706.03762" (변화 없음)
 *   "10.36628/ijhf.2026.0001\"}215.7 2022 Yoo 한국" → "10.36628/ijhf.2026.0001"
 */
export function sanitizeStringParam(value: string): string {
    if (typeof value !== 'string') return value;

    let cleaned = value.trim();

    // 패턴 1: 닫는 중괄호/따옴표 이후에 텍스트가 붙어있는 경우 제거
    //   e.g. '10.1234/abc"}215.7 2022 Author' → '10.1234/abc'
    const trailingBraceIdx = cleaned.indexOf('"}');
    if (trailingBraceIdx !== -1) {
        cleaned = cleaned.substring(0, trailingBraceIdx);
    }

    // 패턴 2: 값 뒤에 숫자+공백 패턴이 붙어있는 경우 (인용수/연도)
    //   e.g. '10.1234/abc 215.7 2022 Author' → '10.1234/abc'
    //   단, DOI나 arXiv ID에 포함된 숫자/슬래시는 보존해야 함
    //   DOI 패턴: 10.XXXX/... (끝까지 유효한 문자)
    //   arXiv 패턴: arXiv:YYMM.NNNNN 또는 arXiv:YYMM.NNNNNvN
    if (cleaned.startsWith('arXiv:')) {
        // arXiv ID: arXiv:YYMM.NNNNN(vN) 형식만 유지
        const arxivMatch = cleaned.match(/^arXiv:\d{4}\.\d{4,5}(v\d+)?/);
        if (arxivMatch) {
            cleaned = arxivMatch[0];
        }
    } else if (cleaned.startsWith('PMID:')) {
        // PubMed ID: PMID:숫자만 유지
        const pmidMatch = cleaned.match(/^PMID:\d+/);
        if (pmidMatch) {
            cleaned = pmidMatch[0];
        }
    } else if (cleaned.startsWith('ACL:')) {
        // ACL ID: ACL:문자+숫자+하이픈 유지
        const aclMatch = cleaned.match(/^ACL:[A-Za-z0-9\-]+/);
        if (aclMatch) {
            cleaned = aclMatch[0];
        }
    } else if (/^10\.\d{4,}\//.test(cleaned)) {
        // DOI: 10.XXXX/ 뒤에 유효한 DOI 문자만 유지
        // DOI 유효 문자: 영숫자, -, ., _, ;, (, ), /, :
        const doiMatch = cleaned.match(/^10\.\d{4,}\/[A-Za-z0-9\-._;\(\)\/:]+/);
        if (doiMatch) {
            cleaned = doiMatch[0];
        }
    } else if (/^[0-9a-f]{40}$/i.test(cleaned.split(/\s/)[0])) {
        // Semantic Scholar hash ID (40 hex chars): 공백 이전까지만
        cleaned = cleaned.split(/\s/)[0];
    }

    return cleaned;
}
