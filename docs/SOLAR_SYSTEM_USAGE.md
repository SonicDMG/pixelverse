# Solar System Component - Usage Guide

## Overview

The SolarSystem component is a **flexible orbital visualization system** that can display any celestial body relationships, not just our solar system. It supports preset configurations (solar system, moon systems, galaxy structures) as well as fully custom orbital systems with configurable scaling, units, and central bodies.

**Key Capabilities:**
- Visualize planetary systems, moon systems, galaxy structures, or custom orbital relationships
- Support for multiple preset configurations
- Fully customizable celestial bodies and central objects
- Flexible unit systems (AU, km, light years, etc.)
- Configurable scaling (linear or logarithmic)
- Interactive controls and real-time animation

## Preset Systems

The component includes three built-in presets:

### 1. Solar System (`'solar-system'`)
Our home planetary system with all 8 planets orbiting the Sun.
- **Central Body:** Sun (star)
- **Bodies:** Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- **Units:** AU (distance), Earth days (time)
- **Scaling:** Logarithmic for visibility

### 2. Moon System (`'moon-system'`)
Jupiter's four Galilean moons.
- **Central Body:** Jupiter (planet)
- **Bodies:** Io, Europa, Ganymede, Callisto
- **Units:** Kilometers (distance), Earth days (time)
- **Scaling:** Logarithmic for visibility

### 3. Galaxy (`'galaxy'`)
Simplified Milky Way galactic structure.
- **Central Body:** Sagittarius A* (supermassive black hole)
- **Bodies:** Nuclear Bulge, Inner Disk, Solar Neighborhood, Outer Disk
- **Units:** Light years (distance), Million years (time)
- **Scaling:** Logarithmic for visibility

## Props Reference

### Complete Props Interface

```typescript
interface OrbitalSystemProps {
  // Preset selection
  preset?: 'solar-system' | 'moon-system' | 'galaxy' | 'custom';
  
  // Custom configuration (overrides preset)
  bodies?: CelestialBody[];
  centralBody?: CentralBody;
  units?: Partial<UnitSystem>;
  scaling?: Partial<ScalingConfig>;
  
  // Display options
  name?: string;
  description?: string;
  autoPlay?: boolean;
  timeScale?: number;
}
```

### Prop Details

#### `preset`
- **Type:** `'solar-system' | 'moon-system' | 'galaxy' | 'custom'`
- **Default:** `'solar-system'`
- **Description:** Select a preset configuration. Use `'custom'` when providing your own bodies and central body.

#### `bodies`
- **Type:** `CelestialBody[]`
- **Default:** Preset bodies or empty array
- **Description:** Array of celestial bodies orbiting the central body. Overrides preset bodies.

```typescript
interface CelestialBody {
  name: string;
  type: 'planet' | 'moon' | 'star' | 'dwarf-planet' | 'asteroid' | 'comet';
  radius: number;           // Physical radius in unit system
  mass: number;             // Mass in kg
  orbitalRadius: number;    // Distance from central body (semi-major axis for elliptical)
  orbitalPeriod: number;    // Time to complete one orbit
  color: string;            // CSS color or CSS variable
  description: string;      // Displayed when body is selected
  eccentricity?: number;    // Orbital eccentricity: 0 = circular, 0.9 = highly elliptical
  satellites?: CelestialBody[]; // Nested orbital systems (moons, etc.)
}
```

#### `centralBody`
- **Type:** `CentralBody`
- **Default:** Preset central body or Sun
- **Description:** The central object that other bodies orbit around.

```typescript
interface CentralBody {
  name: string;
  type: 'star' | 'planet' | 'black-hole' | 'galaxy-core';
  radius: number;           // Physical radius
  color: string;            // Body color
  glowColor?: string;       // Optional glow effect color
  description?: string;     // Optional description
}
```

#### `units`
- **Type:** `Partial<UnitSystem>`
- **Default:** AU/days/km/kg for solar system
- **Description:** Define the unit system for display and calculations.

