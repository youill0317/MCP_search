// ============================================================
// Request rate limiter (token bucket)
// ============================================================

interface RateLimitBucket {
    tokens: number;
    lastRefill: number;
    maxTokens: number;
    refillRate: number; // tokens per second
}

const buckets = new Map<string, RateLimitBucket>();
const serviceLocks = new Map<string, Promise<void>>();

/**
 * Default service-level limits
 */
const DEFAULT_LIMITS: Record<string, { maxTokens: number; refillRate: number }> = {
    brave: { maxTokens: 15, refillRate: 1 }, // 1 req/sec, burst 15
    tavily: { maxTokens: 10, refillRate: 1 }, // 1 req/sec, burst 10
    exa: { maxTokens: 10, refillRate: 1 }, // 1 req/sec, burst 10
    semantic_scholar: { maxTokens: 1, refillRate: 1 }, // strict 1 req/sec
    arxiv: { maxTokens: 5, refillRate: 0.33 }, // ~1 req/3sec
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

async function withServiceLock<T>(service: string, fn: () => Promise<T>): Promise<T> {
    const previous = (serviceLocks.get(service) ?? Promise.resolve()).catch(() => undefined);

    let release!: () => void;
    const current = new Promise<void>((resolve) => {
        release = resolve;
    });
    const tail = previous.then(() => current);
    serviceLocks.set(service, tail);

    await previous;
    try {
        return await fn();
    } finally {
        release();
        if (serviceLocks.get(service) === tail) {
            serviceLocks.delete(service);
        }
    }
}

/**
 * Wait until the request is allowed for a service.
 */
export async function checkRateLimit(service: string): Promise<void> {
    await withServiceLock(service, async () => {
        const bucket = getBucket(service);

        while (true) {
            refillBucket(bucket);

            if (bucket.tokens >= 1) {
                bucket.tokens = Math.max(0, bucket.tokens - 1);
                return;
            }

            const waitTime = Math.max(1, ((1 - bucket.tokens) / bucket.refillRate) * 1000);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    });
}

export function __resetRateLimiterForTests(): void {
    buckets.clear();
    serviceLocks.clear();
}

export function __getBucketSnapshotForTests(service: string): RateLimitBucket | undefined {
    const bucket = buckets.get(service);
    if (!bucket) return undefined;

    return {
        tokens: bucket.tokens,
        lastRefill: bucket.lastRefill,
        maxTokens: bucket.maxTokens,
        refillRate: bucket.refillRate,
    };
}
