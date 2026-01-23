# PixelScience - OpenRAG Demo Application

## Core Concept

**PixelScience**: A retro-futuristic science exploration tool that showcases OpenRAG's capabilities through interactive, non-chat interfaces. Think "science museum terminal from the future" rather than "chatbot."

## Key Design Principles

1. **Demo/Showcase Focus**: Highlight OpenRAG features, not monetization
2. **Beyond Chat**: Interactive UI patterns that go beyond text input/output
3. **Easy Data**: Wikipedia as primary source (public, structured, comprehensive)
4. **Approachable**: Science is fun and accessible, not intimidating
5. **Retro Aesthetic**: Laboratory computer terminal from the 1980s meets cyberpunk

---

## Why This Works as an OpenRAG Demo

### OpenRAG Features to Showcase:

1. **Document Parsing** (Docling)
   - Parse Wikipedia articles with complex formatting
   - Extract tables, formulas, diagrams
   - Preserve structure and relationships

2. **Hybrid Search** (OpenSearch)
   - Semantic search: "concepts related to quantum entanglement"
   - Keyword search: "Einstein 1905 papers"
   - Combined: "simple explanation of relativity"

3. **Multi-Source Synthesis**
   - Compare explanations across multiple Wikipedia articles
   - Show how different sources describe the same concept
   - Trace concept evolution (historical articles)

4. **Citation & Provenance**
   - Every fact links back to Wikipedia source
   - Show which article section information came from
   - Display confidence based on source quality

5. **Context-Aware Retrieval**
   - Understand user's knowledge level
   - Retrieve appropriate depth of information
   - Follow concept chains (prerequisites → advanced)

---

## Interaction Modes (NOT Just Chat!)

### Mode 1: "Science Explorer" - Visual Concept Browser

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  🔬 PIXELSCIENCE EXPLORER v1.0                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│     [QUANTUM MECHANICS]                             │
│            │                                        │
│     ┌──────┴──────┐                                │
│     │             │                                 │
│  [Wave-      [Particle-                            │
│   Particle    Duality]                             │
│   Duality]       │                                  │
│     │         ┌──┴──┐                               │
│     │    [Double  [Heisenberg                      │
│     │     Slit]   Uncertainty]                     │
│     │                                               │
│  Click any node to explore →                       │
│                                                     │
│  [Wikipedia Sources: 12 articles]                  │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User clicks on a science topic
- OpenRAG retrieves related Wikipedia articles
- System generates concept map showing relationships
- Each node is clickable for deeper exploration
- Shows citation count and source quality

**OpenRAG Demo Value:**
- Shows relationship extraction from documents
- Demonstrates multi-document synthesis
- Highlights semantic understanding

### Mode 2: "Time Machine" - Historical Science Timeline

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  ⏰ SCIENCE TIMELINE: Electricity                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1600 ●────────────────────────────────────────    │
│       William Gilbert                               │
│       "De Magnete" - magnetism studies              │
│       [View Details] [Sources: 3]                   │
│                                                     │
│  1752      ●───────────────────────────────────    │
│            Benjamin Franklin                        │
│            Kite experiment - lightning is electric  │
│            [View Details] [Sources: 5]              │
│                                                     │
│  1800           ●──────────────────────────────    │
│                 Alessandro Volta                    │
│                 Invents the battery                 │
│                 [View Details] [Sources: 4]         │
│                                                     │
│  ◄ Scroll through time ►                           │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User selects a science topic or discovery
- OpenRAG retrieves historical Wikipedia articles
- System extracts dates, people, events
- Builds interactive timeline
- Each event expandable with full context

**OpenRAG Demo Value:**
- Shows temporal information extraction
- Demonstrates structured data from unstructured text
- Highlights citation linking

### Mode 3: "Explain-O-Matic" - Multi-Level Explanations

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  🎓 EXPLAIN: Black Holes                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Choose your level:                                 │
│                                                     │
│  [👶 Age 5]  [🎒 Middle School]  [🎓 Undergrad]    │
│  [📚 Graduate]  [🔬 Expert]                         │
│                                                     │
│  ──────────────────────────────────────────────    │
│                                                     │
│  📖 Age 5 Explanation:                              │
│                                                     │
│  A black hole is like a super strong vacuum        │
│  cleaner in space. It's so strong that even        │
│  light can't escape once it gets too close!        │
│                                                     │
│  [Show me a picture] [What happens if you fall in?]│
│                                                     │
│  Sources: Simple English Wikipedia, NASA Kids      │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User picks a topic and knowledge level
- OpenRAG retrieves appropriate Wikipedia articles
  - Simple English Wikipedia for beginners
  - Standard Wikipedia for intermediate
  - Technical articles for advanced