```typescript
interface UnitSystem {
  distance: { unit: string; label: string; };
  time: { unit: string; label: string; };
  mass: { unit: string; label: string; };
  radius: { unit: string; label: string; };
}
```

#### `scaling`
- **Type:** `Partial<ScalingConfig>`
- **Default:** Logarithmic with scale factor 1
- **Description:** Configure how distances and sizes are scaled for visibility.

```typescript
interface ScalingConfig {
  type: 'linear' | 'logarithmic';
  distanceScale?: number;   // Multiplier for distances (default: 1)
  sizeScale?: number;       // Multiplier for body sizes (default: 1)
}
```

#### `name`
- **Type:** `string`
- **Default:** Preset name or "Orbital System"
- **Description:** Title displayed at the top of the component.

#### `description`
- **Type:** `string`
- **Default:** Preset description or empty
- **Description:** Subtitle text displayed below the title.

#### `autoPlay`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether animation starts automatically on load.

#### `timeScale`
- **Type:** `number`
- **Default:** `1`
- **Description:** Initial animation speed multiplier (1x, 10x, 100x, 1000x).

## Usage Examples

### 1. Default Solar System

```json
{
  "text": "Here's an interactive view of our solar system!",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "solar-system",
        "autoPlay": true,
        "timeScale": 10
      }
    }
  ]
}
```

### 2. Jupiter's Moons

```json
{
  "text": "Explore Jupiter's four largest moons - the Galilean satellites discovered by Galileo in 1610.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "moon-system",
        "name": "Galilean Moons of Jupiter",
        "description": "Io, Europa, Ganymede, and Callisto",
        "autoPlay": true,
        "timeScale": 100
      }
    }
  ]
}
```

### 3. Milky Way Galaxy Structure

```json
{
  "text": "Here's a simplified view of our galaxy's structure, showing major regions orbiting the supermassive black hole at the center.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "galaxy",
        "autoPlay": true,
        "timeScale": 1000
      }
    }
  ]
}
```

### 4. Custom Binary Star System

```json
{
  "text": "This is a binary star system with two planets in circumbinary orbits.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "custom",
        "name": "Alpha Centauri AB System",
        "description": "Binary star system with exoplanets",
        "centralBody": {
          "name": "Alpha Centauri A",
          "type": "star",
          "radius": 854800,
          "color": "#FFD700",
          "glowColor": "#FFA500",
          "description": "Sun-like star, primary component"
        },
        "bodies": [
          {
            "name": "Alpha Centauri B",
            "type": "star",
            "radius": 602000,
            "mass": 1.8e30,
            "orbitalRadius": 23.4,
            "orbitalPeriod": 29220,
            "color": "#FF8C00",
            "description": "Orange dwarf companion star"
          },
          {
            "name": "Proxima Centauri b",
            "type": "planet",
            "radius": 7160,
            "mass": 7.6e24,
            "orbitalRadius": 0.05,
            "orbitalPeriod": 11.2,
            "color": "#8B4513",
            "description": "Rocky exoplanet in habitable zone"
          }
        ],
        "units": {
          "distance": { "unit": "AU", "label": "Astronomical Units" },
          "time": { "unit": "days", "label": "Earth Days" },
          "mass": { "unit": "kg", "label": "Kilograms" },
          "radius": { "unit": "km", "label": "Kilometers" }
        },
        "scaling": {
          "type": "logarithmic",
          "distanceScale": 1.5,
          "sizeScale": 1.2
        },
        "autoPlay": true,
        "timeScale": 50
      }
    }
  ]
}
```

### 5. Earth-Moon System with Elliptical Orbit

