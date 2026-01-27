# Celestial Body Card - Agent Prompt Guide

## Overview
Create celestial-body-card components for planets, moons, stars, galaxies, black holes, and nebulae.

## Response Structure

```json
{
  "answer": "Brief answer (1-2 sentences)",
  "components": [{
    "type": "celestial-body-card",
    "props": {
      "name": "string",
      "bodyType": "planet|moon|star|galaxy|black-hole|nebula",
      "description": "Educational description (2-3 sentences)",
      "enableImageGeneration": true,
      // Type-specific properties below
    }
  }]
}
```

## Properties by Body Type

### PLANET
**Required**: name, bodyType, description  
**Recommended**: diameter, mass, distanceFrom, distanceFromLabel ("Distance from Sun"), orbitalPeriod, satellites, satelliteLabel ("Moons"), planetType (terrestrial|gas-giant|ice-giant|dwarf), enableImageGeneration

**Example - Mars**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Mars",
    "bodyType": "planet",
    "description": "The Red Planet with iron oxide surface and Olympus Mons volcano, the largest volcano in the solar system.",
    "diameter": "6,779 km",
    "mass": "6.39 × 10²³ kg",
    "distanceFrom": "227.9 million km",
    "distanceFromLabel": "Distance from Sun",
    "orbitalPeriod": "687 Earth days",
    "satellites": 2,
    "satelliteLabel": "Moons",
    "planetType": "terrestrial",
    "enableImageGeneration": true
  }
}
```

### MOON
**Required**: name, bodyType, description  
**Recommended**: diameter, mass, distanceFrom, distanceFromLabel ("Distance from [Planet]"), orbitalPeriod, parentBody, enableImageGeneration

**Example - Europa**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Europa",
    "bodyType": "moon",
    "description": "Jupiter's icy moon with a subsurface ocean that may harbor life.",
    "diameter": "3,121 km",
    "mass": "4.8 × 10²² kg",
    "distanceFrom": "671,000 km",
    "distanceFromLabel": "Distance from Jupiter",
    "orbitalPeriod": "3.55 Earth days",
    "parentBody": "Jupiter",
    "enableImageGeneration": true
  }
}
```

### STAR
**Required**: name, bodyType, description  
**Recommended**: diameter, mass, spectralClass, temperature, luminosity, satellites (optional), satelliteLabel ("Planets"), starType (main-sequence|red-giant|white-dwarf|neutron-star), enableImageGeneration

**Example - The Sun**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "The Sun",
    "bodyType": "star",
    "description": "A G-type main-sequence star that contains 99.86% of the Solar System's mass and provides energy for life on Earth.",
    "diameter": "1.39 million km",
    "mass": "1.989 × 10³⁰ kg",
    "spectralClass": "G2V",
    "temperature": "5,778 K",
    "luminosity": "1 L☉",
    "satellites": 8,
    "satelliteLabel": "Planets",
    "starType": "main-sequence",
    "enableImageGeneration": true
  }
}
```

**Example - Betelgeuse**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Betelgeuse",
    "bodyType": "star",
    "description": "A red supergiant star in Orion, one of the largest known stars that will eventually explode as a supernova.",
    "diameter": "1.2 billion km",
    "mass": "16.5 M☉",
    "spectralClass": "M1-M2",
    "temperature": "3,500 K",
    "luminosity": "126,000 L☉",
    "starType": "red-giant",
    "enableImageGeneration": true
  }
}
```

### GALAXY
**Required**: name, bodyType, description  
**Recommended**: galaxyType (Spiral|Elliptical|Irregular|Barred Spiral), diameter, starCount, distanceFromEarth, enableImageGeneration

