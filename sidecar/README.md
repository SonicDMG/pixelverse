# Docling → DocLang sidecar

A minimal FastAPI service that wraps `docling`'s `DocumentConverter` and returns
native DocLang XML via `export_to_doclang()`.

## Why

The Next.js upload route needs to turn PDFs/DOCX/PPTX into DocLang. The Docling
SaaS REST API only returns Markdown, so tables, `<location>` tags, and OTSL cell
markup are lost. Running `DocumentConverter` in-process (as Singularity does)
preserves all of that — but it requires Python. This sidecar bridges the gap.

## Setup

```bash
npm run setup:sidecar
```

## Run

Via npm (recommended — starts alongside Next.js):

```bash
npm run dev
```

Standalone (from the repo root):

```bash
sidecar/.venv/bin/uvicorn sidecar.main:app --port 7421
```

## API

### `POST /convert`

Multipart form upload. Returns native DocLang XML.

| Field | Type   | Description        |
|-------|--------|--------------------|
| file  | File   | PDF, DOCX, PPTX, … |

**Response**
```json
{ "doclang": "<document>…</document>" }
```

### `GET /health`

```json
{ "status": "ok" }
```

## Configuration

Set `DOCLING_SIDECAR_URL=http://localhost:7421` in `.env.local`. The Next.js
upload route prefers the sidecar over the SaaS fallback automatically.
