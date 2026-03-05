// ============================================================
// Usage checker MCP tool definition (1 tool)
// ============================================================

import { z } from 'zod';
import { tavilyUsage } from '../services/tavily-api.js';
import type { UsageInfo } from '../services/types.js';

export const usageTools = {
    check_usage: {
        description: `Check API usage and remaining credits for configured search services.

- **service**: Which service to check — "brave", "tavily", "exa", "semantic_scholar", "arxiv", or "all" (default). Tavily returns real-time usage data. Brave/Exa provide dashboard links. Semantic Scholar and arXiv are free (rate limits only).`,
        schema: z.object({
            service: z
                .enum(['brave', 'tavily', 'exa', 'semantic_scholar', 'arxiv', 'all'])
                .optional()
                .describe('Which service to check. "all" (default) checks every configured service. Use a specific service name to check just one.'),
        }),
        handler: async (args: any, config: { braveApiKey?: string; tavilyApiKey?: string; exaApiKey?: string }) => {
            const service = args.service ?? 'all';
            const results: UsageInfo[] = [];

            if (service === 'all' || service === 'brave') {
                results.push({
                    service: 'brave',
                    available: !!config.braveApiKey,
                    message: config.braveApiKey
                        ? 'Brave does not provide a usage API. Check your usage at: https://api-dashboard.search.brave.com'
                        : 'Brave API key not configured.',
                });
            }

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

            if (service === 'all' || service === 'exa') {
                results.push({
                    service: 'exa',
                    available: !!config.exaApiKey,
                    message: config.exaApiKey
                        ? 'Check Exa usage at: https://dashboard.exa.ai'
                        : 'Exa API key not configured.',
                });
            }

            if (service === 'all' || service === 'semantic_scholar') {
                results.push({
                    service: 'semantic_scholar',
                    available: true,
                    message: 'Free service. No usage limits (rate limits apply).',
                });
            }

            if (service === 'all' || service === 'arxiv') {
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
