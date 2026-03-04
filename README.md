# MCP Search Server

MCP (Model Context Protocol) server that unifies multiple search providers.

## Supported Services and Tools (12)

| Service | Tools | Cost |
| --- | --- | --- |
| Brave Search | `brave_web_search`, `brave_news_search`, `brave_image_search` | Paid |
| Tavily | `tavily_search`, `tavily_extract` | Paid |
| Exa | `exa_search`, `exa_answer` | Paid |
| Semantic Scholar | `scholar_paper_search`, `scholar_paper_details`, `scholar_citation_graph` | Free |
| arXiv | `arxiv_search` | Free |
| Utility | `check_usage` | Free |

## Install

```bash
npm install
npm run build
```

## Configuration

Copy `.env.example` to `.env` and set the API keys you use.

```bash
BRAVE_API_KEY=your-key
TAVILY_API_KEY=your-key
EXA_API_KEY=your-key
# Optional: SEMANTIC_SCHOLAR_API_KEY=your-key
```

Notes:
- Services without keys are disabled automatically.
- Semantic Scholar and arXiv work without API keys.

## Client Setup

### Claude Desktop (`config.json`)

```json
{
  "mcpServers": {
    "search": {
      "command": "node",
      "args": ["C:/path/to/MCP_search/dist/index.js"],
      "env": {
        "BRAVE_API_KEY": "your-key",
        "TAVILY_API_KEY": "your-key",
        "EXA_API_KEY": "your-key"
      }
    }
  }
}
```

## check_usage Tool

`check_usage` accepts:
- `brave`
- `tavily`
- `exa`
- `semantic_scholar`
- `arxiv`
- `all` (default)

## Development

```bash
npm run dev
npm run build
npm start
```
