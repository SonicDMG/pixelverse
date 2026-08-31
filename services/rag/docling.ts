/**
 * Docling converters — two modes:
 *
 * A. Local-only  (DOCLING_SIDECAR_URL, no DOCLING_API_URL)
 *    POST /convert → sidecar runs DocumentConverter + export_to_doclang() locally.
 *
 * B. SaaS + sidecar  (both URLs set)
 *    SaaS handles the heavy OCR/layout work and returns a DoclingDocument JSON.
 *    Sidecar calls export_to_doclang() on that JSON locally → native DocLang.
 *    Best of both: cloud compute, local DocLang fidelity.
 *
 * C. SaaS-only  (DOCLING_API_URL only, no sidecar)
 *    SaaS returns Markdown; wrapped in pseudo-DocLang via convertToDocLang().
 *    Tables and location tags are lost — legacy fallback only.
 */

// ── Sidecar ───────────────────────────────────────────────────────────────────

export function isSidecarConfigured(): boolean {
  const url = process.env.DOCLING_SIDECAR_URL?.trim();
  return !!url && url !== '';
}

/**
 * POST the file to the Python sidecar and return native DocLang XML.
 *
 * If DOCLING_API_URL is also configured, uses /convert-saas so the sidecar
 * delegates to DoclingServiceClient (same path as Singularity) and then calls
 * export_to_doclang() locally — full fidelity with location tags, tables, etc.
 *
 * Otherwise falls back to /convert which runs DocumentConverter locally.
 */
