"""
Docling → DocLang sidecar.

Endpoints:
  POST /convert        multipart: file=<bytes>  — local DocumentConverter
  POST /convert-saas   multipart: file=<bytes>  — DoclingServiceClient → SaaS
  POST /convert-json   body: DoclingDocument JSON
  Returns: { "doclang": "<document>…</document>" }

Run:
  uvicorn sidecar.main:app --port 7421
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

# Load .env.local from the project root (parent of the sidecar/ directory)
# so DOCLING_SERVICE_URL / DOCLING_API_KEY are available without shell exports.
_env_path = Path(__file__).parent.parent / ".env.local"
if _env_path.exists():
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(title="docling-doclang-sidecar", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/convert-saas")
async def convert_saas(file: UploadFile = File(...)) -> dict:
    """
    Upload a file to Docling SaaS via DoclingServiceClient, receive the
    DoclingDocument, and return native DocLang via export_to_doclang().

    Requires DOCLING_SERVICE_URL and DOCLING_API_KEY env vars.
    """
    import os
    import time
    import tempfile
    from pathlib import Path as _Path

    service_url = os.environ.get("DOCLING_API_URL", "").strip()
    api_key = os.environ.get("DOCLING_API_KEY", "").strip()
    if not service_url or not api_key:
        raise HTTPException(
            status_code=422,
            detail="DOCLING_API_URL and DOCLING_API_KEY must be set in .env.local",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    suffix = _Path(file.filename or "upload").suffix or ".bin"
    kb = len(content) / 1024
    log.info("▶ /convert-saas received '%s' (%.1f KB)", file.filename, kb)

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = _Path(tmp.name)

    try:
        t0 = time.monotonic()
        from docling.service_client import DoclingServiceClient
        from docling.service_client.client import ConvertDocumentsRequestOptions

        opts = ConvertDocumentsRequestOptions(do_ocr=True, do_table_structure=True)
        log.info("→ DoclingServiceClient.convert() starting…")
        with DoclingServiceClient(url=service_url, api_key=api_key) as client:
            result = client.convert(source=tmp_path, options=opts)

        log.info("  SaaS convert done in %.2fs", time.monotonic() - t0)
        doc = result.document

        t1 = time.monotonic()
        doclang = doc.export_to_doclang()
        log.info("  export_to_doclang() done in %.2fs — %d chars", time.monotonic() - t1, len(doclang))

        import re
        log.info(
            "  structure — headings:%d text:%d tables:%d locations:%d",
            len(re.findall(r"<heading", doclang)),
            len(re.findall(r"<text", doclang)),
            len(re.findall(r"<table", doclang)),
            len(re.findall(r"<location", doclang)),
        )
        return {"doclang": doclang}
    except Exception as exc:
        log.exception("✖ /convert-saas failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        tmp_path.unlink(missing_ok=True)


@app.post("/convert-json")
async def convert_json(request: Request) -> dict:
    """
    Accept a raw DoclingDocument JSON body (from the SaaS result artifact),
    call export_to_doclang() locally, and return { "doclang": "..." }.

    Used in mode B: SaaS does OCR/layout, we do the DocLang export.
    """
    import time
    from docling_core.types.doc import DoclingDocument

    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty body")

    log.info("▶ /convert-json received %d bytes", len(body))
    t0 = time.monotonic()

    try:
        import json as _json
        raw = _json.loads(body)
        doc = DoclingDocument.model_validate(raw)
        log.info("  DoclingDocument parsed — %d pages", len(doc.pages or {}))

        log.info("→ export_to_doclang() starting…")
        doclang = doc.export_to_doclang()
        t_export = time.monotonic() - t0

        import re
        n_headings   = len(re.findall(r"<heading", doclang))
        n_tables     = len(re.findall(r"<table", doclang))
        n_text       = len(re.findall(r"<text", doclang))
        n_locations  = len(re.findall(r"<location", doclang))
        n_pagebreaks = len(re.findall(r"<page_break", doclang))
        log.info(
            "✔ export_to_doclang() done in %.2fs — %d chars | headings:%d text:%d tables:%d locations:%d page_breaks:%d",
            t_export, len(doclang), n_headings, n_text, n_tables, n_locations, n_pagebreaks,
        )
        return {"doclang": doclang}
    except Exception as exc:
        log.exception("✖ /convert-json failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/convert")
async def convert(file: UploadFile = File(...)) -> dict:
    """
    Accept an uploaded file, run DocumentConverter, and return the
    DocLang export produced by docling_core's export_to_doclang().
    """
    import time
    from docling.document_converter import DocumentConverter

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    kb = len(content) / 1024
    suffix = Path(file.filename or "upload").suffix or ".bin"
    log.info("▶ received '%s' (%.1f KB) suffix=%s", file.filename, kb, suffix)

    # Write to a temp file — DocumentConverter needs a real path
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    log.info("  temp file → %s", tmp_path)

    try:
        t0 = time.monotonic()
        log.info("→ DocumentConverter.convert() starting…")
        converter = DocumentConverter()
        result = converter.convert(str(tmp_path))
        t_convert = time.monotonic() - t0
        log.info("  convert() done in %.2fs", t_convert)

        doc = result.document
        page_count = len(result.pages or [])
        log.info("  pages detected: %d", page_count)

        t1 = time.monotonic()
        log.info("→ export_to_doclang() starting…")
        doclang = doc.export_to_doclang()
        t_export = time.monotonic() - t1
        log.info("  export_to_doclang() done in %.2fs — %d chars", t_export, len(doclang))

        # Quick structural summary so you can spot parse quality at a glance
        import re
        n_headings  = len(re.findall(r"<heading", doclang))
        n_tables    = len(re.findall(r"<table", doclang))
        n_text      = len(re.findall(r"<text", doclang))
        n_locations = len(re.findall(r"<location", doclang))
        n_pagebreaks = len(re.findall(r"<page_break", doclang))
        log.info(
            "  doclang structure — headings:%d  text:%d  tables:%d  locations:%d  page_breaks:%d",
            n_headings, n_text, n_tables, n_locations, n_pagebreaks,
        )
        log.info("✔ total %.2fs", time.monotonic() - t0)

        return {"doclang": doclang}
    except Exception as exc:
        log.exception("✖ conversion failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        tmp_path.unlink(missing_ok=True)
        log.info("  temp file cleaned up")
