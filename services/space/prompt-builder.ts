export interface CelestialObjectOptions {
  type: 'planet' | 'moon' | 'star' | 'nebula' | 'galaxy' | 'black-hole';
  name: string;
  characteristics?: string[];
  colors?: string[];
}

/**
 * Scientifically accurate characteristics for planets in our solar system.
 * Each entry contains accurate visual descriptions for pixel art generation.
 */
const PLANET_CHARACTERISTICS: Record<string, { colors: string[], features: string[] }> = {
  mercury: {
    colors: ['gray', 'dark gray', 'charcoal'],
    features: ['heavily cratered surface', 'no atmosphere', 'similar to Earth\'s moon', 'ancient impact basins']
  },
  venus: {
    colors: ['yellowish-white', 'pale yellow', 'cream'],
    features: ['thick cloud cover', 'sulfuric acid atmosphere', 'no surface features visible', 'uniform appearance']
  },
  earth: {
    colors: ['blue', 'white', 'green', 'brown'],
    features: ['71% blue oceans', 'white cloud patterns', 'green and brown landmasses', 'polar ice caps', 'only known planet with life']
  },
  mars: {
    colors: ['rusty red', 'red-orange', 'white'],
    features: ['rusty red-orange surface', 'white polar ice caps', 'thin atmosphere', 'Olympus Mons volcano', 'Valles Marineris canyon system']
  },
  jupiter: {
    colors: ['tan', 'brown', 'white', 'red-orange'],
    features: ['tan and brown horizontal bands', 'Great Red Spot storm', 'no solid surface', 'gas giant', 'turbulent atmosphere']
  },
  saturn: {
    colors: ['pale yellow', 'golden', 'beige'],
    features: ['pale yellow with subtle bands', 'prominent ring system', 'gas giant', 'hexagonal storm at north pole', 'less contrast than Jupiter']
  },
  uranus: {
    colors: ['pale cyan', 'blue-green', 'aqua'],
    features: ['pale cyan-blue color', 'nearly featureless appearance', 'tilted rotation axis', 'ice giant', 'faint ring system']
  },
  neptune: {
    colors: ['deep blue', 'azure', 'cobalt'],
    features: ['deep blue color', 'dark storm spots', 'dynamic atmosphere', 'ice giant', 'fastest winds in solar system']
  }
};

/**
 * Scientifically accurate characteristics for major moons in our solar system.
 */
const MOON_CHARACTERISTICS: Record<string, { colors: string[], features: string[] }> = {
  moon: {
    colors: ['gray', 'light gray', 'dark gray'],
    features: ['heavily cratered surface', 'no atmosphere', 'maria (dark patches)', 'bright ray craters', 'ancient volcanic plains']
  },
  io: {
    colors: ['yellow', 'orange', 'red', 'black'],
    features: ['yellow-orange surface', 'active volcanoes', 'sulfur deposits', 'most volcanically active body', 'no impact craters']
  },
  europa: {
    colors: ['white', 'blue-white', 'pale blue', 'brown streaks'],
    features: ['icy white-blue surface', 'dark linear cracks', 'subsurface ocean', 'smooth young surface', 'few craters']
  },
  ganymede: {
    colors: ['gray', 'brown', 'white'],
    features: ['gray-brown surface', 'lighter and darker regions', 'largest moon in solar system', 'grooved terrain', 'ancient and young areas']
  },
  callisto: {
    colors: ['dark gray', 'brown-gray'],
    features: ['dark gray heavily cratered', 'ancient surface', 'most cratered object in solar system', 'Valhalla impact basin']
  },
  titan: {
    colors: ['orange', 'brown', 'amber'],
    features: ['orange-brown hazy atmosphere', 'largest Saturn moon', 'thick nitrogen atmosphere', 'methane lakes', 'Earth-like weather']
  },
  enceladus: {
    colors: ['bright white', 'blue-white'],
    features: ['bright white icy surface', 'geysers at south pole', 'most reflective body in solar system', 'subsurface ocean', 'smooth young surface']
  }
};

/**
 * Builder for creating pixel-art style prompts for space-themed image generation.
 * Follows retro space game aesthetic (SNES/Genesis style) with scientifically accurate representations.
 */
export class SpacePromptBuilder {
  /**
   * Build a prompt for generating a celestial object image.
   *
   * @param options - Object configuration including type, name, characteristics, and colors
   * @returns Formatted prompt string optimized for pixel-art generation
   */
  static buildCelestialPrompt(options: CelestialObjectOptions): string {
    const { type, name, characteristics = [], colors = [] } = options;

    const colorDesc = colors.length > 0
      ? `with ${colors.join(', ')} colors`
      : 'with accurate astronomical colors';

    const charDesc = characteristics.length > 0
      ? characteristics.join(', ')
      : '';

    return [
      '32-bit pixel art',
      'retro space game aesthetic',
      'SNES/Genesis style',
      `${type} named ${name}`,
      charDesc,
      colorDesc,
      'centered composition',
      'deep space background',
      'chunky pixels, dithered shading',
      'accurate astronomical representation',
    ].filter(Boolean).join(', ');
  }