export async function convertWithSidecar(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const baseUrl = process.env.DOCLING_SIDECAR_URL!.replace(/\/$/, '');
  const endpoint = isDoclingConfigured() ? '/convert-saas' : '/convert';

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), filename);

  console.log(`[sidecar] → ${endpoint} for ${filename}`);
  const resp = await fetch(`${baseUrl}${endpoint}`, { method: 'POST', body: form });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Sidecar ${endpoint} error ${resp.status}: ${body.slice(0, 300)}`);
  }

  const json = await resp.json();
  if (!json?.doclang) throw new Error(`Sidecar ${endpoint} returned no doclang field`);
  return json.doclang as string;
}

// ── SaaS ─────────────────────────────────────────────────────────────────────

export function isDoclingConfigured(): boolean {
  const url = process.env.DOCLING_API_URL?.trim();
  return !!url && url !== '';
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 10 * 60 * 1000; // 10 minutes

export async function convertWithDocling(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const baseUrl = process.env.DOCLING_API_URL!.replace(/\/$/, '');
  const apiKey  = process.env.DOCLING_API_KEY || '';
  const headers: Record<string, string> = {};
  if (apiKey) headers['X-Api-Key'] = apiKey;

  // ── 1. Submit ─────────────────────────────────────────────────────────────
  const form = new FormData();
  form.append('files', new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), filename);

  const submitResp = await fetch(`${baseUrl}/v1/convert/file/async`, {
    method: 'POST', headers, body: form,
  });
  if (!submitResp.ok) {
    const body = await submitResp.text().catch(() => '');
    throw new Error(`Docling submit error ${submitResp.status}: ${body.slice(0, 300)}`);
  }

  const submitJson = await submitResp.json();
  const taskId: string = submitJson?.task_id ?? submitJson?.id ?? submitJson?.[0]?.task_id;
  if (!taskId) throw new Error(`Docling: no task_id in response`);
  console.log(`[docling] task_id=${taskId} — polling…`);

  // ── 2. Poll ───────────────────────────────────────────────────────────────
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await _sleep(POLL_INTERVAL_MS);
    const pollResp = await fetch(`${baseUrl}/v1/status/poll/${taskId}`, { headers });
    if (!pollResp.ok) {
      const body = await pollResp.text().catch(() => '');
      throw new Error(`Docling poll error ${pollResp.status}: ${body.slice(0, 300)}`);
    }
    const pollJson = await pollResp.json();
    const status: string = (pollJson?.status ?? pollJson?.task_status ?? pollJson?.state ?? '').toLowerCase();
    if (!status) console.log(`[docling] poll raw:`, JSON.stringify(pollJson).slice(0, 200));
    else console.log(`[docling] task_id=${taskId} status=${status}`);
    if (status.includes('fail') || status.includes('error')) throw new Error(`Docling task failed`);
    if (status === 'success' || status === 'completed' || status === 'done') break;
  }
  if (Date.now() >= deadline) throw new Error(`Docling timed out after ${POLL_TIMEOUT_MS / 1000}s`);

  // ── 3. Fetch result ────────────────────────────────────────────────────────
  const resultResp = await fetch(`${baseUrl}/v1/result/${taskId}`, { headers });
  if (!resultResp.ok) {
    const body = await resultResp.text().catch(() => '');
    throw new Error(`Docling result error ${resultResp.status}: ${body.slice(0, 300)}`);
  }

  const resultJson = await resultResp.json();
  const docEntry = Array.isArray(resultJson?.documents)
    ? resultJson.documents[0]
    : (Array.isArray(resultJson) ? resultJson[0] : resultJson);

  const artifacts: Array<{ artifact_type?: string; uri?: string; content?: string }> =
    docEntry?.artifacts ?? [];

  console.log(`[docling] artifacts: ${artifacts.map(a => a.artifact_type).join(', ')}`);

  // ── 4. DoclingDocument JSON → sidecar export_to_doclang() (mode B) ────────
  // Prefer the JSON artifact so the sidecar can produce native DocLang.
  if (isSidecarConfigured()) {
    const jsonArtifact = artifacts.find(a => a.artifact_type?.toLowerCase().includes('json'));
    if (jsonArtifact) {
      let docJson: string;
      if (jsonArtifact.content) {
        docJson = typeof jsonArtifact.content === 'string'
          ? jsonArtifact.content
          : JSON.stringify(jsonArtifact.content);
      } else if (jsonArtifact.uri) {
        const r = await fetch(jsonArtifact.uri);
        if (!r.ok) throw new Error(`Docling JSON artifact fetch error ${r.status}`);
        docJson = await r.text();
      } else {
        throw new Error('Docling: JSON artifact has no content or uri');
      }
      console.log(`[docling] handing off DoclingDocument JSON (${docJson.length} chars) to sidecar`);
      return _exportJsonViaSidecar(docJson);
    }
    console.warn('[docling] no JSON artifact found — falling back to markdown');
  }

  // ── 5. Markdown fallback (mode C) ─────────────────────────────────────────
  const artifact = artifacts.find(a => a.artifact_type?.toLowerCase().includes('markdown'))
    ?? artifacts.find(a => a.artifact_type?.toLowerCase().includes('text'))
    ?? artifacts[0];

  if (!artifact) throw new Error(`Docling: no artifacts returned`);

  if (artifact.content) return artifact.content as string;

  if (artifact.uri) {
    const artResp = await fetch(artifact.uri);
    if (!artResp.ok) throw new Error(`Docling artifact fetch error ${artResp.status}`);
    return await artResp.text();
  }

  throw new Error(`Docling: artifact has no content or uri`);
}

/**
 * Send a raw DoclingDocument JSON string to the sidecar's /convert-json
 * endpoint and return the native DocLang XML string.
 */
async function _exportJsonViaSidecar(docJson: string): Promise<string> {
  const baseUrl = process.env.DOCLING_SIDECAR_URL!.replace(/\/$/, '');
  const resp = await fetch(`${baseUrl}/convert-json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: docJson,
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Sidecar /convert-json error ${resp.status}: ${body.slice(0, 300)}`);
  }
  const json = await resp.json();
  if (!json?.doclang) throw new Error('Sidecar /convert-json returned no doclang field');
  console.log(`[docling] ✔ sidecar export_to_doclang complete — ${(json.doclang as string).length} chars`);
  return json.doclang as string;
}

function _sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Made with Bob
