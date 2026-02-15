// ============================================================
// 사용량 조회 MCP 도구 정의 (1개 도구)
// ============================================================

import { z } from 'zod';
import { tavilyUsage } from '../services/tavily-api.js';
import type { UsageInfo } from '../services/types.js';

export const usageTools = {
    check_usage: {
        description: `Check API usage and remaining credits for configured search services.

**When to use:** Before making many API calls, to check if credits are running low, or when the user asks about remaining API quota.
**Supported services:**
- **Tavily:** Returns real-time usage data via API (used credits, remaining credits, reset date).
- **Brave:** No API for usage — provides a link to the web dashboard.
- **Exa:** No API for usage — provides a link to the web dashboard.
- **Semantic Scholar & arXiv:** Free services with no usage limits (only rate limits apply).
**Returns:** Array of UsageInfo objects with service name, availability status, and usage details.

**Examples:**
- Check all services: { "service": "all" } or {}
- Check Tavily only: { "service": "tavily" }
- Check Brave only: { "service": "brave" }`,
        schema: z.object({
            service: z.enum(['brave', 'tavily', 'exa', 'all']).optional().describe('Which service to check. "all" (default) checks every configured service. Use a specific service name to check just one. Example: "tavily"'),
        }),
        handler: async (args: any, config: { braveApiKey?: string; tavilyApiKey?: string; exaApiKey?: string }) => {
            const service = args.service ?? 'all';
            const results: UsageInfo[] = [];

            // Brave
            if (service === 'all' || service === 'brave') {
                results.push({
                    service: 'brave',
                    available: !!config.braveApiKey,
                    message: config.braveApiKey
                        ? 'Brave does not provide a usage API. Check your usage at: https://api-dashboard.search.brave.com'
                        : 'Brave API key not configured.',
                });
            }

            // Tavily
            if (service === 'all' || service === 'tavily') {
                if (config.tavilyApiKey) {
                    try {
                        const data = await tavilyUsage(config.tavilyApiKey);
                        results.push({
                            service: 'tavily',
                            available: true,
                            usage: {
                                used: data?.total_usage ?? data?.used ?? 0,
                                limit: data?.limit ?? undefined,
                                remaining: data?.remaining ?? undefined,
                                resetDate: data?.reset_date ?? undefined,
                            },
                        });
                    } catch (e: any) {
                        results.push({
                            service: 'tavily',
                            available: true,
                            message: `Failed to fetch usage: ${e.message}`,
                        });
                    }
                } else {
                    results.push({
                        service: 'tavily',
                        available: false,
                        message: 'Tavily API key not configured.',
                    });
                }
            }

            // Exa
            if (service === 'all' || service === 'exa') {
                results.push({
                    service: 'exa',
                    available: !!config.exaApiKey,
                    message: config.exaApiKey
                        ? 'Check Exa usage at: https://dashboard.exa.ai'
                        : 'Exa API key not configured.',
                });
            }

            // Semantic Scholar & arXiv: 무료, 사용량 제한 없음
            if (service === 'all') {
                results.push({
                    service: 'semantic_scholar',
                    available: true,
                    message: 'Free service. No usage limits (rate limits apply).',
                });
                results.push({
                    service: 'arxiv',
                    available: true,
                    message: 'Free service. No usage limits (rate limits apply).',
                });
            }

            return results;
        },
    },
};
