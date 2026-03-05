import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadConfig, getEnabledServices } from './utils/config.js';
import { braveTools } from './tools/brave-search.js';
import { tavilyTools } from './tools/tavily-search.js';
import { exaTools } from './tools/exa-search.js';
import { scholarTools } from './tools/scholar-search.js';
import { arxivTools } from './tools/arxiv-search.js';
import { usageTools } from './tools/usage-checker.js';
import { sanitizeStringParam } from './utils/sanitizer.js';

function jsonToolResponse(data: unknown) {
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    };
}

export function createServer(): McpServer {
    const config = loadConfig();
    const enabledServices = getEnabledServices(config);

    const server = new McpServer({
        name: 'mcp-search',
        version: '1.0.0',
    });

    console.error(`[mcp-search] Enabled services: ${enabledServices.join(', ')}`);

    if (config.braveApiKey) {
        const apiKey = config.braveApiKey;

        server.tool('brave_web_search', braveTools.brave_web_search.description, braveTools.brave_web_search.schema.shape, async (args) => jsonToolResponse(await braveTools.brave_web_search.handler(args, apiKey)));
        server.tool('brave_news_search', braveTools.brave_news_search.description, braveTools.brave_news_search.schema.shape, async (args) => jsonToolResponse(await braveTools.brave_news_search.handler(args, apiKey)));
        server.tool('brave_image_search', braveTools.brave_image_search.description, braveTools.brave_image_search.schema.shape, async (args) => jsonToolResponse(await braveTools.brave_image_search.handler(args, apiKey)));
        server.tool('brave_video_search', braveTools.brave_video_search.description, braveTools.brave_video_search.schema.shape, async (args) => jsonToolResponse(await braveTools.brave_video_search.handler(args, apiKey)));
    } else {
        console.error('[mcp-search] Brave Search disabled (no BRAVE_API_KEY)');
    }

    if (config.tavilyApiKey) {
        const apiKey = config.tavilyApiKey;

        server.tool('tavily_search', tavilyTools.tavily_search.description, tavilyTools.tavily_search.schema.shape, async (args) => jsonToolResponse(await tavilyTools.tavily_search.handler(args, apiKey)));
        server.tool('tavily_extract', tavilyTools.tavily_extract.description, tavilyTools.tavily_extract.schema.shape, async (args) => jsonToolResponse(await tavilyTools.tavily_extract.handler(args, apiKey)));
        server.tool('tavily_crawl', tavilyTools.tavily_crawl.description, tavilyTools.tavily_crawl.schema.shape, async (args) => jsonToolResponse(await tavilyTools.tavily_crawl.handler(args, apiKey)));
        server.tool('tavily_map', tavilyTools.tavily_map.description, tavilyTools.tavily_map.schema.shape, async (args) => jsonToolResponse(await tavilyTools.tavily_map.handler(args, apiKey)));
        server.tool('tavily_image_search', tavilyTools.tavily_image_search.description, tavilyTools.tavily_image_search.schema.shape, async (args) => jsonToolResponse(await tavilyTools.tavily_image_search.handler(args, apiKey)));
    } else {
        console.error('[mcp-search] Tavily disabled (no TAVILY_API_KEY)');
    }

    if (config.exaApiKey) {
        const apiKey = config.exaApiKey;

        server.tool('exa_search', exaTools.exa_search.description, exaTools.exa_search.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_search.handler(args, apiKey)));
        server.tool('exa_contents', exaTools.exa_contents.description, exaTools.exa_contents.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_contents.handler(args, apiKey)));
        server.tool('exa_find_similar', exaTools.exa_find_similar.description, exaTools.exa_find_similar.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_find_similar.handler(args, apiKey)));
        server.tool('exa_search_advanced', exaTools.exa_search_advanced.description, exaTools.exa_search_advanced.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_search_advanced.handler(args, apiKey)));
        server.tool('exa_crawl', exaTools.exa_crawl.description, exaTools.exa_crawl.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_crawl.handler(args, apiKey)));
        server.tool('exa_people_search', exaTools.exa_people_search.description, exaTools.exa_people_search.schema.shape, async (args) => jsonToolResponse(await exaTools.exa_people_search.handler(args, apiKey)));
    } else {
        console.error('[mcp-search] Exa disabled (no EXA_API_KEY)');
    }

    const scholarApiKey = config.semanticScholarApiKey;

    server.tool('scholar_paper_search', scholarTools.scholar_paper_search.description, scholarTools.scholar_paper_search.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_paper_search.handler(args, scholarApiKey)));
    server.tool('scholar_paper_search_bulk', scholarTools.scholar_paper_search_bulk.description, scholarTools.scholar_paper_search_bulk.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_paper_search_bulk.handler(args, scholarApiKey)));
    server.tool('scholar_paper_search_match', scholarTools.scholar_paper_search_match.description, scholarTools.scholar_paper_search_match.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_paper_search_match.handler(args, scholarApiKey)));

    server.tool('scholar_paper_details', scholarTools.scholar_paper_details.description, scholarTools.scholar_paper_details.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_paper_details.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_paper_batch', scholarTools.scholar_paper_batch.description, scholarTools.scholar_paper_batch.schema.shape, async (args) => {
        const cleanIds = Array.isArray(args.paper_ids) ? args.paper_ids.map((id: string) => sanitizeStringParam(id)) : args.paper_ids;
        return jsonToolResponse(await scholarTools.scholar_paper_batch.handler({ ...args, paper_ids: cleanIds }, scholarApiKey));
    });

    server.tool('scholar_paper_authors', scholarTools.scholar_paper_authors.description, scholarTools.scholar_paper_authors.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_paper_authors.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_paper_citations', scholarTools.scholar_paper_citations.description, scholarTools.scholar_paper_citations.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_paper_citations.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_paper_references', scholarTools.scholar_paper_references.description, scholarTools.scholar_paper_references.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_paper_references.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_author_search', scholarTools.scholar_author_search.description, scholarTools.scholar_author_search.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_author_search.handler(args, scholarApiKey)));
    server.tool('scholar_author_details', scholarTools.scholar_author_details.description, scholarTools.scholar_author_details.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_author_details.handler(args, scholarApiKey)));
    server.tool('scholar_author_papers', scholarTools.scholar_author_papers.description, scholarTools.scholar_author_papers.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_author_papers.handler(args, scholarApiKey)));
    server.tool('scholar_author_batch', scholarTools.scholar_author_batch.description, scholarTools.scholar_author_batch.schema.shape, async (args) => jsonToolResponse(await scholarTools.scholar_author_batch.handler(args, scholarApiKey)));

    server.tool('scholar_citation_graph', scholarTools.scholar_citation_graph.description, scholarTools.scholar_citation_graph.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_citation_graph.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_recommend_single', scholarTools.scholar_recommend_single.description, scholarTools.scholar_recommend_single.schema.shape, async (args) => {
        const cleanId = sanitizeStringParam(args.paper_id);
        return jsonToolResponse(await scholarTools.scholar_recommend_single.handler({ ...args, paper_id: cleanId }, scholarApiKey));
    });

    server.tool('scholar_recommend_list', scholarTools.scholar_recommend_list.description, scholarTools.scholar_recommend_list.schema.shape, async (args) => {
        const cleanIds = Array.isArray(args.positive_paper_ids) ? args.positive_paper_ids.map((id: string) => sanitizeStringParam(id)) : args.positive_paper_ids;
        const cleanNegIds = Array.isArray(args.negative_paper_ids) ? args.negative_paper_ids.map((id: string) => sanitizeStringParam(id)) : args.negative_paper_ids;
        return jsonToolResponse(await scholarTools.scholar_recommend_list.handler({ ...args, positive_paper_ids: cleanIds, negative_paper_ids: cleanNegIds }, scholarApiKey));
    });

    server.tool('arxiv_search', arxivTools.arxiv_search.description, arxivTools.arxiv_search.schema.shape, async (args) => jsonToolResponse(await arxivTools.arxiv_search.handler(args)));

    server.tool('check_usage', usageTools.check_usage.description, usageTools.check_usage.schema.shape, async (args) => jsonToolResponse(await usageTools.check_usage.handler(args, config)));

    return server;
}