**Example - Andromeda**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Andromeda Galaxy",
    "bodyType": "galaxy",
    "description": "The nearest major galaxy to the Milky Way, on a collision course with our galaxy in about 4.5 billion years.",
    "galaxyType": "Spiral",
    "diameter": "220,000 light-years",
    "starCount": "1 trillion stars",
    "distanceFromEarth": "2.537 million light-years",
    "enableImageGeneration": true
  }
}
```

### BLACK-HOLE
**Required**: name, bodyType, description  
**Recommended**: blackHoleType (Stellar|Supermassive|Intermediate), mass, eventHorizonRadius, distanceFromEarth, enableImageGeneration

**Example - Sagittarius A***:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Sagittarius A*",
    "bodyType": "black-hole",
    "description": "Supermassive black hole at the center of the Milky Way galaxy, with a mass of 4 million suns.",
    "blackHoleType": "Supermassive",
    "mass": "4.1 million M☉",
    "eventHorizonRadius": "12 million km",
    "distanceFromEarth": "26,000 light-years",
    "enableImageGeneration": true
  }
}
```

### NEBULA
**Required**: name, bodyType, description  
**Recommended**: nebulaType (Emission|Reflection|Planetary|Supernova Remnant), diameter, distanceFromEarth, enableImageGeneration

**Example - Orion Nebula**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Orion Nebula",
    "bodyType": "nebula",
    "description": "Stellar nursery where new stars are being born in the Orion constellation, visible to the naked eye.",
    "nebulaType": "Emission",
    "diameter": "24 light-years",
    "distanceFromEarth": "1,344 light-years",
    "enableImageGeneration": true
  }
}
```

## Visual Themes

The component automatically applies different visual themes based on `bodyType`:

- **Planets**: Purple theme with 🪐 icon
- **Moons**: Silver theme with 🌙 icon
- **Stars**: Gold theme with ⭐ icon
- **Galaxies**: Deep purple theme with 🌌 icon
- **Black Holes**: Black/red theme with ⚫ icon
- **Nebulae**: Pink/cyan theme with ☁️ icon

## Rules

1. **Always set `type: "celestial-body-card"`** at the component level (not inside props)
2. **Always set `enableImageGeneration: true`** for visual appeal
3. **Include units** (km, kg, K, L☉, M☉, light-years)
4. **Use scientific notation** for large numbers (e.g., 1.898 × 10²⁷ kg)
5. **Use accurate astronomical data** from reliable sources
6. **Description can include any details** - image generation extracts only visual info
7. **Provide minimum 2-3 sentences** in description for educational value

## Multiple Bodies

For queries like "Tell me about Jupiter's moons", return multiple celestial-body-card components:

```json
{
  "answer": "Jupiter has 95 known moons. Here are the four largest Galilean moons:",
  "components": [
    {
      "type": "celestial-body-card",
      "props": {
        "name": "Io",
        "bodyType": "moon",
        "parentBody": "Jupiter",
        "description": "The most volcanically active body in the solar system.",
        "diameter": "3,643 km",
        "mass": "8.93 × 10²² kg",
        "distanceFrom": "421,700 km",
        "distanceFromLabel": "Distance from Jupiter",
        "orbitalPeriod": "1.77 Earth days",
        "enableImageGeneration": true
      }
    },
    {
      "type": "celestial-body-card",
      "props": {
        "name": "Europa",
        "bodyType": "moon",
        "parentBody": "Jupiter",
        "description": "An icy moon with a subsurface ocean that may harbor life.",
        "diameter": "3,121 km",
        "mass": "4.8 × 10²² kg",
        "distanceFrom": "671,000 km",
        "distanceFromLabel": "Distance from Jupiter",
        "orbitalPeriod": "3.55 Earth days",
        "enableImageGeneration": true
      }
    }
  ]
}
```

## Integration with Other Components

Celestial body cards work well with:
- `space-timeline`: For historical context about discoveries
- `constellation`: For stellar context and star positions
- `solar-system`: For orbital visualization
- `text-block`: For additional explanations

## Common Mistakes to Avoid

❌ **WRONG** - Missing `type` field:
```json
{
  "props": {
    "name": "Mars",
    "bodyType": "planet"
  }
}
```

✅ **CORRECT** - Include `type` field:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Mars",
    "bodyType": "planet"
  }
}
```

❌ **WRONG** - `bodyType` at component level:
```json
{
  "type": "planet",
  "props": {
    "name": "Mars"
  }
}
```

✅ **CORRECT** - `bodyType` inside props:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Mars",
    "bodyType": "planet"
  }
}
```

---

**Remember**: Always use `"type": "celestial-body-card"` at the component level, and `"bodyType"` inside props to specify what kind of celestial body it is!