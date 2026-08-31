import { NextRequest, NextResponse } from 'next/server';
import { getWritableDb, rebuildFts } from '@/services/rag/db';

// ── DELETE /api/corpus/[id] ───────────────────────────────────────────────────
// Removes document + its sections + embeddings (CASCADE handles sections/vec).

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id?.trim()) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const db = getWritableDb();

    // Verify the document exists
    const doc = db.prepare('SELECT id, source FROM documents WHERE id = ?').get(id) as
      | { id: string; source: string }
      | undefined;

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete section embeddings first (vec_sections has no FK cascade)
    db.prepare(`
      DELETE FROM vec_sections
      WHERE section_id IN (SELECT id FROM sections WHERE doc_id = ?)
    `).run(id);

    // Delete sections (FK cascade from document → sections is ON DELETE CASCADE,
    // but we already removed vec_sections above so do sections explicitly too)
    db.prepare('DELETE FROM sections WHERE doc_id = ?').run(id);

    // Delete document
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);

    // Rebuild FTS after deletion
    rebuildFts(db);

    return NextResponse.json({ deleted: id });
  } catch (err) {
    console.error('[DELETE /api/corpus/:id]', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

// Made with Bob
