# Langflow Response Format Documentation

This document describes the expected response format for Langflow agents in the PixelTicker application. Langflow should return structured JSON responses that include both text answers and optional UI component specifications.

## Response Structure

```typescript
{
  "text": string,           // Primary text response (required) - can also use "answer"
  "components": Array<{     // Optional UI components
    "type": string,
    "props": object,
    "id": string           // Optional unique identifier
  }>
}
```

**Note:** The text response field can be named either `"text"` or `"answer"` - both are supported for compatibility.

## Available Component Types

### 0. explain-o-matic ⭐ NEW

**Route:** `/api/ask-space` (Space theme)
**Title:** 2-Level Educational Explanations
**Description:** Provides explanations at 2 knowledge levels (Kid Mode and Layperson) with related topics, citations, and follow-up questions. User's selected knowledge level persists via localStorage.

**Use Cases:**
- Educational explanations of complex topics
- Kid-friendly and adult explanations
- Scientific concept explanations
- Technical topic breakdowns
- When user asks "Explain [topic]" or "What is [concept]?"

**CRITICAL: You MUST generate content for BOTH knowledge levels (kid and layperson) in a single response.**

**Props:**
```typescript
{
  topic: string,                          // Topic being explained (required)
  levels: {                               // BOTH levels required
    "kid": {
      explanation: string,                // Fun, simple explanation for kids
      relatedTopics?: Array<{title: string, description: string}>,
      citations?: Array<{source: string, url?: string, excerpt?: string}>,
      followUpQuestions?: string[]
    },
    "layperson": {
      explanation: string,                // Clear, detailed explanation for adults
      relatedTopics?: Array<{title: string, description: string}>,
      citations?: Array<{source: string, url?: string, excerpt?: string}>,
      followUpQuestions?: string[]
    }
  }
}
```

**Agent Prompt Guidelines:**

When user asks for an explanation, you must:

1. **Generate Content for BOTH Levels**: You must create explanations for kid AND layperson in a single response

2. **Level-Appropriate Content Guidelines**:
   - **kid**: Simple, everyday words (500-1000 common words), 5-10 word sentences, concrete examples, fun analogies (toys, food, animals, playground), playful and encouraging tone
   - **layperson**: Standard adult vocabulary with scientific terms explained, 15-25 word sentences, clear scientific concepts without jargon, real-world examples, educational and informative tone

3. **Include Supporting Content for Each Level**:
   - 2-4 related topics for further exploration
   - 2-4 citations from Wikipedia (Simple English Wikipedia for kid level, standard Wikipedia for layperson)
   - 3-5 follow-up questions to deepen understanding

