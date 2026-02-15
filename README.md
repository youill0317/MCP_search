# MCP Search Server

5개 검색 서비스를 통합하는 MCP(Model Context Protocol) 서버입니다.

## 서비스 & 도구 (12개)

| 서비스 | 도구 | 비용 |
|--------|------|------|
| **Brave Search** | `brave_web_search`, `brave_news_search`, `brave_image_search` | $5 크레딧/월 |
| **Tavily** | `tavily_search`, `tavily_extract` | 1,000 크레딧/월 |
| **Exa** | `exa_search`, `exa_answer` | $10 (1회) |
| **Semantic Scholar** | `scholar_paper_search`, `scholar_paper_details`, `scholar_citation_graph` | 무료 |
| **arXiv** | `arxiv_search` | 무료 |
| **유틸리티** | `check_usage` | — |

## 설치

```bash
npm install
npm run build
```

## 설정

`.env.example`을 `.env`로 복사하고 API 키를 입력하세요:

```bash
BRAVE_API_KEY=your-key
TAVILY_API_KEY=your-key
EXA_API_KEY=your-key
# SEMANTIC_SCHOLAR_API_KEY=optional-for-higher-rate-limits
```

> API 키가 없는 서비스는 자동 비활성화됩니다. Semantic Scholar와 arXiv는 키 없이 사용 가능합니다.

## 클라이언트 설정

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

## 개발

```bash
npm run dev    # tsx로 개발 모드 실행
npm run build  # tsup으로 빌드
npm start      # 빌드된 서버 실행
```
