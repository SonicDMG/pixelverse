# Explain-O-Matic & MythBuster Component Design

## Executive Summary

This document outlines the design for two new PixelScience components that will be integrated into the existing Space theme:

1. **Explain-O-Matic**: Multi-level explanations (Age 5, Middle School, Undergrad, Graduate, Expert) for science topics
2. **MythBuster**: Fact-checking component for common science myths using Wikipedia data

Both components leverage the existing PixelTicker architecture (Next.js, TypeScript, Langflow) and integrate with OpenRAG via MCP for knowledge retrieval.

**Key Design Decisions:**
- Integration: Both components work within the existing Space theme
- Explain-O-Matic: Optional persistent knowledge level setting (defaults to Middle School)
- MythBuster: Curated list of common science myths
- Backend: Langflow orchestration with OpenRAG via MCP

---

## 1. Component Architecture

### 1.1 Explain-O-Matic Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Knowledge Level Selector (Persistent Setting)   │  │
│  │  [👶 Age 5] [🎒 Middle School] [🎓 Undergrad]   │  │
│  │  [📚 Graduate] [🔬 Expert]                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Question Input: "Explain black holes"           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Langflow Agent Orchestration                │
│  • Receives: question + knowledge_level                  │
│  • Routes to: OpenRAG MCP tool                          │
│  • Generates: Level-appropriate explanation              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  OpenRAG via MCP                         │
│  • Searches: Wikipedia (standard + Simple English)      │
│  • Filters: By knowledge level complexity               │
│  • Returns: Relevant passages with citations            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Response with UI Components                 │
│  • ExplanationCard: Main explanation text               │
│  • CitationList: Source Wikipedia articles              │
│  • RelatedTopics: Suggested follow-up questions         │
│  • VisualAid: Optional diagram/image (if available)     │
└─────────────────────────────────────────────────────────┘
```

### 1.2 MythBuster Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Myth Selection Dropdown                         │  │
│  │  "Select a myth to investigate..."               │  │
│  │  • We only use 10% of our brain                  │  │
│  │  • Lightning never strikes twice                 │  │
│  │  • Goldfish have 3-second memory                 │  │
│  │  • Humans evolved from monkeys                   │  │
│  │  • [50+ curated myths]                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Langflow Agent Orchestration                │
│  • Receives: myth_statement                             │
│  • Routes to: OpenRAG MCP tool (fact-check mode)       │
│  • Analyzes: Multiple Wikipedia sources                 │
│  • Determines: Myth vs Fact with confidence             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  OpenRAG via MCP                         │
│  • Searches: Wikipedia for evidence                     │
│  • Retrieves: 5-10 relevant articles                    │
│  • Extracts: Supporting/contradicting evidence          │
│  • Scores: Confidence based on source agreement         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Response with UI Components                 │
│  • VerdictCard: MYTH or FACT with confidence meter      │
│  • EvidenceList: Key evidence from sources              │
│  • SourceComparison: Multiple Wikipedia perspectives    │
│  • HistoricalContext: Why the myth exists (optional)    │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Integration Points

Both components integrate with existing PixelTicker infrastructure:

```typescript
// Existing Integration Points
┌─────────────────────────────────────────────────────────┐
│  app/page.tsx                                            │
│  • Add knowledge level state management                 │
│  • Add myth selection UI                                │
│  • Pass settings to conversation hook                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  hooks/useConversation.ts                               │
│  • Include knowledge_level in query metadata            │
│  • Handle myth selection queries                        │
│  • Pass to Langflow service                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  services/langflow.ts                                   │
│  • Add metadata to Langflow request                     │
│  • Parse new component types in response                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  components/DynamicUIRenderer.tsx                       │
│  • Register new component types:                        │
│    - explanation-card                                   │
│    - verdict-card                                       │
│    - evidence-list                                      │
│    - source-comparison                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. User Interaction Flows

### 2.1 Explain-O-Matic Flow

```
User Journey:
1. User opens Space theme
2. Sees knowledge level selector (defaults to "Middle School")
3. Optionally changes level (persisted in localStorage)
4. Types question: "Explain quantum entanglement"
5. System sends: question + knowledge_level to Langflow
6. Langflow queries OpenRAG with level-appropriate filters
7. Response rendered with:
   - Main explanation at selected level
   - Citations from Wikipedia
   - Related topics for exploration
   - Optional visual aids

Alternative Flow (Level Comparison):
1. User asks question at one level
2. Sees "View at other levels" button
3. Clicks to see side-by-side comparison
4. System fetches explanations for all levels
5. Displays tabbed or accordion interface
```

**Interaction States:**

```typescript
// User can be in one of these states:
type ExplainState = 
  | 'selecting-level'    // Choosing knowledge level
  | 'asking-question'    // Typing question
  | 'loading'            // Waiting for response
  | 'viewing-answer'     // Reading explanation
  | 'comparing-levels'   // Viewing multiple levels
  | 'exploring-related'; // Following related topics
```

### 2.2 MythBuster Flow

```
User Journey:
1. User opens Space theme
2. Clicks "Bust a Myth" button or types "myth:" prefix
3. Sees dropdown of curated myths
4. Selects myth: "We only use 10% of our brain"
5. System sends myth to Langflow for fact-checking
6. Langflow queries OpenRAG for evidence
7. Response rendered with:
   - Verdict: MYTH with confidence meter (95%)
   - Key evidence from 5 Wikipedia sources
   - Explanation of why myth persists
   - Related myths to explore

Quick Access Flow:
1. User types: "myth: lightning never strikes twice"
2. System auto-detects "myth:" prefix
3. Matches to curated myth or processes as custom
4. Proceeds with fact-checking flow
```

**Interaction States:**

```typescript
// User can be in one of these states:
type MythBusterState = 
  | 'selecting-myth'     // Choosing from list
  | 'loading'            // Fact-checking in progress
  | 'viewing-verdict'    // Reading results
  | 'exploring-evidence' // Diving into sources
  | 'comparing-myths';   // Viewing related myths
```

---

## 3. Data Structures and Type Definitions

### 3.1 Explain-O-Matic Types

