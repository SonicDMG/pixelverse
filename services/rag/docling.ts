/**
 * Docling SaaS client — convert uploaded files to DocLang XML.
 *
 * Reads DOCLING_API_URL + DOCLING_API_KEY from env.
 * If DOCLING_API_URL is not set, isDoclingConfigured() returns false and
 * callers should fall back to plain-text ingestion.
 *
 * API contract (Docling SaaS):
 *   POST {DOCLING_API_URL}/v1/convert/file
 *   Content-Type: multipart/form-data
 *   Field: "file" — the uploaded file bytes
 *   Field: "output_format" — "doctags" (DocLang XML)
 *   Response: { document: { doclang_backend: { ... }, export_formats: { doctags: "<document>..." } } }
 *
 * Returns the raw DocLang XML string.
 */

export function isDoclingConfigured(): boolean {
  const url = process.env.DOCLING_API_URL?.trim();
  return !!url && url !== '';
}

/**
 * Send a file buffer to Docling SaaS and return DocLang XML.
 *
 * @param fileBuffer  Raw file bytes
 * @param filename    Original filename (used as the multipart filename)
 * @param mimeType    MIME type of the file
 */
export async function convertWithDocling(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const baseUrl = process.env.DOCLING_API_URL!.replace(/\/$/, '');
  const apiKey = process.env.DOCLING_API_KEY || '';

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), filename);
  form.append('output_format', 'doctags');

  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const resp = await fetch(`${baseUrl}/v1/convert/file`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Docling API error ${resp.status}: ${body.slice(0, 200)}`);
  }

  const json = await resp.json();

  // Docling response shape: { document: { export_formats: { doctags: "..." } } }
  const doclang =
    json?.document?.export_formats?.doctags ??
    json?.doctags ??
    json?.doclang ??
    null;

  if (typeof doclang !== 'string' || !doclang.trim()) {
    throw new Error('Docling returned no DocLang content');
  }

  return doclang;
}

// Made with Bob
