# Celestial Body Card - Agent Prompt Guide

## Overview
Create celestial-body-card components for planets, moons, stars, galaxies, black holes, nebulae, comets, and asteroids.

## Response Structure

```json
{
  "answer": "Brief answer (1-2 sentences)",
  "components": [{
    "type": "celestial-body-card",
    "props": {
      "name": "string",
      "bodyType": "planet|moon|star|galaxy|black-hole|nebula|comet|asteroid",
      "description": "Educational/scientific description (2-3 sentences)",
      "visualDescription": "Visual characteristics only (colors, size, appearance)",
      "enableImageGeneration": true,
      // Type-specific properties below
    }
  }]
}
```

## Field Guidelines

### Core Fields
- **`description`**: Educational/scientific information including location, history, significance, and what will happen. Focus on facts, context, and scientific importance.
- **`visualDescription`**: ONLY visual characteristics such as colors, size descriptors, appearance, and brightness. This field is used for image generation prompts.

**Example separation**:
- ✅ `description`: "A red supergiant star in Orion, one of the largest known stars that will eventually explode as a supernova."
- ✅ `visualDescription`: "red supergiant star with deep orange-red color and massive size"

## Properties by Body Type

### PLANET
**Required**: name, bodyType, description, visualDescription
**Recommended**: diameter, mass, distanceFrom, distanceFromLabel ("Distance from Sun"), orbitalPeriod, satellites, satelliteLabel ("Moons"), planetType (terrestrial|gas-giant|ice-giant|dwarf), enableImageGeneration

**Example - Mars**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Mars",
    "bodyType": "planet",
    "description": "The fourth planet from the Sun, home to Olympus Mons, the largest volcano in the solar system. Mars has polar ice caps and evidence of ancient water flows.",
    "visualDescription": "rusty red planet with iron oxide surface, polar ice caps, and dusty atmosphere",
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
**Required**: name, bodyType, description, visualDescription
**Recommended**: diameter, mass, distanceFrom, distanceFromLabel ("Distance from [Planet]"), orbitalPeriod, parentBody, enableImageGeneration

**Example - Europa**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Europa",
    "bodyType": "moon",
    "description": "One of Jupiter's Galilean moons with a subsurface ocean beneath its icy crust that may harbor life. NASA's Europa Clipper mission will study this moon in detail.",
    "visualDescription": "smooth icy moon with cracked white and tan surface, resembling a cracked eggshell",
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
**Required**: name, bodyType, description, visualDescription
**Recommended**: diameter, mass, spectralClass, temperature, luminosity, satellites (optional), satelliteLabel ("Planets"), starType (main-sequence|red-giant|white-dwarf|neutron-star), enableImageGeneration

**Example - The Sun**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "The Sun",
    "bodyType": "star",
    "description": "A G-type main-sequence star at the center of our Solar System that contains 99.86% of the system's mass and provides energy for life on Earth through nuclear fusion.",
    "visualDescription": "bright yellow-white star with visible surface granulation and occasional sunspots",
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
    "description": "A red supergiant star in the constellation Orion, one of the largest known stars that will eventually explode as a supernova, possibly within the next 100,000 years.",
    "visualDescription": "red supergiant star with deep orange-red color and massive size",
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

**Example - Rigel**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Rigel",
    "bodyType": "star",
    "description": "A blue supergiant star in the constellation Orion, one of the brightest stars in the night sky and the seventh brightest star visible from Earth.",
    "visualDescription": "blue supergiant star with brilliant blue-white color",
    "spectralClass": "B8 Ia",
    "starType": "main-sequence",
    "enableImageGeneration": true
  }
}
```

### GALAXY
**Required**: name, bodyType, description, visualDescription
**Recommended**: galaxyType (Spiral|Elliptical|Irregular|Barred Spiral), diameter, starCount, distanceFromEarth, enableImageGeneration

**Example - Andromeda**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Andromeda Galaxy",
    "bodyType": "galaxy",
    "description": "The nearest major galaxy to the Milky Way, on a collision course with our galaxy in about 4.5 billion years. It's the most distant object visible to the naked eye from Earth.",
    "visualDescription": "large spiral galaxy with bright central bulge and sweeping spiral arms containing blue star-forming regions",
    "galaxyType": "Spiral",
    "diameter": "220,000 light-years",
    "starCount": "1 trillion stars",
    "distanceFromEarth": "2.537 million light-years",
    "enableImageGeneration": true
  }
}
```