```typescript
// File: types/ui-spec.ts (additions)

/**
 * Knowledge levels for explanations
 */
export type KnowledgeLevel = 
  | 'age-5'        // Simple analogies, basic concepts
  | 'middle-school' // Introductory science level
  | 'undergrad'    // College-level understanding
  | 'graduate'     // Advanced technical detail
  | 'expert';      // Research-level depth

/**
 * Explanation card component
 */
export interface ExplanationCardSpec extends UIComponentSpec {
  type: 'explanation-card';
  props: {
    topic: string;
    level: KnowledgeLevel;
    explanation: string;
    keyPoints: string[];
    analogies?: string[];
    technicalTerms?: Array<{
      term: string;
      definition: string;
    }>;
    visualDescription?: string; // For potential image generation
    citations: Array<{
      source: string;
      url: string;
      excerpt: string;
      relevanceScore: number;
    }>;
    relatedTopics: Array<{
      topic: string;
      description: string;
      suggestedLevel?: KnowledgeLevel;
    }>;
  };
}

/**
 * Level comparison component (optional feature)
 */
export interface LevelComparisonSpec extends UIComponentSpec {
  type: 'level-comparison';
  props: {
    topic: string;
    explanations: Record<KnowledgeLevel, {
      text: string;
      keyPoints: string[];
      wordCount: number;
      readingLevel: string; // e.g., "Grade 5", "College"
    }>;
    currentLevel: KnowledgeLevel;
  };
}

/**
 * Related topics suggestion component
 */
export interface RelatedTopicsSpec extends UIComponentSpec {
  type: 'related-topics';
  props: {
    currentTopic: string;
    topics: Array<{
      name: string;
      relationship: 'prerequisite' | 'related' | 'advanced';
      description: string;
      difficulty: KnowledgeLevel;
    }>;
  };
}
```

### 3.2 MythBuster Types

```typescript
// File: types/ui-spec.ts (additions)

/**
 * Verdict types for myth busting
 */
export type MythVerdict = 'myth' | 'fact' | 'partially-true' | 'unverified';

/**
 * Confidence level for verdicts
 */
export type ConfidenceLevel = 'very-high' | 'high' | 'moderate' | 'low';

/**
 * Verdict card component
 */
export interface VerdictCardSpec extends UIComponentSpec {
  type: 'verdict-card';
  props: {
    statement: string;
    verdict: MythVerdict;
    confidence: number; // 0-100
    confidenceLevel: ConfidenceLevel;
    summary: string;
    reasoning: string;
    sourceCount: number;
    consensusLevel: number; // 0-100, how much sources agree
  };
}

/**
 * Evidence list component
 */
export interface EvidenceListSpec extends UIComponentSpec {
  type: 'evidence-list';
  props: {
    statement: string;
    evidence: Array<{
      type: 'supporting' | 'contradicting' | 'neutral';
      source: string;
      sourceUrl: string;
      excerpt: string;
      strength: 'strong' | 'moderate' | 'weak';
      date?: string;
    }>;
  };
}

/**
 * Source comparison component
 */
export interface SourceComparisonSpec extends UIComponentSpec {
  type: 'source-comparison';
  props: {
    statement: string;
    sources: Array<{
      name: string;
      url: string;
      position: 'supports' | 'contradicts' | 'neutral';
      keyQuote: string;
      credibility: number; // 0-100
      lastUpdated?: string;
    }>;
  };
}

/**
 * Myth context component (why the myth exists)
 */
export interface MythContextSpec extends UIComponentSpec {
  type: 'myth-context';
  props: {
    statement: string;
    origin: string;
    whyItPersists: string;
    historicalContext?: string;
    culturalFactors?: string[];
    relatedMyths: Array<{
      statement: string;
      category: string;
    }>;
  };
}

/**
 * Curated myth data structure
 */
export interface CuratedMyth {
  id: string;
  statement: string;
  category: 'biology' | 'physics' | 'astronomy' | 'chemistry' | 'earth-science' | 'general';
  popularity: number; // How commonly believed
  difficulty: KnowledgeLevel; // Complexity of explanation
  tags: string[];
}
```

### 3.3 Shared Types

```typescript
// File: types/index.ts (additions)

/**
 * Extended conversation metadata for new features
 */
export interface ConversationMetadata {
  theme: 'ticker' | 'space';
  knowledgeLevel?: KnowledgeLevel;
  isMythBuster?: boolean;
  mythId?: string;
  sessionId: string;
  timestamp: number;
}

/**
 * User preferences (stored in localStorage)
 */
export interface UserPreferences {
  defaultKnowledgeLevel: KnowledgeLevel;
  showLevelSelector: boolean;
  autoPlayAudio: boolean;
  preferredCitations: 'inline' | 'footnotes' | 'sidebar';
}
```

---

## 4. Langflow Prompt Requirements

### 4.1 Explain-O-Matic Prompts

```yaml
# Langflow Agent System Prompt (additions)

EXPLAIN-O-MATIC MODE:
When user asks for an explanation, you must:

1. Detect the knowledge level from metadata (default: middle-school)
2. Use OpenRAG MCP tool to search Wikipedia with level-appropriate filters:
   - age-5: Use Simple English Wikipedia, focus on analogies
   - middle-school: Use standard Wikipedia intro sections
   - undergrad: Use standard Wikipedia with technical sections
   - graduate: Use detailed Wikipedia sections with formulas
   - expert: Use comprehensive Wikipedia with research references

3. Generate explanation matching the level:
   - age-5: Use simple words, concrete examples, fun analogies
   - middle-school: Clear explanations, basic terminology, relatable examples
   - undergrad: Technical accuracy, proper terminology, some math
   - graduate: Advanced concepts, equations, research context
   - expert: Cutting-edge research, detailed mathematics, citations

4. Return JSON response with explanation-card component:
{
  "text": "Brief summary of the explanation",
  "components": [
    {
      "type": "explanation-card",
      "props": {
        "topic": "Black Holes",
        "level": "middle-school",
        "explanation": "Full explanation text...",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "analogies": ["Analogy 1", "Analogy 2"],
        "citations": [...],
        "relatedTopics": [...]
      }
    }
  ]
}

KNOWLEDGE LEVEL GUIDELINES:

Age 5:
- Vocabulary: 500-1000 common words
- Sentence length: 5-10 words
- Concepts: Concrete, observable
- Analogies: Everyday objects (toys, food, animals)
- Example: "A black hole is like a super strong vacuum cleaner in space"

Middle School:
- Vocabulary: Scientific terms with definitions
- Sentence length: 10-20 words
- Concepts: Abstract but relatable
- Analogies: Sports, technology, nature
- Example: "A black hole forms when a massive star collapses under its own gravity"

Undergrad:
- Vocabulary: Technical terminology assumed
- Sentence length: 15-25 words
- Concepts: Mathematical relationships
- Analogies: Engineering, physics principles
- Example: "Black holes are regions where spacetime curvature becomes infinite at the singularity"

Graduate:
- Vocabulary: Research-level terminology
- Sentence length: 20-30 words
- Concepts: Advanced theory, equations
- Analogies: Theoretical frameworks
- Example: "The Schwarzschild metric describes the spacetime geometry around a non-rotating black hole"

Expert:
- Vocabulary: Cutting-edge research terms
- Sentence length: Variable, technical
- Concepts: Current research, open questions
- Analogies: Advanced theoretical constructs
- Example: "Hawking radiation emerges from quantum field theory in curved spacetime near the event horizon"
```