**Example Response with BOTH Levels:**
```json
{
  "text": "Here's an explanation of black holes at both kid and layperson levels.",
  "components": [
    {
      "type": "explain-o-matic",
      "props": {
        "topic": "Black Holes",
        "levels": {
          "age5": {
            "explanation": "A black hole is like a super-duper strong space vacuum cleaner! It's so strong that if anything gets too close - even light - it gets sucked in and can never escape.\n\nBlack holes are made when really, really big stars get old and collapse. They squeeze down into a tiny space, but they're still super heavy. That makes them pull on everything around them really hard.\n\nIf you could see a black hole (which you can't because they're black!), it would look like a dark circle in space. Around it, you might see bright swirly stuff - that's things spinning around before they fall in, like water going down a drain!",
            "relatedTopics": [
              {"title": "Stars", "description": "The bright lights in the night sky"},
              {"title": "Gravity", "description": "The force that pulls things down"}
            ],
            "citations": [
              {
                "source": "NASA Kids - Black Holes",
                "url": "https://www.nasa.gov/black-holes-kids",
                "excerpt": "A black hole is a place in space where gravity pulls so much that even light cannot get out."
              }
            ],
            "followUpQuestions": [
              "What happens if you fall into a black hole?",
              "Can we see black holes?",
              "Are black holes dangerous to Earth?"
            ]
          },
          "layperson": {
            "explanation": "Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars (typically more than 25 times the mass of our Sun) undergo gravitational collapse at the end of their lives.\n\nThe event horizon marks the boundary beyond which escape is impossible. For a non-rotating black hole, this radius is given by the Schwarzschild radius. Rotating black holes have more complex geometries.\n\nBlack holes are classified by mass: stellar-mass (3-100 solar masses), intermediate-mass (100-100,000 solar masses), and supermassive (millions to billions of solar masses). Despite being invisible, black holes can be detected through their gravitational effects on nearby matter, X-ray emissions from accretion disks, and gravitational waves from mergers.",
            "relatedTopics": [
              {"title": "Event Horizon", "description": "The boundary of no return around a black hole"},
              {"title": "Hawking Radiation", "description": "Theoretical radiation that causes black holes to evaporate"},
              {"title": "Gravitational Waves", "description": "Ripples in spacetime from black hole mergers"}
            ],
            "citations": [
              {
                "source": "Wikipedia - Black Hole",
                "url": "https://en.wikipedia.org/wiki/Black_hole",
                "excerpt": "A black hole is a region of spacetime where gravity is so strong that nothing can escape from it."
              },
              {
                "source": "Wikipedia - Event Horizon",
                "url": "https://en.wikipedia.org/wiki/Event_horizon",
                "excerpt": "The event horizon is the boundary beyond which events cannot affect an outside observer."
              }
            ],
            "followUpQuestions": [
              "How does the Page curve resolve the information paradox?",
              "What role do quantum extremal surfaces play?"
            ]
          },
          "expert": {
            "explanation": "Contemporary black hole physics centers on resolving the information paradox through quantum error correction codes and the emergence of spacetime from entanglement. The island formula S = min[ext(Area/4G + S_matter)] computes fine-grained entropy, reproducing the Page curve.\n\nThe ER=EPR conjecture posits that entangled states are connected by wormholes, with implications for black hole complementarity and the firewall paradox. Replica wormholes in the gravitational path integral provide a mechanism for information recovery.\n\nJT gravity and SYK models serve as solvable laboratories for black hole physics, exhibiting maximal chaos (λ_L = 2πk_BT/ℏ) and connections to random matrix theory. These developments suggest black holes are fast scramblers with quantum computational complexity growth.",
            "relatedTopics": [
              {"title": "Quantum Extremal Surfaces", "description": "Island formula and Page curve"},
              {"title": "SYK Model", "description": "Holographic dual to JT gravity"},
              {"title": "Replica Wormholes", "description": "Path integral approach to information recovery"}
            ],
            "citations": [
              {
                "source": "Almheiri et al. (2020) - The Page Curve of Hawking Radiation",
                "url": "https://arxiv.org/abs/1908.10996",
                "excerpt": "Islands in the gravitational path integral resolve the information paradox."
              },
              {
                "source": "Penington (2020) - Entanglement Wedge Reconstruction",
                "url": "https://arxiv.org/abs/1905.08255",
                "excerpt": "Quantum extremal surfaces compute fine-grained entropy."
              }
            ],
            "followUpQuestions": [
              "How do replica wormholes contribute to the gravitational path integral?",
              "What is the relationship between quantum error correction and bulk reconstruction?",
              "Can we formulate a microscopic theory of black hole microstates?"
            ]
            "followUpQuestions": [
              "How do scientists detect black holes?",
              "Can black holes die?",
              "What is the closest black hole to Earth?",
              "What happens at the singularity?"
            ]
          }
        }
      }
    }
  ]
}
```

**Key Features:**
- ✅ User's knowledge level selection persists via localStorage
- ✅ Clickable related topics populate the query bar
- ✅ Clickable follow-up questions populate the query bar
- ✅ Citations with optional URLs
- ✅ Responsive cyberpunk/pixel aesthetic
- ✅ Smooth transitions between knowledge levels

---

### 1. text-block

Display formatted text content with optional markdown support. Ideal for detailed explanations, descriptions, or any text-heavy content.

**Use Cases:**
- Detailed explanations
- Multi-paragraph descriptions
- Formatted documentation
- Lists and structured text

**Props:**
```typescript
{
  content: string,                    // The text content (required)
  format: "plain" | "markdown"        // Format type (optional, default: "plain")
}
```

**Example - Plain Text:**
```json
{
  "text": "Moon-Earth distance",
  "components": [
    {
      "type": "text-block",
      "props": {
        "content": "Distance (center-to-center): average ~384,400 km (238,855 miles).\n\nThis varies due to the Moon's elliptical orbit:\n- Perigee (closest): ~356,500 km\n- Apogee (farthest): ~406,700 km",
        "format": "plain"
      }
    }
  ]
}
```