### BLACK-HOLE
**Required**: name, bodyType, description, visualDescription
**Recommended**: blackHoleType (Stellar|Supermassive|Intermediate), mass, eventHorizonRadius, distanceFromEarth, enableImageGeneration

**Example - Sagittarius A***:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Sagittarius A*",
    "bodyType": "black-hole",
    "description": "The supermassive black hole at the center of the Milky Way galaxy, with a mass of 4 million suns. First imaged by the Event Horizon Telescope in 2022.",
    "visualDescription": "dark spherical void surrounded by bright orange accretion disk with swirling matter",
    "blackHoleType": "Supermassive",
    "mass": "4.1 million M☉",
    "eventHorizonRadius": "12 million km",
    "distanceFromEarth": "26,000 light-years",
    "enableImageGeneration": true
  }
}
```

### NEBULA
**Required**: name, bodyType, description, visualDescription
**Recommended**: nebulaType (Emission|Reflection|Planetary|Supernova Remnant), diameter, distanceFromEarth, enableImageGeneration

**Example - Orion Nebula**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Orion Nebula",
    "bodyType": "nebula",
    "description": "A stellar nursery where new stars are being born in the Orion constellation, located in Orion's sword. It's one of the brightest nebulae visible to the naked eye.",
    "visualDescription": "glowing cloud of gas with pink and red emission regions, blue reflection areas, and dark dust lanes",
    "nebulaType": "Emission",
    "diameter": "24 light-years",
    "distanceFromEarth": "1,344 light-years",
    "enableImageGeneration": true
  }
}
```

### COMET
**Required**: name, bodyType, description, visualDescription
**Recommended**: diameter, mass, orbitalPeriod, perihelion, aphelion, cometType (Short-period|Long-period|Halley-type), enableImageGeneration

**Example - Halley's Comet**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Halley's Comet",
    "bodyType": "comet",
    "description": "The most famous periodic comet, visible from Earth every 75-76 years. Last seen in 1986, it will return in 2061. Named after astronomer Edmond Halley who predicted its return.",
    "visualDescription": "icy nucleus with bright glowing coma and long streaming tail of gas and dust",
    "diameter": "11 km",
    "mass": "2.2 × 10¹⁴ kg",
    "orbitalPeriod": "75-76 years",
    "perihelion": "0.586 AU",
    "aphelion": "35.1 AU",
    "cometType": "Halley-type",
    "enableImageGeneration": true
  }
}
```

### ASTEROID
**Required**: name, bodyType, description, visualDescription
**Recommended**: diameter, mass, orbitalPeriod, distanceFrom, distanceFromLabel ("Distance from Sun"), asteroidType (C-type|S-type|M-type), enableImageGeneration

**Example - Ceres**:
```json
{
  "type": "celestial-body-card",
  "props": {
    "name": "Ceres",
    "bodyType": "asteroid",
    "description": "The largest object in the asteroid belt between Mars and Jupiter, classified as a dwarf planet. NASA's Dawn mission revealed bright spots of salt deposits and possible subsurface water.",
    "visualDescription": "spherical gray rocky body with cratered surface and bright white salt deposits",
    "diameter": "939 km",
    "mass": "9.38 × 10²⁰ kg",
    "orbitalPeriod": "4.6 Earth years",
    "distanceFrom": "413.7 million km",
    "distanceFromLabel": "Distance from Sun",
    "asteroidType": "C-type",
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
- **Comets**: Ice blue theme with ☄️ icon
- **Asteroids**: Gray/brown theme with 🪨 icon

## Rules

1. **Always set `type: "celestial-body-card"`** at the component level (not inside props)
2. **Always set `enableImageGeneration: true`** for visual appeal
3. **Always include both `description` and `visualDescription`** fields
4. **Separate concerns**: `description` = educational facts, `visualDescription` = visual characteristics only
5. **Include units** (km, kg, K, L☉, M☉, light-years)
6. **Use scientific notation** for large numbers (e.g., 1.898 × 10²⁷ kg)
7. **Use accurate astronomical data** from reliable sources
8. **Provide minimum 2-3 sentences** in description for educational value
9. **Keep visualDescription concise** - focus on colors, size, and appearance only

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
        "description": "The most volcanically active body in the solar system, with hundreds of active volcanoes caused by tidal heating from Jupiter's gravity.",
        "visualDescription": "yellow and orange moon with volcanic surface, sulfur deposits, and active lava flows",
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
        "description": "One of Jupiter's Galilean moons with a subsurface ocean beneath its icy crust that may harbor life.",
        "visualDescription": "smooth icy moon with cracked white and tan surface, resembling a cracked eggshell",
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