### 4.2 MythBuster Prompts

```yaml
# Langflow Agent System Prompt (additions)

MYTHBUSTER MODE:
When user selects a myth to investigate, you must:

1. Receive the myth statement from curated list
2. Use OpenRAG MCP tool to search Wikipedia for evidence:
   - Search for direct mentions of the claim
   - Search for related scientific concepts
   - Search for historical context
   - Retrieve 5-10 most relevant articles

3. Analyze evidence from multiple sources:
   - Count supporting vs contradicting evidence
   - Assess source credibility (Wikipedia article quality)
   - Determine consensus level
   - Calculate confidence score

4. Determine verdict:
   - MYTH: Clearly false, strong contradicting evidence
   - FACT: Clearly true, strong supporting evidence
   - PARTIALLY-TRUE: Some truth, but oversimplified/misleading
   - UNVERIFIED: Insufficient evidence to determine

5. Return JSON response with verdict-card and evidence-list:
{
  "text": "Brief verdict summary",
  "components": [
    {
      "type": "verdict-card",
      "props": {
        "statement": "We only use 10% of our brain",
        "verdict": "myth",
        "confidence": 95,
        "confidenceLevel": "very-high",
        "summary": "This is a common misconception...",
        "reasoning": "Brain imaging studies show...",
        "sourceCount": 5,
        "consensusLevel": 98
      }
    },
    {
      "type": "evidence-list",
      "props": {
        "statement": "We only use 10% of our brain",
        "evidence": [
          {
            "type": "contradicting",
            "source": "Neuroscience (Wikipedia)",
            "sourceUrl": "https://en.wikipedia.org/wiki/Neuroscience",
            "excerpt": "Brain imaging shows all parts active...",
            "strength": "strong"
          },
          ...
        ]
      }
    },
    {
      "type": "myth-context",
      "props": {
        "statement": "We only use 10% of our brain",
        "origin": "Misinterpretation of early neuroscience...",
        "whyItPersists": "Appealing idea of untapped potential...",
        "relatedMyths": [...]
      }
    }
  ]
}

VERDICT DETERMINATION LOGIC:

Confidence Calculation:
- Source count: More sources = higher confidence
- Source agreement: Higher consensus = higher confidence
- Source quality: Wikipedia featured articles = higher weight
- Evidence strength: Direct statements > indirect implications

Confidence = (sourceAgreement * 0.4) + (sourceQuality * 0.3) + (evidenceStrength * 0.3)

Verdict Thresholds:
- MYTH: confidence > 80% AND contradicting evidence > 70%
- FACT: confidence > 80% AND supporting evidence > 70%
- PARTIALLY-TRUE: confidence > 60% AND mixed evidence
- UNVERIFIED: confidence < 60% OR insufficient sources

Evidence Strength:
- STRONG: Direct statement, peer-reviewed, recent
- MODERATE: Indirect support, older sources
- WEAK: Tangential mention, opinion-based
```

### 4.3 OpenRAG MCP Tool Usage

```typescript
// Example Langflow tool calls to OpenRAG MCP

// Explain-O-Matic query
{
  "tool": "openrag_search",
  "parameters": {
    "query": "black holes formation and properties",
    "limit": 10,
    "score_threshold": 0.7,
    "filter_id": "science_topics",
    "document_types": ["text/html"], // Wikipedia articles
    "metadata_filters": {
      "complexity": "middle-school", // Based on knowledge level
      "source": "wikipedia"
    }
  }
}

// MythBuster query
{
  "tool": "openrag_search",
  "parameters": {
    "query": "brain usage percentage neuroscience myth",
    "limit": 15,
    "score_threshold": 0.6,
    "filter_id": "fact_checking",
    "document_types": ["text/html"],
    "metadata_filters": {
      "source": "wikipedia",
      "categories": ["neuroscience", "psychology", "myths"]
    }
  }
}
```

---

## 5. Visual Design Specifications

### 5.1 Explain-O-Matic Visual Design

```
┌─────────────────────────────────────────────────────────┐
│  🎓 EXPLAIN-O-MATIC v1.0                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Knowledge Level:                                       │
│  ┌─────┬─────┬─────┬─────┬─────┐                      │
│  │ 👶  │ 🎒  │ 🎓  │ 📚  │ 🔬  │                      │
│  │ Age │ Mid │Under│Grad │Expert│                      │
│  │  5  │Schl │ grad│     │     │                      │
│  └─────┴─────┴──█──┴─────┴─────┘                      │
│         Selected: Undergrad                             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔍 Ask a question...                              │ │
│  │ "Explain quantum entanglement"                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

Response Display:
┌─────────────────────────────────────────────────────────┐
│  📖 QUANTUM ENTANGLEMENT                                │
│  Level: Undergraduate                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Quantum entanglement is a phenomenon where two or     │
│  more particles become correlated in such a way that   │
│  the quantum state of one particle cannot be described │
│  independently of the others, even when separated by   │
│  large distances.                                       │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🔑 Key Points:                                         │
│  • Particles share quantum state                       │
│  • Measurement affects both particles instantly        │
│  • No faster-than-light communication possible         │
│  • Fundamental to quantum computing                    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  📚 Sources (3):                                        │
│  [1] Quantum Entanglement (Wikipedia) - 95% relevant   │
│  [2] Quantum Mechanics (Wikipedia) - 87% relevant      │
│  [3] EPR Paradox (Wikipedia) - 82% relevant            │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🔗 Related Topics:                                     │
│  → Quantum Superposition (Prerequisite)                │
│  → Bell's Theorem (Related)                            │
│  → Quantum Teleportation (Advanced)                    │
│                                                         │
│  [View at Other Levels] [Ask Follow-up]                │
└─────────────────────────────────────────────────────────┘
```

