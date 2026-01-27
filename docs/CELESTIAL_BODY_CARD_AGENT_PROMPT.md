# Celestial Body Card - Agent Prompt Guide

## Overview
Use the `celestial-body-card` component to display detailed information about any celestial body: planets, moons, stars, or galaxies. This component automatically adapts its display based on the body type.

## When to Use

Use `celestial-body-card` when users ask about:
- **Planets**: "Tell me about Jupiter", "What is Mars like?", "Show me Saturn"
- **Moons**: "Tell me about the Moon", "What is Titan?", "Describe Europa"
- **Stars**: "Tell me about the Sun", "What is Betelgeuse?", "Describe Sirius"
- **Galaxies**: "Tell me about Andromeda", "What is the Milky Way?", "Describe M87"

## Component Structure

```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "string (required)",
    "bodyType": "planet | moon | star | galaxy (required)",
    "description": "string (required)",
    "enableImageGeneration": true
    // ... additional properties based on bodyType
  }
}
```

## Body Type: Planet

### Required Properties
- `name`: Planet name
- `bodyType`: "planet"
- `description`: Detailed description

### Recommended Properties
- `diameter`: Size (e.g., "12,742 km")
- `mass`: Mass (e.g., "5.97 × 10²⁴ kg")
- `distanceFrom`: Distance from sun (e.g., "149.6 million km")
- `distanceFromLabel`: "Distance from Sun"
- `orbitalPeriod`: Orbit time (e.g., "365.25 Earth days")
- `satellites`: Number of moons (e.g., 1)
- `satelliteLabel`: "Moon" or "Moons"
- `planetType`: "terrestrial" | "gas-giant" | "ice-giant" | "dwarf"
- `enableImageGeneration`: true

### Example: Jupiter
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Jupiter",
    "bodyType": "planet",
    "description": "The largest planet in our Solar System, a gas giant with the Great Red Spot storm.",
    "diameter": "139,820 km",
    "mass": "1.898 × 10²⁷ kg",
    "distanceFrom": "778.5 million km",
    "distanceFromLabel": "Distance from Sun",
    "orbitalPeriod": "11.9 Earth years",
    "satellites": 95,
    "satelliteLabel": "Moons",
    "planetType": "gas-giant",
    "enableImageGeneration": true
  }
}
```

## Body Type: Moon

### Required Properties
- `name`: Moon name
- `bodyType`: "moon"
- `description`: Detailed description

### Recommended Properties
- `diameter`: Size (e.g., "3,474 km")
- `mass`: Mass (e.g., "7.34 × 10²² kg")
- `distanceFrom`: Distance from parent planet (e.g., "384,400 km")
- `distanceFromLabel`: "Distance from [Planet]" (e.g., "Distance from Earth")
- `orbitalPeriod`: Orbit time (e.g., "27.3 Earth days")
- `parentBody`: Parent planet name (e.g., "Earth")
- `enableImageGeneration`: true

### Example: The Moon
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "The Moon",
    "bodyType": "moon",
    "description": "Earth's only natural satellite and the fifth largest moon in the solar system.",
    "diameter": "3,474 km",
    "mass": "7.34 × 10²² kg",
    "distanceFrom": "384,400 km",
    "distanceFromLabel": "Distance from Earth",
    "orbitalPeriod": "27.3 Earth days",
    "parentBody": "Earth",
    "enableImageGeneration": true
  }
}
```

