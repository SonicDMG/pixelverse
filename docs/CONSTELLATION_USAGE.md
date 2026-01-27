# Constellation Component Usage Guide

## Overview
The Constellation component displays information about star constellations with a hybrid visualization: a list of notable stars on the left and an SVG sky view on the right showing the accurate star positions calculated from astronomical coordinates.

## Component Type
`constellation`

## When to Use
Use this component when:
- User asks about a specific constellation (e.g., "Tell me about Orion")
- User wants to see constellation patterns or star arrangements
- User inquires about stars within a constellation
- User asks about constellation visibility or location in the sky

## JSON Response Structure

```json
{
  "text": "Natural language description of the constellation",
  "components": [
    {
      "type": "constellation",
      "id": "unique-constellation-id",
      "props": {
        "name": "Constellation Name",
        "abbreviation": "3-letter IAU code",
        "description": "Detailed description of the constellation",
        "brightestStar": "Name of brightest star (optional)",
        "visibility": "When and where it can be seen",
        "stars": [
          {
            "name": "Star name with designation",
            "magnitude": 0.5,
            "ra": "5h 55m",
            "dec": "+7° 24'",
            "color": "M",
            "size": 2.5
          }
        ],
        "lines": [
          {"from": 0, "to": 1}
        ]
      }
    }
  ]
}
```

## Field Descriptions

### Required Fields

#### `name` (string)
- The full name of the constellation
- Use proper capitalization
- Examples: "Orion", "Ursa Major", "Cassiopeia"

#### `abbreviation` (string)
- The official 3-letter IAU (International Astronomical Union) abbreviation
- Always uppercase
- Examples: "Ori" (Orion), "UMa" (Ursa Major), "Cas" (Cassiopeia)

#### `description` (string)
- Detailed description of the constellation
- Include mythology, notable features, and astronomical significance
- Mention any famous deep-sky objects (nebulae, clusters, galaxies)
- 2-4 sentences recommended

#### `visibility` (string)
- When and where the constellation can be seen from Earth
- Include hemisphere(s) and best viewing season
- Examples:
  - "Visible worldwide, best seen December-March in Northern Hemisphere"
  - "Northern Hemisphere only, visible year-round, best in autumn"
  - "Southern Hemisphere, best viewed June-August"

#### `stars` (array)
- List of 5-10 notable stars in the constellation
- Each star object contains:
  - `name` (string): Star name with Bayer/Flamsteed designation
    - Format: "Common Name (Greek letter Constellation abbreviation)"
    - Examples: "Rigel (β Ori)", "Betelgeuse (α Ori)", "Polaris (α UMi)"
  - `magnitude` (number): Apparent visual magnitude
    - Lower values = brighter stars
    - Range typically -1.5 to 6.0 for visible stars
  - `ra` (string): Right Ascension in "HHh MMm" format
    - Examples: "5h 55m", "14h 15m", "0h 08m"
  - `dec` (string): Declination in "±DD° MM'" format (apostrophe optional)
    - Examples: "+7° 24'", "-8° 12", "+89° 16'"
  - `color` (string): Spectral class or hex color
    - Spectral classes: O (blue), B (blue-white), A (white), F (yellow-white), G (yellow), K (orange), M (red)
    - Or hex color: "#FF6B4A"
  - `size` (number, optional): Relative visual size multiplier (0.5-3.0)
    - Based on star's actual physical size and distance
    - Larger values = larger visual representation

#### `lines` (array, optional)
- Defines constellation pattern by connecting stars
- Each line object contains:
  - `from` (number): Index of star in stars array
  - `to` (number): Index of star in stars array
- Connect stars to form traditional asterism pattern

### Optional Fields

#### `brightestStar` (string)
- Name and designation of the constellation's brightest star
- Format: "Name (designation) - Magnitude X.XX"
- Example: "Rigel (β Ori) - Magnitude 0.13"

## Automatic Coordinate Conversion

The component automatically converts RA/Dec to canvas coordinates:
- **No manual coordinate calculation needed**
- Correct orientation (matches sky view from Earth)
- X-axis: Higher RA (east) → left side of canvas
- Y-axis: Higher Dec (north) → top of canvas

## Complete Example: Orion