**Color Scheme (Cyberpunk/Space Theme):**
- Background: Dark blue-black (#0a0e27)
- Primary: Bright cyan (#00CED1) - headers, icons
- Secondary: Purple (#9370DB) - accents, highlights
- Success: Lime green (#00ff00) - active selections
- Text: White (#ffffff) with glow effect
- Borders: Royal blue (#4169E1) with glow

**Typography:**
- Headers: Pixel font (existing PixelTicker font)
- Body: Monospace font for readability
- Code/Terms: Highlighted with background color

**Animations:**
- Level selector: Smooth slide transition
- Card appearance: Fade-in with slight scale
- Citation hover: Glow effect intensifies
- Related topics: Pulse animation on hover

### 5.2 MythBuster Visual Design

```
┌─────────────────────────────────────────────────────────┐
│  ❓ MYTHBUSTER v1.0                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select a myth to investigate:                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔍 Search myths...                                │ │
│  │                                                   │ │
│  │ Popular Myths:                                    │ │
│  │ • We only use 10% of our brain                   │ │
│  │ • Lightning never strikes the same place twice   │ │
│  │ • Goldfish have 3-second memory                  │ │
│  │ • Humans evolved from monkeys                    │ │
│  │ • Cracking knuckles causes arthritis             │ │
│  │ • [Show 45 more...]                              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Categories: [Biology] [Physics] [Astronomy] [All]     │
│                                                         │
└─────────────────────────────────────────────────────────┘

Verdict Display:
┌─────────────────────────────────────────────────────────┐
│  ❌ MYTH BUSTED!                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Statement:                                             │
│  "We only use 10% of our brain"                        │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  Verdict: MYTH                                          │
│  Confidence: ████████████████████░ 95%                 │
│                                                         │
│  This is a common misconception with no scientific     │
│  basis. Brain imaging studies consistently show that   │
│  all parts of the brain have activity and function.    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  🔍 Evidence from 5 Wikipedia sources:                 │
│                                                         │
│  ❌ CONTRADICTS (Strong):                              │
│  "Brain imaging shows all parts active during various  │
│  tasks, with no dormant regions."                      │
│  — Neuroscience (Wikipedia)                            │
│                                                         │
│  ❌ CONTRADICTS (Strong):                              │
│  "Evolutionary biology suggests unused brain tissue    │
│  would be eliminated through natural selection."       │
│  — Human Brain (Wikipedia)                             │
│                                                         │
│  ❌ CONTRADICTS (Moderate):                            │
│  "Damage to even small brain areas causes significant  │
│  impairment, indicating all regions are necessary."    │
│  — Neuroplasticity (Wikipedia)                         │
│                                                         │
│  [Show All Evidence] [View Sources]                    │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  💡 Why This Myth Persists:                            │
│                                                         │
│  This myth likely originated from misinterpretations   │
│  of early neuroscience research and has been           │
│  perpetuated by self-help literature suggesting        │
│  untapped human potential.                             │
│                                                         │
│  [Explore Related Myths] [Ask Follow-up]               │
└─────────────────────────────────────────────────────────┘
```

**Verdict Visual Indicators:**

```
MYTH (Red theme):
┌─────────────────────┐
│  ❌ MYTH            │
│  ████████████░ 95%  │
└─────────────────────┘
Color: #ff4444 (red)
Icon: ❌ or 🚫
Animation: Shake effect

FACT (Green theme):
┌─────────────────────┐
│  ✅ FACT            │
│  ████████████░ 92%  │
└─────────────────────┘
Color: #00ff00 (green)
Icon: ✅ or ✓
Animation: Checkmark draw

PARTIALLY TRUE (Yellow theme):
┌─────────────────────┐
│  ⚠️  PARTIALLY TRUE │
│  ████████░░░░ 65%   │
└─────────────────────┘
Color: #ffaa00 (amber)
Icon: ⚠️ or ⚡
Animation: Pulse

UNVERIFIED (Gray theme):
┌─────────────────────┐
│  ❔ UNVERIFIED      │
│  ████░░░░░░░ 45%    │
└─────────────────────┘
Color: #888888 (gray)
Icon: ❔ or ?
Animation: Fade in/out
```

**Evidence Strength Indicators:**
- Strong: ███ (3 bars, bright color)
- Moderate: ██░ (2 bars)
- Weak: █░░ (1 bar, dim color)

### 5.3 Shared Visual Elements

**Citation Display:**
```
┌─────────────────────────────────────────────────────────┐
│  📚 Sources                                             │
├─────────────────────────────────────────────────────────┤
│  [1] Quantum Entanglement                               │
│      Wikipedia • Last updated: 2025-12-15               │
│      Relevance: ████████████████████░ 95%              │
│      "Quantum entanglement is a physical phenomenon..." │
│      [View Full Article →]                              │
│                                                         │
│  [2] Quantum Mechanics                                  │
│      Wikipedia • Last updated: 2025-11-20               │
│      Relevance: ████████████████░░░░ 87%              │
│      "The mathematical formulation of quantum..."       │
│      [View Full Article →]                              │
└─────────────────────────────────────────────────────────┘
```

**Loading States:**
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Searching Wikipedia...                              │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 45%    │
│                                                         │
│  • Retrieving articles...                               │
│  • Analyzing evidence...                                │
│  • Generating explanation...                            │
└─────────────────────────────────────────────────────────┘
```

**Error States:**
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  ERROR                                              │
├─────────────────────────────────────────────────────────┤
│  Unable to retrieve information from OpenRAG.           │
│                                                         │
│  Possible causes:                                       │
│  • Network connection issue                             │
│  • OpenRAG service unavailable                          │
│  • No relevant sources found                            │
│                                                         │
│  [Retry] [Try Different Question]                       │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up basic infrastructure and types

**Tasks:**
1. **Type Definitions**
   - Add new component specs to [`types/ui-spec.ts`](types/ui-spec.ts)
   - Add knowledge level types
   - Add myth verdict types
   - Add user preferences types

2. **UI State Management**
   - Add knowledge level state to [`app/page.tsx`](app/page.tsx)
   - Add myth selection state
   - Implement localStorage for preferences
   - Add state to [`hooks/useConversation.ts`](hooks/useConversation.ts)

3. **Basic UI Components**
   - Create knowledge level selector component
   - Create myth dropdown component
   - Add to Space theme interface
   - Style with cyberpunk theme

**Deliverables:**
- [ ] Updated type definitions
- [ ] Knowledge level selector UI
- [ ] Myth selection dropdown UI
- [ ] State management in place

**Testing:**
- UI components render correctly
- State persists in localStorage
- Theme styling matches existing components

### Phase 2: Explain-O-Matic Core (Week 3-4)

**Goal:** Implement basic Explain-O-Matic functionality

**Tasks:**
1. **Langflow Integration**
   - Update [`services/langflow.ts`](services/langflow.ts) to pass knowledge level
   - Add metadata to Langflow requests
   - Handle explanation-card responses

2. **Component Development**
   - Create `ExplanationCard` component in [`components/dynamic/`](components/dynamic/)
   - Create `RelatedTopics` component
   - Create `CitationList` component
   - Register in [`components/DynamicUIRenderer.tsx`](components/DynamicUIRenderer.tsx)

3. **Langflow Prompts**
   - Write system prompts for each knowledge level
   - Configure OpenRAG MCP tool calls
   - Test with sample questions

**Deliverables:**
- [ ] ExplanationCard component
- [ ] RelatedTopics component
- [ ] CitationList component
- [ ] Langflow prompts configured
- [ ] End-to-end flow working

**Testing:**
- Questions at different levels return appropriate explanations
- Citations display correctly
- Related topics are relevant
- Component styling matches design

### Phase 3: MythBuster Core (Week 5-6)

**Goal:** Implement basic MythBuster functionality

**Tasks:**
1. **Curated Myth Database**
   - Create myth data file with 50+ myths
   - Categorize by science domain
   - Add metadata (popularity, difficulty)
   - Implement search/filter functionality

2. **Component Development**
   - Create `VerdictCard` component
   - Create `EvidenceList` component
   - Create `SourceComparison` component
   - Create `MythContext` component
   - Register in DynamicUIRenderer

3. **Langflow Integration**
   - Write MythBuster system prompts
   - Configure fact-checking logic
   - Implement confidence calculation
   - Test with sample myths

**Deliverables:**
- [ ] Curated myth database (50+ myths)
- [ ] VerdictCard component
- [ ] EvidenceList component
- [ ] SourceComparison component
- [ ] MythContext component
- [ ] Langflow prompts configured
- [ ] End-to-end flow working

**Testing:**
- Myths return accurate verdicts
- Confidence scores are reasonable
- Evidence is relevant and properly cited
- Visual indicators work correctly

### Phase 4: Enhanced Features (Week 7-8)

**Goal:** Add advanced features and polish

**Tasks:**
1. **Explain-O-Matic Enhancements**
   - Implement level comparison view
   - Add visual aids (diagrams, images)
   - Implement "Ask Follow-up" functionality
   - Add prerequisite topic detection

2. **MythBuster Enhancements**
   - Add "Why This Myth Persists" section
   - Implement related myths suggestions
   - Add myth popularity tracking
   - Create myth categories navigation

3. **Shared Enhancements**
   - Improve citation display
   - Add source credibility indicators
   - Implement better error handling
   - Add loading state animations

**Deliverables:**
- [ ] Level comparison feature
- [ ] Visual aids integration
- [ ] Myth context explanations
- [ ] Related content suggestions
- [ ] Enhanced citations
- [ ] Polished animations

**Testing:**
- All features work smoothly
- Performance is acceptable
- Error states handle gracefully
- User experience is intuitive

### Phase 5: Testing & Optimization (Week 9-10)

**Goal:** Comprehensive testing and performance optimization

**Tasks:**
1. **Testing**
   - Write unit tests for new components
   - Write integration tests for flows
   - Test with various knowledge levels
   - Test with all myth categories
   - User acceptance testing

2. **Optimization**
   - Optimize OpenRAG queries
   - Implement response caching
   - Reduce component re-renders
   - Optimize bundle size

3. **Documentation**
   - Update component documentation
   - Write user guide
   - Document Langflow prompts
   - Create troubleshooting guide

**Deliverables:**
- [ ] Comprehensive test suite
- [ ] Performance optimizations
- [ ] Complete documentation
- [ ] User guide

**Testing:**
- All tests pass
- Performance meets targets
- Documentation is clear and complete

### Phase 6: Launch & Iteration (Week 11-12)

**Goal:** Launch features and gather feedback

**Tasks:**
1. **Launch Preparation**
   - Final QA testing
   - Deploy to production
   - Monitor for issues
   - Gather user feedback

2. **Iteration**
   - Fix bugs discovered in production
   - Adjust based on user feedback
   - Add requested features
   - Optimize based on usage patterns

**Deliverables:**
- [ ] Production deployment
- [ ] Monitoring dashboard
- [ ] Feedback collection system
- [ ] Iteration plan

---

## 7. Technical Specifications

### 7.1 File Structure

```
pixelticker/
├── components/
│   ├── dynamic/
│   │   ├── ExplanationCard.tsx          # NEW
│   │   ├── VerdictCard.tsx              # NEW
│   │   ├── EvidenceList.tsx             # NEW
│   │   ├── SourceComparison.tsx         # NEW
│   │   ├── MythContext.tsx              # NEW
│   │   ├── RelatedTopics.tsx            # NEW
│   │   ├── CitationList.tsx             # NEW
│   │   └── LevelComparison.tsx          # NEW (optional)
│   ├── science/
│   │   ├── KnowledgeLevelSelector.tsx   # NEW
│   │   ├── MythSelector.tsx             # NEW
│   │   └── ScienceControls.tsx          # NEW
│   └── DynamicUIRenderer.tsx            # MODIFIED
├── data/
│   └── curated-myths.json               # NEW
├── hooks/
│   ├── useConversation.ts               # MODIFIED
│   └── useUserPreferences.ts            # NEW
├── services/
│   └── langflow.ts                      # MODIFIED
├── types/
│   ├── ui-spec.ts                       # MODIFIED
│   └── index.ts                         # MODIFIED
└── docs/
    └── EXPLAIN_O_MATIC_MYTHBUSTER_DESIGN.md  # THIS FILE
```

### 7.2 Component API Specifications

#### ExplanationCard Component

```typescript
// File: components/dynamic/ExplanationCard.tsx

interface ExplanationCardProps {
  topic: string;
  level: KnowledgeLevel;
  explanation: string;
  keyPoints: string[];
  analogies?: string[];
  technicalTerms?: Array<{
    term: string;
    definition: string;
  }>;
  visualDescription?: string;
  citations: Array<{
    source: string;
    url: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  relatedTopics: Array<{
    topic: string;
    description: string;
    suggestedLevel?: KnowledgeLevel;
  }>;
  onLevelChange?: (level: KnowledgeLevel) => void;
  onTopicClick?: (topic: string) => void;
}

export function ExplanationCard(props: ExplanationCardProps): JSX.Element;
```

#### VerdictCard Component

```typescript
// File: components/dynamic/VerdictCard.tsx

interface VerdictCardProps {
  statement: string;
  verdict: MythVerdict;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  summary: string;
  reasoning: string;
  sourceCount: number;
  consensusLevel: number;
  onViewEvidence?: () => void;
  onExploreRelated?: () => void;
}

export function VerdictCard(props: VerdictCardProps): JSX.Element;
```

#### KnowledgeLevelSelector Component

```typescript
// File: components/science/KnowledgeLevelSelector.tsx

interface KnowledgeLevelSelectorProps {
  currentLevel: KnowledgeLevel;
  onChange: (level: KnowledgeLevel) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export function KnowledgeLevelSelector(props: KnowledgeLevelSelectorProps): JSX.Element;
```

#### MythSelector Component

```typescript
// File: components/science/MythSelector.tsx

interface MythSelectorProps {
  myths: CuratedMyth[];
  selectedMythId?: string;
  onSelect: (myth: CuratedMyth) => void;
  filterCategory?: string;
  searchQuery?: string;
}

export function MythSelector(props: MythSelectorProps): JSX.Element;
```

### 7.3 Data Structures

#### Curated Myths Database

```json
// File: data/curated-myths.json

{
  "myths": [
    {
      "id": "brain-10-percent",
      "statement": "We only use 10% of our brain",
      "category": "biology",
      "popularity": 95,
      "difficulty": "middle-school",
      "tags": ["neuroscience", "psychology", "common-myth"],
      "relatedMythIds": ["left-right-brain", "brain-size-intelligence"]
    },
    {
      "id": "lightning-twice",
      "statement": "Lightning never strikes the same place twice",
      "category": "physics",
      "popularity": 85,
      "difficulty": "middle-school",
      "tags": ["weather", "electricity", "common-myth"],
      "relatedMythIds": ["lightning-heat", "lightning-safety"]
    },
    {
      "id": "goldfish-memory",
      "statement": "Goldfish have a 3-second memory",
      "category": "biology",
      "popularity": 80,
      "difficulty": "age-5",
      "tags": ["animals", "memory", "common-myth"],
      "relatedMythIds": ["fish-intelligence", "animal-memory"]
    },
    {
      "id": "evolution-monkeys",
      "statement": "Humans evolved from monkeys",
      "category": "biology",
      "popularity": 90,
      "difficulty": "undergrad",
      "tags": ["evolution", "anthropology", "misconception"],
      "relatedMythIds": ["missing-link", "evolution-theory"]
    },
    {
      "id": "knuckle-arthritis",
      "statement": "Cracking knuckles causes arthritis",
      "category": "biology",
      "popularity": 75,
      "difficulty": "middle-school",
      "tags": ["health", "joints", "common-myth"],
      "relatedMythIds": ["joint-health", "arthritis-causes"]
    }


### 7.1 File Structure

```
pixelticker/
├── components/
│   ├── dynamic/
│   │   ├── ExplanationCard.tsx          # NEW
│   │   ├── VerdictCard.tsx              # NEW
│   │   ├── EvidenceList.tsx             # NEW
│   │   ├── SourceComparison.tsx         # NEW
│   │   ├── MythContext.tsx              # NEW
│   │   ├── RelatedTopics.tsx            # NEW
│   │   ├── CitationList.tsx             # NEW
│   │   └── LevelComparison.tsx          # NEW (optional)
│   ├── science/
│   │   ├── KnowledgeLevelSelector.tsx   # NEW
│   │   ├── MythSelector.tsx             # NEW
│   │   └── ScienceControls.tsx          # NEW
│   └── DynamicUIRenderer.tsx            # MODIFIED
├── data/
│   └── curated-myths.json               # NEW
├── hooks/
│   ├── useConversation.ts               # MODIFIED
│   └── useUserPreferences.ts            # NEW
├── services/
│   └── langflow.ts                      # MODIFIED
├── types/
│   ├── ui-spec.ts                       # MODIFIED
│   └── index.ts                         # MODIFIED
└── docs/
    └── EXPLAIN_O_MATIC_MYTHBUSTER_DESIGN.md  # THIS FILE
```

### 7.2 Component API Specifications

#### ExplanationCard Component

```typescript
// File: components/dynamic/ExplanationCard.tsx

interface ExplanationCardProps {
  topic: string;
  level: KnowledgeLevel;
  explanation: string;
  keyPoints: string[];
  analogies?: string[];
  technicalTerms?: Array<{
    term: string;
    definition: string;
  }>;
  visualDescription?: string;
  citations: Array<{
    source: string;
    url: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  relatedTopics: Array<{
    topic: string;
    description: string;
    suggestedLevel?: KnowledgeLevel;
  }>;
  onLevelChange?: (level: KnowledgeLevel) => void;
  onTopicClick?: (topic: string) => void;
}

export function ExplanationCard(props: ExplanationCardProps): JSX.Element;
```

#### VerdictCard Component

```typescript
// File: components/dynamic/VerdictCard.tsx

interface VerdictCardProps {
  statement: string;
  verdict: MythVerdict;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  summary: string;
  reasoning: string;
  sourceCount: number;
  consensusLevel: number;
  onViewEvidence?: () => void;
  onExploreRelated?: () => void;
}

export function VerdictCard(props: VerdictCardProps): JSX.Element;
```

#### KnowledgeLevelSelector Component

```typescript
// File: components/science/KnowledgeLevelSelector.tsx

interface KnowledgeLevelSelectorProps {
  currentLevel: KnowledgeLevel;
  onChange: (level: KnowledgeLevel) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export function KnowledgeLevelSelector(props: KnowledgeLevelSelectorProps): JSX.Element;
```

#### MythSelector Component

```typescript
// File: components/science/MythSelector.tsx

interface MythSelectorProps {
  myths: CuratedMyth[];
  selectedMythId?: string;
  onSelect: (myth: CuratedMyth) => void;
  filterCategory?: string;
  searchQuery?: string;
}

export function MythSelector(props: MythSelectorProps): JSX.Element;
```

### 7.3 Data Structures

#### Curated Myths Database

```json
// File: data/curated-myths.json

{
  "myths": [
    {
      "id": "brain-10-percent",
      "statement": "We only use 10% of our brain",
      "category": "biology",
      "popularity": 95,
      "difficulty": "middle-school",
      "tags": ["neuroscience", "psychology", "common-myth"],
      "relatedMythIds": ["left-right-brain", "brain-size-intelligence"]
    },
    {
      "id": "lightning-twice",
      "statement": "Lightning never strikes the same place twice",
      "category": "physics",
      "popularity": 85,
      "difficulty": "middle-school",
      "tags": ["weather", "electricity", "common-myth"],
      "relatedMythIds": ["lightning-heat", "lightning-safety"]
    },
    {
      "id": "goldfish-memory",
      "statement": "Goldfish have a 3-second memory",
      "category": "biology",
      "popularity": 80,
      "difficulty": "age-5",
      "tags": ["animals", "memory", "common-myth"],
      "relatedMythIds": ["fish-intelligence", "animal-memory"]
    },
    {
      "id": "evolution-monkeys",
      "statement": "Humans evolved from monkeys",
      "category": "biology",
      "popularity": 90,
      "difficulty": "undergrad",
      "tags": ["evolution", "anthropology", "misconception"],
      "relatedMythIds": ["missing-link", "evolution-theory"]
    },
    {
      "id": "knuckle-arthritis",
      "statement": "Cracking knuckles causes arthritis",
      "category": "biology",
      "popularity": 75,
      "difficulty": "middle-school",
      "tags": ["health", "joints", "common-myth"],
      "relatedMythIds": ["joint-health", "arthritis-causes"]
    }
  ],
  "categories": [
    {
      "id": "biology",
      "name": "Biology & Life Sciences",
      "icon": "🧬",
      "mythCount": 20
    },
    {
      "id": "physics",
      "name": "Physics & Energy",
      "icon": "⚛️",
      "mythCount": 15
    },
    {
      "id": "astronomy",
      "name": "Astronomy & Space",
      "icon": "🌌",
      "mythCount": 10
    },
    {
      "id": "chemistry",
      "name": "Chemistry",
      "icon": "⚗️",
      "mythCount": 8
    },
    {
      "id": "earth-science",
      "name": "Earth Science",
      "icon": "🌍",
      "mythCount": 7
    }
  ]
}
```

### 7.4 API Modifications

#### Langflow Service Updates

```typescript
// File: services/langflow.ts (modifications)

export interface LangflowMetadata {
  theme: 'ticker' | 'space';
  knowledgeLevel?: KnowledgeLevel;
  isMythBuster?: boolean;
  mythId?: string;
  sessionId: string;
}

export async function queryLangflow(
  question: string,
  theme: LangflowTheme = 'ticker',
  sessionId?: string,
  metadata?: Partial<LangflowMetadata>
): Promise<StockQueryResult> {
  // ... existing code ...
  
  const payload = {
    ...request,
    session_id: sessionId || randomUUID(),
    metadata: {
      theme,
      ...metadata,
    },
  };
  
  // ... rest of implementation ...
}
```

#### Conversation Hook Updates

```typescript
// File: hooks/useConversation.ts (modifications)

export function useConversation(theme: 'ticker' | 'space') {
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel>('middle-school');
  const [selectedMyth, setSelectedMyth] = useState<CuratedMyth | null>(null);
  
  // ... existing state ...
  
  const handleSubmit = async (question: string) => {
    // ... existing code ...
    
    const metadata: Partial<LangflowMetadata> = {
      theme,
      knowledgeLevel,
      isMythBuster: !!selectedMyth,
      mythId: selectedMyth?.id,
    };
    
    const result = await queryLangflow(
      question,
      theme,
      sessionId,
      metadata
    );
    
    // ... rest of implementation ...
  };
  
  return {
    // ... existing returns ...
    knowledgeLevel,
    setKnowledgeLevel,
    selectedMyth,
    setSelectedMyth,
  };
}
```

---

## 8. OpenRAG MCP Integration Details

### 8.1 OpenRAG Tool Configuration

```typescript
// Langflow configuration for OpenRAG MCP tools

// Explain-O-Matic: Search with knowledge level filtering
const explainQuery = {
  tool: 'openrag_search',
  parameters: {
    query: userQuestion,
    limit: 10,
    score_threshold: 0.7,
    metadata_filters: {
      source: 'wikipedia',
      complexity_level: knowledgeLevel, // 'simple', 'standard', 'technical'
      language: knowledgeLevel === 'age-5' ? 'simple-english' : 'english',
    },
  },
};

// MythBuster: Multi-source fact-checking
const mythBusterQuery = {
  tool: 'openrag_search',
  parameters: {
    query: `fact check: ${mythStatement}`,
    limit: 15,
    score_threshold: 0.6,
    metadata_filters: {
      source: 'wikipedia',
      categories: ['science', 'research', 'facts'],
      quality: 'high', // Prefer featured/good articles
    },
  },
};
```

### 8.2 Wikipedia Data Ingestion Strategy

```python
# Pseudo-code for Wikipedia ingestion into OpenRAG

from openrag_mcp import OpenRAGClient
import wikipediaapi

# Initialize clients
openrag = OpenRAGClient()
wiki = wikipediaapi.Wikipedia('en')

# Science topics for Explain-O-Matic
science_topics = [
    # Physics
    "Quantum mechanics", "Relativity", "Thermodynamics", "Electromagnetism",
    "Nuclear physics", "Particle physics", "Optics", "Acoustics",
    
    # Biology
    "DNA", "Evolution", "Cell biology", "Genetics", "Ecology",
    "Neuroscience", "Immunology", "Microbiology",
    
    # Astronomy
    "Black hole", "Galaxy", "Solar system", "Star", "Planet",
    "Cosmology", "Exoplanet", "Nebula",
    
    # Chemistry
    "Periodic table", "Chemical reaction", "Organic chemistry",
    "Biochemistry", "Molecular structure",
    
    # Earth Science
    "Plate tectonics", "Climate", "Geology", "Oceanography",
]

# Ingest with complexity metadata
for topic in science_topics:
    # Standard Wikipedia
    page = wiki.page(topic)
    openrag.ingest({
        'title': page.title,
        'content': page.text,
        'url': page.fullurl,
        'metadata': {
            'source': 'wikipedia',
            'complexity_level': 'standard',
            'language': 'english',
            'categories': page.categories,
        }
    })
    
    # Simple English Wikipedia (for age-5 and middle-school)
    simple_wiki = wikipediaapi.Wikipedia('simple')
    simple_page = simple_wiki.page(topic)
    if simple_page.exists():
        openrag.ingest({
            'title': simple_page.title,
            'content': simple_page.text,
            'url': simple_page.fullurl,
            'metadata': {
                'source': 'wikipedia',
                'complexity_level': 'simple',
                'language': 'simple-english',
            }
        })
```

### 8.3 Response Processing

```typescript
// Processing OpenRAG responses in Langflow

function processExplainResponse(openragResults: any[], knowledgeLevel: KnowledgeLevel) {
  // Extract relevant passages
  const passages = openragResults.map(result => ({
    text: result.content,
    source: result.metadata.title,
    url: result.metadata.url,
    relevance: result.score,
  }));
  
  // Generate level-appropriate explanation
  const explanation = generateExplanation(passages, knowledgeLevel);
  
  // Extract key points
  const keyPoints = extractKeyPoints(passages, knowledgeLevel);
  
  // Find related topics
  const relatedTopics = findRelatedTopics(passages);
  
  return {
    type: 'explanation-card',
    props: {
      topic: userQuestion,
      level: knowledgeLevel,
      explanation,
      keyPoints,
      citations: passages,
      relatedTopics,
    },
  };
}

function processMythBusterResponse(openragResults: any[], mythStatement: string) {
  // Categorize evidence
  const evidence = categorizeEvidence(openragResults, mythStatement);
  
  // Calculate confidence
  const confidence = calculateConfidence(evidence);
  
  // Determine verdict
  const verdict = determineVerdict(evidence, confidence);
  
  // Generate reasoning
  const reasoning = generateReasoning(evidence, verdict);
  
  return [
    {
      type: 'verdict-card',
      props: {
        statement: mythStatement,
        verdict,
        confidence,
        confidenceLevel: getConfidenceLevel(confidence),
        summary: generateSummary(verdict, evidence),
        reasoning,
        sourceCount: evidence.length,
        consensusLevel: calculateConsensus(evidence),
      },
    },
    {
      type: 'evidence-list',
      props: {
        statement: mythStatement,
        evidence: evidence.map(e => ({
          type: e.supports ? 'supporting' : 'contradicting',
          source: e.source,
          sourceUrl: e.url,
          excerpt: e.excerpt,
          strength: e.strength,
        })),
      },
    },
  ];
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// File: __tests__/components/dynamic/ExplanationCard.test.tsx

describe('ExplanationCard', () => {
  it('renders explanation at correct knowledge level', () => {
    const props = {
      topic: 'Black Holes',
      level: 'middle-school',
      explanation: 'A black hole is a region of space...',
      keyPoints: ['Point 1', 'Point 2'],
      citations: [],
      relatedTopics: [],
    };
    
    render(<ExplanationCard {...props} />);
    expect(screen.getByText('Black Holes')).toBeInTheDocument();
    expect(screen.getByText(/middle school/i)).toBeInTheDocument();
  });
  
  it('displays citations correctly', () => {
    // Test citation display
  });
  
  it('handles level changes', () => {
    // Test level switching
  });
});

// File: __tests__/components/dynamic/VerdictCard.test.tsx

describe('VerdictCard', () => {
  it('displays myth verdict correctly', () => {
    const props = {
      statement: 'We only use 10% of our brain',
      verdict: 'myth',
      confidence: 95,
      confidenceLevel: 'very-high',
      summary: 'This is false',
      reasoning: 'Brain imaging shows...',
      sourceCount: 5,
      consensusLevel: 98,
    };
    
    render(<VerdictCard {...props} />);
    expect(screen.getByText(/myth/i)).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
  
  it('shows correct visual indicator for verdict', () => {
    // Test visual indicators
  });
});
```

### 9.2 Integration Tests

```typescript
// File: __tests__/integration/explain-o-matic.test.tsx

describe('Explain-O-Matic Integration', () => {
  it('completes full explanation flow', async () => {
    // 1. User selects knowledge level
    // 2. User asks question
    // 3. System queries Langflow
    // 4. Response is rendered
    // 5. Citations are displayed
  });
  
  it('persists knowledge level preference', () => {
    // Test localStorage persistence
  });
  
  it('handles OpenRAG errors gracefully', () => {
    // Test error handling
  });
});

// File: __tests__/integration/mythbuster.test.tsx

describe('MythBuster Integration', () => {
  it('completes full myth-busting flow', async () => {
    // 1. User selects myth
    // 2. System fact-checks
    // 3. Verdict is displayed
    // 4. Evidence is shown
  });
  
  it('loads curated myths correctly', () => {
    // Test myth database loading
  });
  
  it('calculates confidence accurately', () => {
    // Test confidence calculation
  });
});
```

---

## 10. Performance Considerations

### 10.1 Optimization Strategies

**Response Caching:**
```typescript
// Cache OpenRAG responses for common questions
const responseCache = new Map<string, CachedResponse>();

function getCacheKey(question: string, level: KnowledgeLevel): string {
  return `${question.toLowerCase()}-${level}`;
}

async function queryWithCache(question: string, level: KnowledgeLevel) {
  const key = getCacheKey(question, level);
  
  if (responseCache.has(key)) {
    const cached = responseCache.get(key);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hour
      return cached.response;
    }
  }
  
  const response = await queryLangflow(question, 'space', undefined, { knowledgeLevel: level });
  responseCache.set(key, { response, timestamp: Date.now() });
  
  return response;
}
```

**Performance Targets:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | < 2s | Time to interactive |
| Question Response | < 5s | Langflow + OpenRAG query |
| Myth Bust Response | < 7s | Multiple source analysis |
| Component Render | < 100ms | React render time |
| Cache Hit Rate | > 30% | Common questions |
| Bundle Size Impact | < 50KB | Gzipped additional code |

---

## 11. Conclusion

This design document provides a comprehensive blueprint for implementing the Explain-O-Matic and MythBuster components within the PixelTicker/PixelScience application. The design leverages existing infrastructure while adding powerful new capabilities for science education and fact-checking.

### Key Takeaways

1. **Seamless Integration**: Both components integrate naturally into the existing Space theme
2. **Scalable Architecture**: Supports future enhancements and additional knowledge domains
3. **User-Centric**: Focus on intuitive interfaces and clear information presentation
4. **Performance-Conscious**: Caching and optimization strategies ensure responsive UX
5. **Accessible**: WCAG-compliant design ensures usability for all users
6. **Maintainable**: Clear component boundaries and type definitions

### Success Criteria

- [ ] Users can request explanations at 5 different knowledge levels
- [ ] Explanations are accurate and appropriately tailored to each level
- [ ] Users can fact-check 50+ curated science myths
- [ ] Verdicts are accurate with clear evidence presentation
- [ ] Response times meet performance targets
- [ ] All components are accessible and responsive
- [ ] Integration with OpenRAG via MCP is stable
- [ ] User feedback is positive

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-30  
**Author:** IBM Bob (Plan Mode)  
**Status:** Ready for Review