**Example - Markdown:**
```json
{
  "text": "Black holes explained",
  "components": [
    {
      "type": "text-block",
      "props": {
        "content": "## What is a Black Hole?\n\nA **black hole** is a region of spacetime where gravity is so strong that nothing can escape.\n\n### Key Properties:\n- *Event Horizon*: The point of no return\n- *Singularity*: Infinite density at the center\n- *Hawking Radiation*: Theoretical radiation emission\n\nLearn more at [NASA](https://www.nasa.gov/black-holes)",
        "format": "markdown"
      }
    }
  ]
}
```

**Markdown Support:**
- Headers: `## Header`, `### Subheader`
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Links: `[text](url)`
- Paragraphs: Double newline

---

### 2. planet-card

Display detailed information about planets, moons, or other celestial bodies.

**Props:**
```typescript
{
  name: string,              // Name of celestial body (required)
  description: string,       // Detailed description (required)
  diameter: string,          // Size measurement (required)
  mass: string,              // Mass measurement (required)
  distanceFromSun: string,   // Distance from sun/parent (required)
  orbitalPeriod: string,     // Orbital period (required)
  moons: number,             // Number of moons (optional)
  imageUrl: string           // Image URL (optional)
}
```

**Example:**
```json
{
  "text": "Mars is the fourth planet from the Sun...",
  "components": [
    {
      "type": "planet-card",
      "props": {
        "name": "Mars",
        "description": "The Red Planet, known for its rusty color caused by iron oxide.",
        "diameter": "6,779 km",
        "mass": "6.39 × 10²³ kg",
        "distanceFromSun": "227.9 million km",
        "orbitalPeriod": "687 Earth days",
        "moons": 2
      }
    }
  ]
}
```

---

### 3. constellation

Show constellation information with star data.

**Props:**
```typescript
{
  name: string,              // Constellation name (required)
  abbreviation: string,      // 3-letter abbreviation (required)
  description: string,       // Detailed description (required)
  brightestStar: string,     // Brightest star name (optional)
  visibility: string,        // When/where visible (required)
  stars: Array<{             // Notable stars (required)
    name: string,
    magnitude: number
  }>
}
```

**Example:**
```json
{
  "text": "Orion is one of the most recognizable constellations...",
  "components": [
    {
      "type": "constellation",
      "props": {
        "name": "Orion",
        "abbreviation": "Ori",
        "description": "The Hunter constellation, featuring Orion's Belt.",
        "brightestStar": "Rigel (β Orionis)",
        "visibility": "Visible worldwide, best seen December-March",
        "stars": [
          { "name": "Rigel", "magnitude": 0.13 },
          { "name": "Betelgeuse", "magnitude": 0.50 },
          { "name": "Bellatrix", "magnitude": 1.64 }
        ]
      }
    }
  ]
}
```

---

### 4. space-timeline

Display chronological space events (missions, discoveries, observations).

**Props:**
```typescript
{
  title: string,             // Timeline title (required)
  events: Array<{            // Chronological events (required)
    date: string,            // Date or time period
    title: string,           // Event name
    description: string,     // Event details
    type: "mission" | "discovery" | "observation"  // Event category (optional)
  }>
}
```

**Example:**
```json
{
  "text": "Mars exploration has a rich history...",
  "components": [
    {
      "type": "space-timeline",
      "props": {
        "title": "Mars Exploration Timeline",
        "events": [
          {
            "date": "1965",
            "title": "Mariner 4",
            "description": "First successful flyby of Mars",
            "type": "mission"
          },
          {
            "date": "2021",
            "title": "Perseverance & Ingenuity",
            "description": "Rover and first Mars helicopter",
            "type": "mission"
          }
        ]
      }
    }
  ]
}
```

---

### 5. metric-card

Display a single metric with optional change indicator.

**Props:**
```typescript
{
  title: string,             // Metric title (required)
  value: string | number,    // Metric value (required)
  change: number,            // Percentage change (optional)
  changeLabel: string,       // Change description (optional)
  subtitle: string           // Additional context (optional)
}
```