```json
{
  "text": "Here's the magnificent Orion constellation, one of the most recognizable patterns in the night sky! Known as 'The Hunter' in Greek mythology, Orion dominates the winter sky in the Northern Hemisphere.",
  "components": [
    {
      "type": "constellation",
      "id": "orion-constellation",
      "props": {
        "name": "Orion",
        "abbreviation": "Ori",
        "description": "Orion the Hunter is one of the most prominent and recognizable constellations in the night sky. It contains two of the ten brightest stars: Rigel and Betelgeuse. The constellation is home to the famous Orion Nebula (M42), a stellar nursery visible to the naked eye.",
        "brightestStar": "Rigel (β Ori) - Magnitude 0.13",
        "visibility": "Visible worldwide, best seen December-March in Northern Hemisphere",
        "stars": [
          {
            "name": "Betelgeuse (α Ori)",
            "magnitude": 0.5,
            "ra": "5h 55m",
            "dec": "+7° 24'",
            "color": "M",
            "size": 2.5
          },
          {
            "name": "Rigel (β Ori)",
            "magnitude": 0.13,
            "ra": "5h 14m",
            "dec": "-8° 12'",
            "color": "B",
            "size": 2.8
          },
          {
            "name": "Bellatrix (γ Ori)",
            "magnitude": 1.64,
            "ra": "5h 25m",
            "dec": "+6° 21'",
            "color": "B",
            "size": 1.8
          },
          {
            "name": "Alnitak (ζ Ori)",
            "magnitude": 1.77,
            "ra": "5h 41m",
            "dec": "-1° 57'",
            "color": "O",
            "size": 1.7
          },
          {
            "name": "Alnilam (ε Ori)",
            "magnitude": 1.69,
            "ra": "5h 36m",
            "dec": "-1° 12'",
            "color": "B",
            "size": 1.8
          },
          {
            "name": "Mintaka (δ Ori)",
            "magnitude": 2.23,
            "ra": "5h 32m",
            "dec": "-0° 18'",
            "color": "O",
            "size": 1.5
          },
          {
            "name": "Saiph (κ Ori)",
            "magnitude": 2.09,
            "ra": "5h 48m",
            "dec": "-9° 40'",
            "color": "B",
            "size": 1.6
          },
          {
            "name": "Meissa (λ Ori)",
            "magnitude": 3.39,
            "ra": "5h 35m",
            "dec": "+9° 56'",
            "color": "O",
            "size": 1.2
          }
        ],
        "lines": [
          {"from": 7, "to": 0},
          {"from": 7, "to": 2},
          {"from": 0, "to": 3},
          {"from": 2, "to": 3},
          {"from": 3, "to": 4},
          {"from": 4, "to": 5},
          {"from": 3, "to": 6},
          {"from": 5, "to": 1},
          {"from": 1, "to": 6}
        ]
      }
    }
  ]
}
```

## Best Practices for AI Agents

### 1. Query Astronomical Data
- Use OpenRAG or astronomical databases to get accurate RA/Dec coordinates
- Query for: Right Ascension, Declination, magnitude, spectral class
- Include 5-10 brightest/most notable stars

### 2. Star Data Accuracy
- Use accurate RA/Dec values from astronomical sources
- Format RA as "HHh MMm" (e.g., "5h 55m")
- Format Dec as "±DD° MM'" (e.g., "+7° 24'")
- Provide spectral class for accurate star colors

### 3. Size Field
- Size represents visual appearance, not just magnitude
- Consider both physical size and distance
- Typical range: 0.5-3.0
- Larger stars (like Betelgeuse): 2.0-3.0
- Medium stars: 1.0-2.0
- Smaller stars: 0.5-1.5

### 4. Line Connections
- Research traditional asterism patterns
- Connect stars by array index
- Form recognizable constellation shape
- Avoid crossing lines when possible
- Use 5-15 lines for most constellations

### 5. Description Quality
- Include mythology or cultural significance
- Mention notable deep-sky objects
- Describe the constellation's appearance
- Keep it engaging (2-4 sentences)

## Spectral Class Colors

The component automatically converts spectral classes to colors:
- **O**: Blue (#9BB0FF) - Hottest stars
- **B**: Blue-white (#AABFFF)
- **A**: White (#CAD7FF)
- **F**: Yellow-white (#F8F7FF)
- **G**: Yellow (#FFF4EA) - Like our Sun
- **K**: Orange (#FFD2A1)
- **M**: Red-orange (#FF6B4A) - Coolest stars (like Betelgeuse)

## Visual Features

### Left Panel: Star List
- Color-coded stars by spectral class
- Star names with designations
- Magnitude values displayed
- Hover effects sync with visualization

### Right Panel: SVG Sky View
- Astronomically accurate star positions
- Stars sized by magnitude and size multiplier
- Constellation lines showing traditional pattern
- Background starfield for context
- Hover effects highlight connected stars

## Common Constellations Reference

### Zodiac Constellations
- Aries (Ari), Taurus (Tau), Gemini (Gem), Cancer (Cnc)
- Leo (Leo), Virgo (Vir), Libra (Lib), Scorpius (Sco)
- Sagittarius (Sgr), Capricornus (Cap), Aquarius (Aqr), Pisces (Psc)

### Northern Constellations
- Ursa Major (UMa), Ursa Minor (UMi), Cassiopeia (Cas)
- Cygnus (Cyg), Lyra (Lyr), Aquila (Aql)
- Draco (Dra), Cepheus (Cep), Perseus (Per)

### Southern Constellations
- Crux (Cru), Centaurus (Cen), Carina (Car)
- Vela (Vel), Puppis (Pup), Hydra (Hya)

### Prominent Year-Round
- Orion (Ori) - Winter
- Leo (Leo) - Spring
- Cygnus (Cyg) - Summer
- Pegasus (Peg) - Autumn

## Advantages of RA/Dec Approach

1. **Astronomically Accurate**: Uses real celestial coordinates
2. **Simple for Agents**: Just provide RA/Dec, no coordinate math
3. **Correct Orientation**: Automatically matches sky view from Earth
4. **Educational**: Shows actual star positions
5. **Flexible**: Works for any constellation
6. **Type-Safe**: Full TypeScript validation

---

**Made with Bob**