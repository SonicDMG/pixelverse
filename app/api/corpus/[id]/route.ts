import { NextRequest, NextResponse } from 'next/server';
import { getWritableDb, rebuildFts } from '@/services/rag/db';

// ── GET /api/corpus/[id] ──────────────────────────────────────────────────────
// Returns document metadata + all sections (plain_text + heading).

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id?.trim()) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  try {
    const db = getWritableDb();

    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as
      | { id: string; title: string; url: string | null; source: string; theme: string; created_at: string }
      | undefined;

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const sections = db.prepare(`
      SELECT id, heading, plain_text, doclang, seq, page_num
      FROM sections
      WHERE doc_id = ?
      ORDER BY seq
    `).all(id) as Array<{
      id: string;
      heading: string | null;
      plain_text: string;
      doclang: string;
      seq: number;
      page_num: number | null;
    }>;

    return NextResponse.json({ doc, sections });
  } catch (err) {
    console.error('[GET /api/corpus/:id]', err);
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}

// ── DELETE /api/corpus/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id?.trim()) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  try {
    const db = getWritableDb();

    const doc = db.prepare('SELECT id FROM documents WHERE id = ?').get(id);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    db.prepare(`DELETE FROM vec_sections WHERE section_id IN (SELECT id FROM sections WHERE doc_id = ?)`).run(id);
    db.prepare('DELETE FROM sections WHERE doc_id = ?').run(id);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    rebuildFts(db);

    return NextResponse.json({ deleted: id });
  } catch (err) {
    console.error('[DELETE /api/corpus/:id]', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

// Made with Bob
