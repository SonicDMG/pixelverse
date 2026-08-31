/**
 * Docling SaaS client — convert uploaded files to Markdown.
 *
 * Flow:
 *   1. POST /v1/convert/file/async  → { task_id }
 *   2. Poll GET /v1/status/poll/{task_id} until done
 *   3. GET /v1/result/{task_id}     → fetch markdown artifact URI → string
 *
 * Returns raw Markdown, which convertToDocLang() handles downstream.
 */

export function isDoclingConfigured(): boolean {
  const url = process.env.DOCLING_API_URL?.trim();
  return !!url && url !== '';
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 5 * 60 * 1000; // 5 minutes

export async function convertWithDocling(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
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

  // ── 2. Poll ───────────────────────────────────────────────────────────────
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await _sleep(POLL_INTERVAL_MS);
    const pollResp = await fetch(`${baseUrl}/v1/status/poll/${taskId}`, { headers });
    if (!pollResp.ok) {
      const body = await pollResp.text().catch(() => '');
      throw new Error(`Docling poll error ${pollResp.status}: ${body.slice(0, 300)}`);
    }
    const status: string = ((await pollResp.json())?.status ?? '').toLowerCase();
    if (status.includes('fail') || status.includes('error')) throw new Error(`Docling task failed`);
    if (status === 'success' || status === 'completed' || status === 'done') break;
  }
  if (Date.now() >= deadline) throw new Error(`Docling timed out after ${POLL_TIMEOUT_MS / 1000}s`);

  // ── 3. Result ─────────────────────────────────────────────────────────────
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

  // Pick the best artifact: markdown > text (anything will do)
  const artifact = artifacts.find(a => a.artifact_type?.toLowerCase().includes('markdown'))
    ?? artifacts.find(a => a.artifact_type?.toLowerCase().includes('text'))
    ?? artifacts[0];

  if (!artifact) throw new Error(`Docling: no artifacts returned`);

  // Inline content
  if (artifact.content) return artifact.content;

  // Pre-signed S3 URL — no auth headers needed
  if (artifact.uri) {
    const artResp = await fetch(artifact.uri);
    if (!artResp.ok) throw new Error(`Docling artifact fetch error ${artResp.status}`);
    return await artResp.text();
  }

  throw new Error(`Docling: artifact has no content or uri`);
}

function _sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Made with Bob