- System generates explanation at right level
- Provides follow-up questions based on level

**OpenRAG Demo Value:**
- Shows context-aware retrieval
- Demonstrates content adaptation
- Highlights multi-source synthesis

### Mode 4: "Myth Buster" - Fact vs Fiction

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  ❓ MYTH OR FACT?                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Statement:                                         │
│  "We only use 10% of our brain"                     │
│                                                     │
│  [MYTH] ◄─────●─────► [FACT]                       │
│                                                     │
│  ──────────────────────────────────────────────    │
│                                                     │
│  🔍 Analysis:                                       │
│                                                     │
│  ❌ MYTH - This is a common misconception!          │
│                                                     │
│  Evidence from 5 Wikipedia sources:                 │
│  • Brain imaging shows all parts active [1]        │
│  • Evolutionary biology contradicts this [2]       │
│  • Neuroscience research debunks claim [3]         │
│                                                     │
│  [See Full Evidence] [Try Another Statement]       │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User enters a science claim or picks from common myths
- OpenRAG searches Wikipedia for evidence
- System analyzes multiple sources
- Provides verdict with citations
- Shows confidence level based on source agreement

**OpenRAG Demo Value:**
- Shows multi-source fact checking
- Demonstrates evidence synthesis
- Highlights citation importance

### Mode 5: "Discovery Lab" - Interactive Experiments

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  🧪 VIRTUAL LAB: Newton's Laws                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Experiment: Pendulum Motion                        │
│                                                     │
│      ╱│╲                                            │
│     ╱ │ ╲                                           │
│    ╱  │  ╲                                          │
│   ╱   ●   ╲  ← Adjust length: [====●====]          │
│  ╱    │    ╲                                        │
│                                                     │
│  Mass: [====●====]  Angle: [====●====]             │
│                                                     │
│  [Start Simulation]                                 │
│                                                     │
│  📚 Theory (from Wikipedia):                        │
│  Period = 2π√(L/g)                                  │
│  [Show derivation] [Historical context]            │
│                                                     │
│  🎯 Try to predict: What happens if you double     │
│     the length?                                     │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User selects a physics/chemistry concept
- OpenRAG retrieves Wikipedia articles about the phenomenon
- System extracts formulas, principles, historical context
- Provides interactive simulation
- Links theory to practice with citations

**OpenRAG Demo Value:**
- Shows formula extraction from documents
- Demonstrates structured data retrieval
- Highlights educational content synthesis

### Mode 6: "Compare-O-Tron" - Side-by-Side Concepts

**The Interface:**
```
┌─────────────────────────────────────────────────────┐
│  ⚖️  COMPARE: Mitosis vs Meiosis                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MITOSIS              │  MEIOSIS                    │
│  ─────────────────────┼─────────────────────────   │
│  Purpose:             │  Purpose:                   │
│  Growth & repair [1]  │  Sexual reproduction [2]    │
│                       │                             │
│  Cell divisions:      │  Cell divisions:            │
│  One (1) [1]          │  Two (2) [2]                │
│                       │                             │
│  Daughter cells:      │  Daughter cells:            │
│  2 identical [1]      │  4 unique [2]               │
│                       │                             │
│  Chromosome #:        │  Chromosome #:              │
│  Same as parent [1]   │  Half of parent [2]         │
│                       │                             │
│  [Show Diagrams] [Add Another Comparison]          │
│                                                     │
│  Sources: [1] Mitosis (Wikipedia)                   │
│           [2] Meiosis (Wikipedia)                   │
└─────────────────────────────────────────────────────┘
```

**How It Works:**
- User picks two related concepts to compare
- OpenRAG retrieves both Wikipedia articles
- System extracts comparable attributes
- Displays side-by-side with citations
- Highlights similarities and differences

**OpenRAG Demo Value:**
- Shows multi-document comparison
- Demonstrates attribute extraction
- Highlights structured synthesis

