export interface CelestialObjectOptions {
  type: 'planet' | 'moon' | 'star' | 'nebula' | 'galaxy';
  name: string;
  characteristics?: string[];
  colors?: string[];
}

/**
 * Builder for creating pixel-art style prompts for space-themed image generation.
 * Follows retro space game aesthetic (SNES/Genesis style).
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
      : 'with vibrant cosmic colors';

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
    ].filter(Boolean).join(', ');
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
   * Build a prompt for generating a constellation star map.
   * 
   * @param name - Constellation name
   * @param starCount - Number of stars in the constellation
   * @returns Formatted prompt string for constellation generation
   */
  static buildConstellationPrompt(name: string, starCount: number): string {
    return [
      '32-bit pixel art star map',
      `constellation ${name}`,
      `${starCount} glowing stars connected by lines`,
      'deep space background',
      'retro space game aesthetic',
      'purple and cyan color palette',
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
    type: 'moon' | 'star' | 'nebula' | 'galaxy',
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
}

// Made with Bob