```json
{
  "text": "Here's Earth with its Moon, showing realistic orbital mechanics including the Moon's slightly elliptical orbit.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "custom",
        "name": "Earth-Moon System",
        "description": "Our planet and its natural satellite",
        "centralBody": {
          "name": "Sun",
          "type": "star",
          "radius": 696000,
          "color": "#FFD700",
          "glowColor": "#FFA500"
        },
        "bodies": [
          {
            "name": "Earth",
            "type": "planet",
            "radius": 6371,
            "mass": 5.972e24,
            "orbitalRadius": 1.0,
            "orbitalPeriod": 365.25,
            "eccentricity": 0.0167,
            "color": "#4169E1",
            "description": "Our home planet with liquid water",
            "satellites": [
              {
                "name": "Moon",
                "type": "moon",
                "radius": 1737.4,
                "mass": 7.342e22,
                "orbitalRadius": 0.00257,
                "orbitalPeriod": 27.3,
                "eccentricity": 0.0549,
                "color": "#C0C0C0",
                "description": "Earth's only natural satellite"
              }
            ]
          }
        ],
        "units": {
          "distance": { "unit": "AU", "label": "Astronomical Units" },
          "time": { "unit": "days", "label": "Earth Days" }
        },
        "autoPlay": true,
        "timeScale": 50
      }
    }
  ]
}
```

### 6. Custom Exoplanet System (TRAPPIST-1)

```json
{
  "text": "The TRAPPIST-1 system has seven Earth-sized planets, three in the habitable zone!",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "custom",
        "name": "TRAPPIST-1 System",
        "description": "Ultra-cool dwarf star with 7 terrestrial planets",
        "centralBody": {
          "name": "TRAPPIST-1",
          "type": "star",
          "radius": 84000,
          "color": "#FF4500",
          "glowColor": "#FF6347",
          "description": "Ultra-cool red dwarf star"
        },
        "bodies": [
          {
            "name": "TRAPPIST-1b",
            "type": "planet",
            "radius": 6990,
            "mass": 8.5e24,
            "orbitalRadius": 0.01154,
            "orbitalPeriod": 1.51,
            "color": "#8B4513",
            "description": "Innermost planet, likely tidally locked"
          },
          {
            "name": "TRAPPIST-1c",
            "type": "planet",
            "radius": 6770,
            "mass": 8.3e24,
            "orbitalRadius": 0.01580,
            "orbitalPeriod": 2.42,
            "color": "#A0522D",
            "description": "Rocky world, too hot for liquid water"
          },
          {
            "name": "TRAPPIST-1d",
            "type": "planet",
            "radius": 5050,
            "mass": 2.4e24,
            "orbitalRadius": 0.02227,
            "orbitalPeriod": 4.05,
            "color": "#CD853F",
            "description": "Edge of habitable zone"
          },
          {
            "name": "TRAPPIST-1e",
            "type": "planet",
            "radius": 5780,
            "mass": 4.3e24,
            "orbitalRadius": 0.02925,
            "orbitalPeriod": 6.10,
            "color": "#4169E1",
            "description": "In habitable zone, may have water"
          },
          {
            "name": "TRAPPIST-1f",
            "type": "planet",
            "radius": 6780,
            "mass": 6.8e24,
            "orbitalRadius": 0.03849,
            "orbitalPeriod": 9.21,
            "color": "#1E90FF",
            "description": "In habitable zone, water-rich candidate"
          },
          {
            "name": "TRAPPIST-1g",
            "type": "planet",
            "radius": 7330,
            "mass": 8.3e24,
            "orbitalRadius": 0.04683,
            "orbitalPeriod": 12.35,
            "color": "#87CEEB",
            "description": "In habitable zone, largest planet"
          },
          {
            "name": "TRAPPIST-1h",
            "type": "planet",
            "radius": 4930,
            "mass": 2.0e24,
            "orbitalRadius": 0.06189,
            "orbitalPeriod": 18.77,
            "color": "#B0C4DE",
            "description": "Outermost planet, likely icy"
          }
        ],
        "units": {
          "distance": { "unit": "AU", "label": "Astronomical Units" },
          "time": { "unit": "days", "label": "Earth Days" },
          "mass": { "unit": "kg", "label": "Kilograms" },
          "radius": { "unit": "km", "label": "Kilometers" }
        },
        "scaling": {
          "type": "logarithmic",
          "distanceScale": 2.0,
          "sizeScale": 1.5
        },
        "autoPlay": true,
        "timeScale": 100
      }
    }
  ]
}
```

