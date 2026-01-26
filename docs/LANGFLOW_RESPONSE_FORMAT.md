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