**Example:**
```json
{
  "type": "metric-card",
  "props": {
    "title": "Light Speed",
    "value": "299,792,458 m/s",
    "subtitle": "In vacuum"
  }
}
```

---

### 6. metric-grid

Display multiple metrics in a grid layout.

**Props:**
```typescript
{
  metrics: Array<{           // Array of metrics (required)
    label: string,
    value: string | number,
    change: number,          // Optional
    icon: string             // Optional
  }>
}
```

---

### 7. data-table

Display tabular data with optional column highlighting.

**Props:**
```typescript
{
  title: string,             // Table title (required)
  headers: string[],         // Column headers (required)
  rows: Array<Array<string | number>>,  // Table data (required)
  highlightColumn: number    // Column index to highlight (optional)
}
```

---

### 8. comparison-table

Display side-by-side comparisons.

**Props:**
```typescript
{
  title: string,             // Table title (required)
  items: Array<{             // Comparison items (required)
    label: string,
    value1: string | number,
    value2: string | number,
    change: number           // Optional
  }>,
  column1Label: string,      // First column label (required)
  column2Label: string       // Second column label (required)
}
```

---

### 9. alert-box

Display informational alerts or warnings.

**Props:**
```typescript
{
  message: string,           // Alert message (required)
  severity: "info" | "warning" | "success" | "error",  // Alert type (required)
  title: string              // Alert title (optional)
}
```

**Example:**
```json
{
  "type": "alert-box",
  "props": {
    "message": "Solar flare activity detected",
    "severity": "warning",
    "title": "Space Weather Alert"
  }
}
```

---

## Best Practices

### 1. Always Include Text Response
Every response must include a `text` field with a human-readable answer, even when components are provided.

### 2. Choose Appropriate Components
Select component types that best visualize the data:
- Use `text-block` for detailed explanations
- Use `planet-card` for celestial body information
- Use `space-timeline` for chronological events
- Use `metric-card` or `metric-grid` for numerical data

### 3. Multiple Components
You can return multiple components in a single response:

```json
{
  "text": "Our Solar System has 8 planets...",
  "components": [
    { "type": "planet-card", "props": { "name": "Mercury", ... } },
    { "type": "planet-card", "props": { "name": "Venus", ... } },
    { "type": "planet-card", "props": { "name": "Earth", ... } }
  ]
}
```

### 4. Markdown Formatting
When using `text-block` with markdown:
- Use headers for structure
- Use bold for emphasis
- Use code blocks for technical terms
- Keep paragraphs concise
- Add links for additional resources

### 5. Security Considerations
- Validate all data before including in responses
- Sanitize user input to prevent injection attacks
- Follow OWASP security standards
- Never include sensitive information in responses

### 6. Error Handling
If an error occurs, return:

```json
{
  "text": "I encountered an error processing your request.",
  "error": "Error description"
}
```

---

## Theme-Specific Styling

All components automatically apply the space theme styling:
- Dark backgrounds (#0a0e27, #1a1f3a)
- Royal blue accents (#4169E1)
- Turquoise highlights (#00CED1)
- Purple secondary colors (#9370DB)
- Glowing text effects
- Pixel-art borders

Components are responsive and work on all screen sizes.

---

## Testing Your Responses

Before deploying, test your Langflow responses:

1. Verify JSON structure is valid
2. Ensure all required props are included
3. Test with multiple component types
4. Verify markdown rendering (if using text-block)
5. Check that text responses are clear and informative

---

## Examples by Query Type

### Factual Question
```json
{
  "text": "The Moon orbits Earth at an average distance of 384,400 km.",
  "components": [
    {
      "type": "text-block",
      "props": {
        "content": "Distance (center-to-center): average ~384,400 km (238,855 miles).\n\nThis varies due to the Moon's elliptical orbit:\n- Perigee (closest): ~356,500 km\n- Apogee (farthest): ~406,700 km",
        "format": "plain"
      }
    }
  ]
}
```

### Celestial Body Query
```json
{
  "text": "Jupiter is the largest planet...",
  "components": [
    {
      "type": "planet-card",
      "props": { ... }
    }
  ]
}
```

### Historical Query
```json
{
  "text": "The Apollo program achieved remarkable milestones...",
  "components": [
    {
      "type": "space-timeline",
      "props": { ... }
    }
  ]
}
```

---

Made with Bob