## Langflow Integration

### Agent Response Patterns

#### Pattern 1: Simple Preset Request
User: "Show me the solar system"

```json
{
  "text": "Here's our solar system with all 8 planets orbiting the Sun!",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "solar-system"
      }
    }
  ]
}
```

#### Pattern 2: Specific System Request
User: "What are Jupiter's moons?"

```json
{
  "text": "Jupiter has 95 known moons! Here are the four largest - the Galilean moons discovered by Galileo Galilei in 1610.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "moon-system",
        "timeScale": 50
      }
    }
  ]
}
```

#### Pattern 3: Educational Context
User: "How does our galaxy work?"

```json
{
  "text": "The Milky Way is a barred spiral galaxy with a supermassive black hole at its center. Here's a simplified view showing major regions orbiting around Sagittarius A*.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "galaxy",
        "description": "Simplified galactic structure (not to scale)",
        "timeScale": 1000
      }
    }
  ]
}
```

#### Pattern 4: Custom Exoplanet System
User: "Tell me about the TRAPPIST-1 system"

```json
{
  "text": "TRAPPIST-1 is an ultra-cool red dwarf star about 40 light-years away with SEVEN Earth-sized planets! Three of them are in the habitable zone where liquid water could exist.",
  "components": [
    {
      "type": "solar-system",
      "props": {
        "preset": "custom",
        "name": "TRAPPIST-1 System",
        "centralBody": { /* ... */ },
        "bodies": [ /* ... */ ],
        "timeScale": 100
      }
    }
  ]
}
```

### When to Use Each Preset

- **`solar-system`**: Questions about our solar system, planets, planetary orbits
- **`moon-system`**: Questions about Jupiter's moons, satellite systems, moon orbits
- **`galaxy`**: Questions about galactic structure, Milky Way, galactic orbits
- **`custom`**: Exoplanet systems, binary stars, hypothetical systems, specific astronomical configurations

## Features

### Interactive Elements

1. **Body Selection**
   - Click any orbiting body to view detailed information
   - Info panel shows: type, radius, distance, orbital period
   - Selected body's orbit is highlighted in cyan
   - Click again or close button to deselect

2. **Animation Controls**
   - **Play/Pause**: Toggle orbital animation
   - **Speed**: Adjust from 1x to 1000x speed
   - **Time Display**: Shows current time in system's units
   - **Reset**: Return to initial state (time 0)

3. **Visual Feedback**
   - Bodies glow when hovered
   - Selected body orbit highlighted
   - Body labels always visible
   - Starfield background for atmosphere
   - Central body glow effect (for stars and black holes)

### Display Features

- **Flexible Scaling**: Logarithmic or linear scaling for visibility
- **Accurate Data**: Real astronomical data for preset systems
- **Smooth Animation**: 60fps orbital motion using requestAnimationFrame
- **Responsive**: Works on desktop, tablet, and mobile
- **Customizable Units**: Support for any unit system (AU, km, light years, etc.)

## Technical Details

### Scaling Algorithms

#### Logarithmic Scaling (Default)
Used when orbital distances vary by orders of magnitude (e.g., solar system, galaxy).

**Distance Formula:**
```
scaledRadius = log₁₀(orbitalRadius + 1) × scale × distanceScale
```

**Size Formula:**
```
size = max(4, log₁₀(radius / 1000 + 1) × 3 × sizeScale)
```

**Benefits:**
- Inner bodies remain visible despite vast distance differences
- Outer bodies don't dominate the view
- Maintains relative ordering

#### Linear Scaling
Used when orbital distances are similar in magnitude.

**Distance Formula:**
```
scaledRadius = orbitalRadius × scale × distanceScale
```

**Size Formula:**
```
size = max(4, (radius / 10000) × sizeScale)
```