---

## Wikipedia Data Strategy

### What to Ingest:

1. **Core Science Topics** (~1000 articles)
   - Physics: Mechanics, Thermodynamics, Quantum, Relativity
   - Chemistry: Elements, Reactions, Organic, Inorganic
   - Biology: Cell Biology, Genetics, Evolution, Ecology
   - Astronomy: Solar System, Stars, Galaxies, Cosmology
   - Earth Science: Geology, Meteorology, Oceanography

2. **Historical Articles** (~500 articles)
   - Famous scientists and their discoveries
   - Timeline of scientific breakthroughs
   - History of scientific fields

3. **Simple English Wikipedia** (~500 articles)
   - Same topics but simplified versions
   - For multi-level explanations

### How to Ingest:

```python
# Pseudo-code for Wikipedia ingestion

from openrag import DocumentIngester
import wikipediaapi

# Initialize Wikipedia API
wiki = wikipediaapi.Wikipedia('en')

# Science topics to ingest
topics = [
    "Quantum mechanics",
    "Theory of relativity", 
    "DNA",
    "Evolution",
    "Black hole",
    # ... etc
]

# Ingest each topic
for topic in topics:
    page = wiki.page(topic)
    
    # Use OpenRAG's Docling to parse
    document = {
        'title': page.title,
        'content': page.text,
        'url': page.fullurl,
        'sections': extract_sections(page),
        'metadata': {
            'source': 'wikipedia',
            'language': 'en',
            'last_modified': page.touched,
            'categories': page.categories,
        }
    }
    
    # Ingest into OpenRAG
    ingester.ingest(document)
```

### Metadata to Track:

```typescript
interface WikipediaDocument {
  title: string;
  url: string;
  content: string;
  sections: Array<{
    heading: string;
    level: number;
    content: string;
  }>;
  metadata: {
    source: 'wikipedia' | 'simple_wikipedia';
    language: string;
    last_modified: string;
    categories: string[];
    related_topics: string[];
    difficulty_level: 'simple' | 'standard' | 'technical';
  };
}
```

---

## Visual Aesthetic

### Retro Science Lab Theme:

**Color Palette:**
- Background: Dark blue-black (#0a0e1a)
- Primary: Bright cyan (#00ffff) - like old CRT monitors
- Secondary: Lime green (#00ff00) - classic terminal
- Accent: Amber (#ffaa00) - warning/highlight
- Text: White (#ffffff) with slight glow

**Typography:**
- Headings: Pixel/bitmap font (like PixelTicker)
- Body: Monospace font (Courier-style)
- Formulas: Special math font with retro styling

**UI Elements:**
- Scanlines effect (subtle CRT look)
- Blinking cursors
- "Loading" animations with progress bars
- Beep/boop sound effects
- Oscilloscope-style visualizations
- Periodic table aesthetic for navigation

**Icons/Graphics:**
- Pixel art atoms, molecules, planets
- Retro computer graphics style
- ASCII art diagrams where appropriate
- Animated sprites for interactions

---

## Audio/Visual Feedback (Like PixelTicker)

### Sounds:
- **Query submitted**: Computer beep (different pitch per mode)
- **Document retrieved**: Disk drive sound
- **Fact found**: "Ding!" (like a discovery)
- **Myth busted**: Buzzer sound
- **Timeline scroll**: Tape rewind/fast-forward
- **Concept connection**: Synth "pop"

### Visual Effects:
- **Loading**: Retro progress bar with percentage
- **Success**: Screen flash (subtle)
- **Citation appear**: Fade-in with glow
- **Mode switch**: Screen "reboot" animation
- **Error**: Red screen flash with warning beep

### Background:
- Subtle animated particles (like atoms/molecules)
- Pulsing grid lines
- Occasional "data stream" effects
- Constellation patterns for astronomy topics

---

## Technical Architecture

### Reuse from PixelTicker:

1. **Dynamic UI System** - Already have component registry
2. **Audio Hooks** - Background music, TTS, sound effects
3. **Langflow Integration** - Agent routing and orchestration
4. **Type System** - Extend for science-specific components

### New Components Needed:

```typescript
// New UI component types for science app

interface ConceptMapSpec extends UIComponentSpec {
  type: 'concept-map';
  props: {
    central_concept: string;
    related_concepts: Array<{
      name: string;
      relationship: string;
      distance: number; // for layout
    }>;
    citations: Citation[];
  };
}

interface TimelineSpec extends UIComponentSpec {
  type: 'timeline';
  props: {
    events: Array<{
      date: string;
      title: string;
      description: string;
      people: string[];
      citations: Citation[];
    }>;
    start_year: number;
    end_year: number;
  };
}

interface ComparisonTableSpec extends UIComponentSpec {
  type: 'comparison-table';
  props: {
    concept1: string;
    concept2: string;
    attributes: Array<{
      name: string;
      value1: string;
      value2: string;
      citation1: Citation;
      citation2: Citation;
    }>;
  };
}

interface ExplanationLevelSpec extends UIComponentSpec {
  type: 'explanation-levels';
  props: {
    concept: string;
    levels: {
      simple: { text: string; citations: Citation[] };
      intermediate: { text: string; citations: Citation[] };
      advanced: { text: string; citations: Citation[] };
    };
    current_level: 'simple' | 'intermediate' | 'advanced';
  };
}
```

---

## Demo Flow Examples

### Example 1: Exploring Quantum Mechanics

1. **User lands on home screen**
   - Sees retro science terminal interface
   - Options: Explorer, Timeline, Explain, Compare, etc.

2. **Selects "Explorer" mode**
   - Types or selects "Quantum Mechanics"
   - OpenRAG retrieves 10 related Wikipedia articles
   - System generates concept map

3. **Clicks on "Wave-Particle Duality"**
   - New screen with detailed explanation
   - Shows citations from 3 Wikipedia articles
   - Offers "Explain at different level" button
   - Suggests related concepts to explore

4. **Clicks "Show me the experiment"**
   - Switches to interactive double-slit simulation
   - Theory explanation alongside (from Wikipedia)
   - Historical context (Young's experiment, 1801)

### Example 2: Fact-Checking a Myth

1. **User selects "Myth Buster" mode**
   - Sees input field with example myths
   - Types: "Lightning never strikes the same place twice"

2. **OpenRAG searches Wikipedia**
   - Retrieves articles on lightning, meteorology
   - Extracts relevant facts
   - Finds contradicting evidence

3. **Shows result: MYTH**
   - Displays evidence from 4 sources
   - Shows Empire State Building struck 100+ times/year
   - Explains the science behind lightning
   - All with Wikipedia citations

4. **User clicks "Why do people believe this?"**
   - Shows historical context
   - Explains the misconception origin
   - Links to related myths

---

## Why This is a Great OpenRAG Demo

1. **Showcases Core Features**
   - Document parsing (Wikipedia structure)
   - Hybrid search (semantic + keyword)
   - Multi-source synthesis (comparing articles)
   - Citation tracking (every fact sourced)

2. **Beyond Simple Chat**
   - 6 different interaction modes
   - Visual, interactive interfaces
   - Not just Q&A

3. **Easy to Set Up**
   - Wikipedia API is free and accessible
   - No licensing issues
   - Comprehensive coverage of science topics
   - Already well-structured

4. **Engaging & Fun**
   - Retro aesthetic is memorable
   - Interactive elements keep users engaged
   - Educational value is clear
   - Appeals to wide audience

5. **Extensible**
   - Easy to add more topics
   - Can add more interaction modes
   - Framework works for other domains
   - Community could contribute topics

---

## Next Steps

1. **Prototype One Mode** - Start with "Explain-O-Matic" (simplest)
2. **Ingest Sample Data** - 50 Wikipedia articles on popular topics
3. **Test OpenRAG Integration** - Verify retrieval quality
4. **Build UI Components** - Extend PixelTicker's component system
5. **Add Audio/Visual** - Reuse PixelTicker's feedback systems
6. **Iterate** - Add more modes based on what works

---

## Questions for You

1. **Which interaction mode excites you most?** Explorer, Timeline, Explain, Myth Buster, Lab, or Compare?

2. **Scope for first version?** Should we start with one mode or build multiple?

3. **Topic focus?** All of science, or start with one field (physics, biology, etc.)?

4. **Name?** Is "PixelScience" good, or something else? (PixelLab, PixelDiscovery, PixelAtom?)

5. **Additional modes?** Any other interaction patterns you'd like to see?

