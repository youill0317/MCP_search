// ============================================================
// 요청 제한 관리 — 간단한 토큰 버킷 기반 rate limiter
// ============================================================

interface RateLimitBucket {
    tokens: number;
    lastRefill: number;
    maxTokens: number;
    refillRate: number; // tokens per second
}

const buckets = new Map<string, RateLimitBucket>();

/**
 * 서비스별 기본 rate limit 설정
 */
const DEFAULT_LIMITS: Record<string, { maxTokens: number; refillRate: number }> = {
    brave: { maxTokens: 15, refillRate: 1 },       // 1 req/sec, burst 15
    tavily: { maxTokens: 10, refillRate: 1 },       // 1 req/sec, burst 10
    exa: { maxTokens: 10, refillRate: 1 },          // 1 req/sec, burst 10
    semantic_scholar: { maxTokens: 1, refillRate: 1 },   // 1 req/sec (strict: no burst allowed)
    arxiv: { maxTokens: 5, refillRate: 0.33 },      // ~1 req/3sec (arXiv is slow)
};

function getBucket(service: string): RateLimitBucket {
    let bucket = buckets.get(service);
    if (!bucket) {
        const config = DEFAULT_LIMITS[service] ?? { maxTokens: 10, refillRate: 1 };
        bucket = {
            tokens: config.maxTokens,
            lastRefill: Date.now(),
            maxTokens: config.maxTokens,
            refillRate: config.refillRate,
        };
        buckets.set(service, bucket);
    }
    return bucket;
}

function refillBucket(bucket: RateLimitBucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;
}

/**
 * rate limit을 확인하고 요청을 허용할지 결정합니다.
 * 허용되면 true, 제한이면 대기 후 true를 반환합니다.
 */
export async function checkRateLimit(service: string): Promise<void> {
    const bucket = getBucket(service);
    refillBucket(bucket);

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return;
    }

    // 토큰이 부족하면 대기
    const waitTime = (1 - bucket.tokens) / bucket.refillRate * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    refillBucket(bucket);
    bucket.tokens -= 1;
}