**Benefits:**
- True proportional representation
- Better for systems with similar-scale orbits
- More intuitive for educational purposes

### Orbital Mechanics

**Position Calculation:**
```typescript
angle = (time / orbitalPeriod) × 2π
x = cos(angle) × scaledRadius
y = sin(angle) × scaledRadius
```

**Assumptions:**
- Circular orbits (elliptical orbits planned for Phase 2)
- Uniform angular velocity
- No gravitational interactions between bodies
- 2D projection (3D view planned for Phase 2)

### Performance Considerations

- **Bundle Size**: ~20KB (component + presets)
- **FPS**: 60fps on desktop, 30-60fps on mobile
- **Load Time**: <1 second for preset systems
- **Memory**: ~5MB for typical system with 10 bodies
- **Animation**: Uses requestAnimationFrame for optimal performance
- **Rendering**: SVG-based for crisp visuals at any zoom level

### Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Mobile**: Full support on iOS Safari and Chrome
- **Legacy**: Graceful degradation (no animation on older browsers)

## Integration with Other Components

### With CelestialBodyCard
Show detailed information about a specific body:

```json
{
  "text": "Here's Earth in the solar system, and detailed information about it.",
  "components": [
    {
      "type": "solar-system",
      "props": { "preset": "solar-system" }
    },
    {
      "type": "celestial-body-card",
      "props": {
        "name": "Earth",
        "type": "planet",
        "description": "Our home planet...",
        "physicalProperties": { /* ... */ }
      }
    }
  ]
}
```

### With SpaceTimeline
Show historical context alongside the system:

```json
{
  "text": "Here's our solar system and the timeline of human space exploration.",
  "components": [
    {
      "type": "solar-system",
      "props": { "preset": "solar-system" }
    },
    {
      "type": "space-timeline",
      "props": {
        "title": "Space Exploration Timeline",
        "events": [ /* ... */ ]
      }
    }
  ]
}
```

### With ComparisonTable
Compare properties of multiple bodies:

```json
{
  "text": "Here are the terrestrial planets and their key properties.",
  "components": [
    {
      "type": "solar-system",
      "props": { "preset": "solar-system" }
    },
    {
      "type": "comparison-table",
      "props": {
        "title": "Terrestrial Planet Comparison",
        "items": [ /* Mercury, Venus, Earth, Mars */ ]
      }
    }
  ]
}
```

## Customization

### Styling
The component uses PixelSpace theme colors:
- Background: Deep space gradient (`var(--color-bg-dark)` to `var(--color-bg-card)`)
- Primary: Royal blue (`var(--color-primary)`)
- Secondary: Cyan (`var(--color-secondary)`)
- Accent: Gold (`var(--color-accent)`)

### Custom Colors
Use CSS variables or hex colors for bodies:

```json
{
  "color": "var(--color-planet-earth)"  // Theme color
}
```

```json
{
  "color": "#4169E1"  // Custom hex color
}
```

### New Features (Phase 2)

#### Elliptical Orbits
Bodies can now have elliptical orbits using the `eccentricity` parameter:
- **0**: Perfectly circular orbit (default)
- **0.0-0.3**: Low eccentricity (nearly circular)
- **0.3-0.7**: Moderate eccentricity (visibly elliptical)
- **0.7-0.9**: High eccentricity (highly elliptical)

**Example - Mercury with realistic eccentricity:**
```json
{
  "name": "Mercury",
  "type": "planet",
  "radius": 2439.7,
  "mass": 3.285e23,
  "orbitalRadius": 0.39,
  "orbitalPeriod": 88,
  "eccentricity": 0.206,
  "color": "#8C7853",
  "description": "Mercury has the most eccentric orbit of all planets"
}
```

#### Nested Orbits (Satellites)
Bodies can now have their own satellites that orbit around them:
- Satellites orbit their parent body, not the central body
- Supports multiple levels of nesting (moons of moons, theoretically)
- Automatic speed adjustment for realistic visual appearance