  /**
   * Build a scientifically accurate prompt for a specific planet in our solar system.
   *
   * @param planetName - Name of the planet (case-insensitive)
   * @returns Formatted prompt string with accurate planetary characteristics
   */
  static buildAccuratePlanetPrompt(planetName: string): string {
    const normalizedName = planetName.toLowerCase();
    const planetData = PLANET_CHARACTERISTICS[normalizedName];

    if (!planetData) {
      // Fallback for unknown planets
      return this.buildCelestialPrompt({
        type: 'planet',
        name: planetName,
        characteristics: ['accurate astronomical representation'],
        colors: [],
      });
    }

    return [
      '32-bit pixel art',
      'retro space game aesthetic',
      'SNES/Genesis style',
      `planet ${planetName}`,
      ...planetData.features,
      `with ${planetData.colors.join(', ')} colors`,
      'centered composition',
      'deep space background',
      'chunky pixels, dithered shading',
      'accurate astronomical representation',
    ].join(', ');
  }

  /**
   * Build a scientifically accurate prompt for a specific moon.
   *
   * @param moonName - Name of the moon (case-insensitive)
   * @returns Formatted prompt string with accurate moon characteristics
   */
  static buildAccurateMoonPrompt(moonName: string): string {
    const normalizedName = moonName.toLowerCase();
    const moonData = MOON_CHARACTERISTICS[normalizedName];

    if (!moonData) {
      // Fallback for unknown moons
      return this.buildCelestialPrompt({
        type: 'moon',
        name: moonName,
        characteristics: ['accurate astronomical representation'],
        colors: [],
      });
    }

    return [
      '32-bit pixel art',
      'retro space game aesthetic',
      'SNES/Genesis style',
      `moon ${moonName}`,
      ...moonData.features,
      `with ${moonData.colors.join(', ')} colors`,
      'centered composition',
      'deep space background',
      'chunky pixels, dithered shading',
      'accurate astronomical representation',
    ].join(', ');
  }

  /**
   * Build a prompt for generating a planet image with specific characteristics.
   *
   * @param name - Planet name
   * @param planetType - Type of planet (terrestrial, gas-giant, ice-giant, dwarf)
   * @param characteristics - Array of planet characteristics (e.g., "rocky surface", "cloud bands")
   * @param colors - Array of dominant colors
   * @returns Formatted prompt string for planet generation
   */
  static buildPlanetPrompt(
    name: string,
    planetType: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'dwarf',
    characteristics: string[] = [],
    colors: string[] = []
  ): string {
    return this.buildCelestialPrompt({
      type: 'planet',
      name,
      characteristics: [planetType, ...characteristics],
      colors,
    });
  }

  /**
   * Build a prompt for generating an accurate constellation star map.
   *
   * @param name - Constellation name
   * @param starCount - Number of stars in the constellation
   * @returns Formatted prompt string for constellation generation
   */
  static buildConstellationPrompt(name: string, starCount: number): string {
    return [
      '32-bit pixel art star map',
      `constellation ${name}`,
      `${starCount} stars with accurate pattern`,
      'white connecting lines between stars',
      'dark space background',
      'retro space game aesthetic',
      'accurate star positions',
      'no artistic embellishments',
    ].join(', ');
  }

  /**
   * Build a generic prompt for any celestial object.
   * Useful for moons, stars, nebulae, and galaxies.
   *
   * @param type - Type of celestial object
   * @param name - Object name
   * @param description - Optional description or characteristics
   * @returns Formatted prompt string
   */
  static buildGenericCelestialPrompt(
    type: 'moon' | 'star' | 'nebula' | 'galaxy' | 'black-hole',
    name: string,
    description?: string
  ): string {
    const characteristics = description ? [description] : [];
    return this.buildCelestialPrompt({
      type,
      name,
      characteristics,
    });
  }

  /**
   * Get list of all supported planets with accurate data.
   *
   * @returns Array of planet names
   */
  static getSupportedPlanets(): string[] {
    return Object.keys(PLANET_CHARACTERISTICS);
  }

  /**
   * Get list of all supported moons with accurate data.
   *
   * @returns Array of moon names
   */
  static getSupportedMoons(): string[] {
    return Object.keys(MOON_CHARACTERISTICS);
  }
}

// Made with Bob