### Example: Titan
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Titan",
    "bodyType": "moon",
    "description": "Saturn's largest moon with a thick atmosphere and liquid methane lakes.",
    "diameter": "5,150 km",
    "mass": "1.35 × 10²³ kg",
    "distanceFrom": "1.2 million km",
    "distanceFromLabel": "Distance from Saturn",
    "orbitalPeriod": "15.9 Earth days",
    "parentBody": "Saturn",
    "enableImageGeneration": true
  }
}
```

## Body Type: Star

### Required Properties
- `name`: Star name
- `bodyType`: "star"
- `description`: Detailed description

### Recommended Properties
- `diameter`: Size (e.g., "1.39 million km")
- `mass`: Mass (e.g., "1.989 × 10³⁰ kg")
- `spectralClass`: Classification (e.g., "G2V", "M1V", "B8V")
- `temperature`: Surface temp (e.g., "5,778 K")
- `luminosity`: Brightness (e.g., "1 L☉", "25,000 L☉")
- `satellites`: Number of planets (optional)
- `satelliteLabel`: "Planets" or "Planet"
- `starType`: "main-sequence" | "red-giant" | "white-dwarf" | "neutron-star"
- `enableImageGeneration`: true

### Example: The Sun
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "The Sun",
    "bodyType": "star",
    "description": "A G-type main-sequence star that contains 99.86% of the Solar System's mass.",
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

### Example: Betelgeuse
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Betelgeuse",
    "bodyType": "star",
    "description": "A red supergiant star in Orion, one of the largest known stars.",
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

## Body Type: Galaxy

### Required Properties
- `name`: Galaxy name
- `bodyType`: "galaxy"
- `description`: Detailed description

### Recommended Properties
- `galaxyType`: Type (e.g., "Spiral", "Elliptical", "Irregular", "Barred Spiral")
- `diameter`: Size (e.g., "220,000 light-years")
- `starCount`: Number of stars (e.g., "1 trillion stars", "200-400 billion stars")
- `distanceFromEarth`: Distance (e.g., "2.537 million light-years")
- `enableImageGeneration`: true

### Example: Andromeda Galaxy
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Andromeda Galaxy",
    "bodyType": "galaxy",
    "description": "The nearest major galaxy to the Milky Way, on a collision course with our galaxy.",
    "galaxyType": "Spiral",
    "diameter": "220,000 light-years",
    "starCount": "1 trillion stars",
    "distanceFromEarth": "2.537 million light-years",
    "enableImageGeneration": true
  }
}
```

### Example: Milky Way
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Milky Way",
    "bodyType": "galaxy",
    "description": "Our home galaxy, a barred spiral galaxy containing our Solar System.",
    "galaxyType": "Barred Spiral",
    "diameter": "105,700 light-years",
    "starCount": "200-400 billion stars",
    "enableImageGeneration": true
  }
}
```

## Visual Differentiation

The component automatically applies different visual themes based on `bodyType`:

- **Planets**: Purple theme with 🪐 icon
- **Moons**: Silver theme with 🌙 icon
- **Stars**: Gold theme with ⭐ icon
- **Galaxies**: Deep purple theme with 🌌 icon

## Property Display Logic

The component intelligently shows only relevant properties:

- **Planets**: diameter, mass, distance from sun, orbital period, satellites
- **Moons**: diameter, mass, distance from parent, orbital period, parent body
- **Stars**: diameter, mass, spectral class, temperature, luminosity, satellites
- **Galaxies**: galaxy type, diameter, star count, distance from Earth

## Image Generation

When `enableImageGeneration: true` is set:
- The component automatically generates an AI image using EverArt
- For planets: Uses `planetType` to generate accurate imagery
- For moons: Uses known moon data or generic moon imagery
- For stars: Uses `starType` and spectral class for accurate colors
- For galaxies: Uses `galaxyType` for appropriate structure

## Best Practices

1. **Always include `bodyType`**: This is critical for proper rendering
2. **Use accurate data**: Provide scientifically accurate measurements when possible
3. **Include units**: Always specify units (km, kg, K, L☉, light-years, etc.)
4. **Enable image generation**: Set to `true` for visual appeal
5. **Provide context**: Write descriptive text that explains significance
6. **Use appropriate labels**: Customize `distanceFromLabel` and `satelliteLabel` for clarity

## Common Patterns

### Solar System Planets
Always include: diameter, mass, distanceFrom, orbitalPeriod, satellites, planetType

### Exoplanets
Focus on: diameter, mass, parentBody (star name), orbitalPeriod, planetType

### Major Moons
Include: diameter, mass, distanceFrom, orbitalPeriod, parentBody

### Nearby Stars
Include: spectralClass, temperature, luminosity, and distance if known

### Galaxies
Include: galaxyType, diameter, starCount, distanceFromEarth

## Error Handling

If uncertain about a property:
- Omit it rather than guessing
- The component will gracefully handle missing optional properties
- Always provide at minimum: name, bodyType, description

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
        // ... other properties
      }
    },
    {
      "type": "celestial-body-card",
      "props": {
        "name": "Europa",
        "bodyType": "moon",
        "parentBody": "Jupiter",
        // ... other properties
      }
    }
    // ... more moons
  ]
}
```

## Integration with Other Components

Celestial body cards work well with:
- `space-timeline`: For historical context
- `constellation`: For stellar context
- `solar-system`: For orbital visualization
- `text-block`: For additional explanations

---

**Remember**: The celestial-body-card is your go-to component for any celestial body. Let the `bodyType` property guide which additional properties to include, and the component will handle the rest!