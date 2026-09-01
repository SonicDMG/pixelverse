import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getWritableDb } from '@/services/rag/db';

const MAX_DOCS = 10;
const SECTIONS_PER_DOC = 3;
const SAMPLE_CHARS = 400;

// ── Widget catalogue ──────────────────────────────────────────────────────────
// Each entry describes a UI widget, the content signals that make it relevant,
// and the trigger phrase patterns that cause the generalist agent to route to it.
// The LLM uses this to bias questions toward widgets that actually fit the corpus.

const WIDGET_CATALOGUE = [
  {
    widget: 'explain-o-matic',
    signals: ['concept', 'definition', 'how it works', 'what is', 'format', 'specification', 'protocol', 'standard', 'framework', 'library', 'api'],
    triggerHint: 'Start with "Explain", "What is", "How does", or "ELI5"',
  },
  {
    widget: 'space-timeline',
    signals: ['history', 'version', 'release', 'changelog', 'milestone', 'timeline', 'founded', 'launched', 'announced', 'date', 'year', 'evolution'],
    triggerHint: 'Start with "Show me a timeline of" or "What is the history of"',
  },
  {
    widget: 'metric-grid',
    signals: ['performance', 'benchmark', 'statistics', 'numbers', 'metrics', 'measurements', 'count', 'size', 'rate', 'percentage', 'score', 'figure'],
    triggerHint: 'Start with "Show me the key metrics" or "What are the statistics for"',
  },
  {
    widget: 'comparison-table',
    signals: ['compare', 'versus', 'difference', 'pros', 'cons', 'trade-off', 'alternative', 'option', 'vs', 'contrast'],
    triggerHint: 'Start with "Compare" or "What is the difference between"',
  },
  {
    widget: 'data-table',
    signals: ['list', 'table', 'properties', 'attributes', 'fields', 'parameters', 'options', 'configuration', 'columns', 'rows', 'entries'],
    triggerHint: 'Start with "Show me all" or "List the"',
  },
  {
    widget: 'code-block',
    signals: ['syntax', 'markup', 'example', 'snippet', 'xml', 'json', 'yaml', 'format', 'schema', 'template', 'doclang', 'markdown', 'code', 'raw'],
    triggerHint: 'Start with "Show me an example of" or "Show me the raw markup for"',
  },
  {
    widget: 'celestial-body-card',
    signals: ['planet', 'star', 'moon', 'galaxy', 'nebula', 'asteroid', 'comet', 'black hole', 'solar system', 'orbit', 'space', 'astronomical', 'celestial'],
    triggerHint: 'Ask directly about a specific celestial body: "Tell me about [name]"',
  },
  {
    widget: 'solar-system',
    signals: ['solar system', 'orbit', 'planets', 'astronomical', 'space', 'nasa', 'celestial mechanics'],
    triggerHint: 'Ask "Show me the solar system" or "Show me the orbital structure of"',
  },
  {
    widget: 'alert-box',
    signals: ['warning', 'caution', 'deprecated', 'breaking change', 'security', 'vulnerability', 'risk', 'known issue', 'bug', 'limitation'],
    triggerHint: 'Ask "Are there any warnings or caveats about" or "What are the known issues with"',
  },
  {
    widget: 'text-block',
    signals: ['summary', 'overview', 'description', 'narrative', 'explanation', 'background', 'context', 'introduction'],
    triggerHint: 'Ask "Summarize" or "Give me an overview of"',
  },
];

/**
 * Score each widget against the corpus content sample.
 * Returns widgets with at least one signal hit, sorted by score descending.
 */
function detectRelevantWidgets(contentLower: string): typeof WIDGET_CATALOGUE {
  return WIDGET_CATALOGUE
    .map(w => ({
      ...w,
      score: w.signals.filter(s => contentLower.includes(s)).length,
    }))
    .filter(w => w.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * POST /api/corpus/suggest-questions
 *
 * Given a set of doc IDs, samples their content and asks the LLM to
 * generate 5 natural-language questions — biased toward widgets that are
 * actually relevant to the corpus content.
 *
 * Body: { doc_ids: string[] }
 * Returns: { questions: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doc_ids } = body as { doc_ids?: string[] };

    if (!Array.isArray(doc_ids) || doc_ids.length === 0) {
      return NextResponse.json({ error: 'doc_ids array is required' }, { status: 400 });
    }

    const ids = doc_ids.slice(0, MAX_DOCS);

    const db = getWritableDb();

    // Pull doc titles
    const placeholders = ids.map(() => '?').join(', ');
    const docs = db.prepare(`
      SELECT id, title FROM documents WHERE id IN (${placeholders})
    `).all(...ids) as Array<{ id: string; title: string }>;

    if (docs.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Sample a few sections per doc for content context
    const sectionSamples: string[] = [];
    for (const doc of docs) {
      const sections = db.prepare(`
        SELECT plain_text FROM sections
        WHERE doc_id = ?
        ORDER BY seq
        LIMIT ?
      `).all(doc.id, SECTIONS_PER_DOC) as Array<{ plain_text: string }>;

      const excerpt = sections
        .map(s => s.plain_text.trim().slice(0, SAMPLE_CHARS))
        .join(' … ');

      if (excerpt) {
        sectionSamples.push(`Document: "${doc.title}"\n${excerpt}`);
      }
    }

    const docTitles = docs.map(d => `"${d.title}"`).join(', ');
    const contentBlock = sectionSamples.join('\n\n---\n\n');

    // Detect which widgets are relevant to this corpus
    const contentLower = contentBlock.toLowerCase();
    const relevantWidgets = detectRelevantWidgets(contentLower);

    // Build the widget guidance block — top 5 scoring widgets at most
    const widgetGuidance = relevantWidgets.slice(0, 5).map(w =>
      `- ${w.widget}: ${w.triggerHint}`
    ).join('\n');

    const systemPrompt = `You generate exactly 5 concise, specific questions a user would want to ask about a set of documents.
Return ONLY a valid JSON object — no markdown fences, no prose outside the JSON:
{ "questions": ["question 1", "question 2", "question 3", "question 4", "question 5"] }

Rules:
- Exactly 5 questions, no more, no less
- Each question max 60 characters
- Use the actual content — make questions specific, not generic
- Do not mention "the document" or "this text" — phrase as direct questions
- Spread the questions across different intents (lookup, comparison, explanation, timeline, metrics, raw example)

The UI has visual widgets that activate based on question phrasing. Where the content supports it, phrase questions to trigger these widgets:
${widgetGuidance || '- text-block: Start with "Summarize" or "Give me an overview of"'}

Match the widget list to the content — do not suggest celestial/space widgets if the content is not about astronomy.`;

    const userContent = `Documents: ${docTitles}\n\nContent samples:\n\n${contentBlock}\n\nGenerate 5 questions.`;

    const client = new OpenAI({
      apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
      baseURL: process.env.LLM_BASE_URL || undefined,
    });

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const rawContent = completion.choices[0]?.message?.content ?? '{}';
    console.log('[suggest-questions] raw LLM response:', rawContent);
    // Strip markdown code fences if the model wrapped the JSON despite response_format
    const raw = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    let questions: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      console.log('[suggest-questions] parsed:', JSON.stringify(parsed));
      if (Array.isArray(parsed.questions)) {
        questions = parsed.questions.slice(0, 5).filter((q: unknown) => typeof q === 'string' && (q as string).trim());
      }
    } catch (e) {
      console.error('[suggest-questions] JSON parse failed:', e, '| raw:', raw);
    }

    console.log('[suggest-questions] returning questions:', questions);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[suggest-questions]', err);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

// Made with Bob
