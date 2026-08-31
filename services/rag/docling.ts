/**
 * Docling converters.
 *
 * Mode is driven by DOCLING_MODE env var:
 *   "local" — sidecar runs DocumentConverter + export_to_doclang() locally.
 *             Requires DOCLING_SIDECAR_URL.
 *   "saas"  — Docling SaaS handles OCR/layout; sidecar calls export_to_doclang()
 *             on the returned DoclingDocument JSON (full fidelity, cloud compute).
 *             Requires DOCLING_API_URL + DOCLING_API_KEY + DOCLING_SIDECAR_URL.
 */

export type DoclingMode = 'local' | 'saas';

export function getDoclingMode(): DoclingMode {
  const mode = process.env.DOCLING_MODE?.trim().toLowerCase();
  if (mode === 'saas') return 'saas';
  return 'local'; // default
}

// ── Sidecar ───────────────────────────────────────────────────────────────────

export function isSidecarConfigured(): boolean {
  const url = process.env.DOCLING_SIDECAR_URL?.trim();
  return !!url && url !== '';
}

/**
 * POST the file to the Python sidecar and return native DocLang XML.
 *
 * DOCLING_MODE=local  → /convert        (DocumentConverter runs on-device)
 * DOCLING_MODE=saas   → /convert-saas   (sidecar delegates to DoclingServiceClient)
 */
export async function convertWithSidecar(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const baseUrl = process.env.DOCLING_SIDECAR_URL!.replace(/\/$/, '');
  const endpoint = getDoclingMode() === 'saas' ? '/convert-saas' : '/convert';

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

// Internal validation only — use getDoclingMode() for routing decisions.
function isDoclingConfigured(): boolean {
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

  // ── 4. DoclingDocument JSON → sidecar export_to_doclang() ────────────────
  // Sidecar is always required in saas mode — hand the DoclingDocument JSON
  // to the sidecar so it can call export_to_doclang() locally.
  const jsonArtifact = artifacts.find(a => a.artifact_type?.toLowerCase().includes('json'));
  if (!jsonArtifact) {
    throw new Error(
      `Docling SaaS returned no JSON artifact (got: ${artifacts.map(a => a.artifact_type).join(', ') || 'none'}) — ` +
      `cannot produce native DocLang. Check SaaS configuration.`
    );
  }

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