**Example - Earth with Moon:**
```json
{
  "name": "Earth",
  "type": "planet",
  "radius": 6371,
  "mass": 5.972e24,
  "orbitalRadius": 1.0,
  "orbitalPeriod": 365.25,
  "color": "#4169E1",
  "description": "Our home planet",
  "satellites": [
    {
      "name": "Moon",
      "type": "moon",
      "radius": 1737.4,
      "mass": 7.342e22,
      "orbitalRadius": 0.00257,
      "orbitalPeriod": 27.3,
      "color": "#C0C0C0",
      "description": "Earth's only natural satellite"
    }
  ]
}
```

#### Fixed Moon Orbital Speeds
Moon orbital speeds are now properly scaled to appear realistic:
- Moons automatically receive a 10x speed reduction multiplier
- Nested satellites (moons of moons) receive a 20x multiplier
- This prevents moons from appearing to orbit too fast relative to planets

### Future Enhancements (Phase 3+)

- **3D Perspective**: Toggle between 2D and 3D views
- **Orbital Resonances**: Highlight resonant relationships
- **Lagrange Points**: Show L1-L5 points for selected bodies
- **Trajectory Paths**: Show spacecraft trajectories
- **Time Travel**: Jump to specific dates/times
- **Export**: Save visualization as image or animation
- **Orbital Inclination**: Support for tilted orbital planes

## Troubleshooting

### Component Not Rendering
- Check that `type: 'solar-system'` is correct
- Verify preset name is valid: `'solar-system'`, `'moon-system'`, `'galaxy'`, or `'custom'`
- For custom systems, ensure `bodies` and `centralBody` are provided
- Check browser console for errors

### Animation Not Smooth
- Reduce `timeScale` if animation is too fast
- Check browser performance (60fps target)
- Try pausing and resuming animation
- Reduce number of bodies for better performance

### Bodies Not Visible
- Check scaling configuration - logarithmic is recommended for large distance ranges
- Adjust `distanceScale` and `sizeScale` multipliers
- Verify orbital radius values are in correct units
- Click bodies to highlight their orbits

### Custom System Not Working
- Ensure `preset: 'custom'` is set
- Provide both `bodies` and `centralBody` arrays
- Verify all required properties are present in body definitions
- Check that orbital periods are non-zero
- Ensure colors are valid CSS colors or variables

### Units Not Displaying Correctly
- Verify `units` object has all four properties (distance, time, mass, radius)
- Each unit must have both `unit` and `label` properties
- Check that values in bodies match the unit system

## Example Agent Prompts

Users can ask questions that trigger orbital system visualizations:

**Solar System:**
- "Show me the solar system"
- "What does our solar system look like?"
- "Display all the planets orbiting the sun"
- "Visualize planetary orbits"

**Moon Systems:**
- "Show me Jupiter's moons"
- "What are the Galilean satellites?"
- "Display Jupiter's moon system"

**Galaxy:**
- "How does our galaxy work?"
- "Show me the Milky Way structure"
- "Visualize galactic orbits"

**Exoplanets:**
- "Tell me about TRAPPIST-1"
- "Show me the Kepler-90 system"
- "What does a binary star system look like?"
- "Visualize an exoplanet system"

## Best Practices

1. **Choose the Right Preset**: Use built-in presets when possible for consistency
2. **Set Appropriate Time Scale**: 10-100x for planets, 100-1000x for moons/galaxy
3. **Use Logarithmic Scaling**: For systems with large distance variations
4. **Provide Context**: Add descriptive text explaining what users are seeing
5. **Combine Components**: Use with CelestialBodyCard or ComparisonTable for depth
6. **Custom Colors**: Use theme colors for consistency or custom colors for distinction
7. **Accurate Data**: Use real astronomical data when available
8. **Clear Descriptions**: Write informative descriptions for each body
9. **Appropriate Units**: Match units to the scale (AU for planets, km for moons, ly for galaxy)
10. **Test Animation**: Verify smooth animation at different time scales

---

**Made with Bob**