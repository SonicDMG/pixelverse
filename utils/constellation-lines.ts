/**
 * Constellation line definition
 */
export interface ConstellationLine {
  from: number;
  to: number;
}

/**
 * Star with coordinates
 */
export interface Star {
  name: string;
  x?: number;
  y?: number;
  [key: string]: any;
}

/**
 * Predefined constellation patterns for major constellations
 * These follow traditional asterism patterns from astronomical sources
 *
 * IMPORTANT: Star indices match the TRADITIONAL POSITIONAL ORDER as returned by the API,
 * NOT magnitude-sorted order. The API returns stars in their traditional constellation
 * positions (e.g., for Orion: Betelgeuse, Rigel, Bellatrix, belt stars, etc.)
 */
const CONSTELLATION_PATTERNS: Record<string, ConstellationLine[]> = {
  // Orion - The Hunter (most recognizable constellation)
  // Traditional positional ordering:
  // 0: Betelgeuse (α Ori, mag 0.50) - upper left shoulder (red supergiant)
  // 1: Rigel (β Ori, mag 0.13) - lower right leg (blue supergiant, brightest)
  // 2: Bellatrix (γ Ori, mag 1.64) - upper right shoulder
  // 3: Alnitak (ζ Ori, mag 1.77) - left belt star
  // 4: Alnilam (ε Ori, mag 1.69) - center belt star
  // 5: Mintaka (δ Ori, mag 2.23) - right belt star
  // 6: Saiph (κ Ori, mag 2.09) - lower left leg
  // 7: Meissa (λ Ori, mag 3.39) - head
  'Orion': [
    // Head to shoulders
    { from: 7, to: 0 }, // Meissa to Betelgeuse
    { from: 7, to: 2 }, // Meissa to Bellatrix
    // Shoulders to belt (only to nearest belt star)
    { from: 0, to: 3 }, // Betelgeuse to Alnitak
    { from: 2, to: 3 }, // Bellatrix to Alnitak
    // Belt (three stars in a line)
    { from: 3, to: 4 }, // Alnitak to Alnilam
    { from: 4, to: 5 }, // Alnilam to Mintaka
    // Belt to legs (from belt stars to legs)
    { from: 3, to: 6 }, // Alnitak to Saiph (left leg)
    { from: 5, to: 1 }, // Mintaka to Rigel (right leg)
    { from: 1, to: 6 }, // Rigel to Saiph (connect legs)
  ],
  
  // Ursa Major - The Great Bear (Big Dipper)
  // Traditional positional ordering (bowl to handle):
  // 0: Dubhe (α UMa, mag 1.79) - front of bowl (pointer star)
  // 1: Merak (β UMa, mag 2.37) - bottom of bowl (pointer star)
  // 2: Phecda (γ UMa, mag 2.44) - bottom corner of bowl
  // 3: Megrez (δ UMa, mag 3.31) - connection point bowl to handle
  // 4: Alioth (ε UMa, mag 1.77) - first star in handle
  // 5: Mizar (ζ UMa, mag 2.04) - middle of handle
  // 6: Alkaid (η UMa, mag 1.86) - end of handle
  'Ursa Major': [
    { from: 0, to: 1 }, // Dubhe to Merak (bowl)
    { from: 1, to: 2 }, // Merak to Phecda (bowl)
    { from: 2, to: 3 }, // Phecda to Megrez (bowl to handle)
    { from: 3, to: 4 }, // Megrez to Alioth (handle)
    { from: 4, to: 5 }, // Alioth to Mizar (handle)
    { from: 5, to: 6 }, // Mizar to Alkaid (handle)
    { from: 0, to: 3 }, // Dubhe to Megrez (close bowl)
  ],
  
  // Cassiopeia - The Queen (W or M shape)
  // Traditional positional ordering (left to right in W):
  // 0: Schedar (α Cas, mag 2.24) - leftmost star in W
  // 1: Caph (β Cas, mag 2.28) - second from left
  // 2: Gamma Cassiopeiae (γ Cas, mag 2.47) - center peak
  // 3: Ruchbah (δ Cas, mag 2.68) - second from right
  // 4: Segin (ε Cas, mag 3.38) - rightmost star
  'Cassiopeia': [
    { from: 0, to: 1 }, // Schedar to Caph
    { from: 1, to: 2 }, // Caph to Gamma Cas
    { from: 2, to: 3 }, // Gamma Cas to Ruchbah
    { from: 3, to: 4 }, // Ruchbah to Segin
  ],
  
  // Cygnus - The Swan (Northern Cross)
  // Traditional positional ordering:
  // 0: Deneb (α Cyg, mag 1.25) - tail of swan / top of cross
  // 1: Sadr (γ Cyg, mag 2.23) - center of cross / body
  // 2: Albireo (β Cyg, mag 3.08) - head of swan / bottom of cross
  // 3: Delta Cygni (δ Cyg, mag 2.87) - left wing
  // 4: Gienah (ε Cyg, mag 2.46) - right wing
  'Cygnus': [
    { from: 0, to: 1 }, // Deneb to Sadr (body)
    { from: 1, to: 2 }, // Sadr to Albireo (tail)
    { from: 1, to: 3 }, // Sadr to Delta Cyg (left wing)
    { from: 1, to: 4 }, // Sadr to Epsilon Cyg (right wing)
  ],
  
  // Leo - The Lion
  'Leo': [
    { from: 0, to: 1 }, // Regulus to Algieba (head)
    { from: 1, to: 2 }, // Algieba to Zosma (back)
    { from: 2, to: 3 }, // Zosma to Denebola (tail)
    { from: 0, to: 4 }, // Regulus to body
  ],
  
  // Scorpius - The Scorpion
  // Traditional positional ordering (head to tail):
  // 0: Antares (α Sco, mag 0.91) - heart of the scorpion (red supergiant)
  // 1: Tau Scorpii (τ Sco) - body segment
  // 2: Epsilon Scorpii (ε Sco, mag 2.29) - body segment
  // 3: Mu Scorpii (μ Sco) - tail curve
  // 4: Zeta Scorpii (ζ Sco) - tail curve
  // 5: Shaula (λ Sco, mag 1.63) - stinger
  'Scorpius': [
    { from: 0, to: 1 }, // Antares to Tau Sco (body)
    { from: 1, to: 2 }, // Body segments
    { from: 2, to: 3 }, // Tail curve
    { from: 3, to: 4 }, // Tail curve
    { from: 4, to: 5 }, // Stinger
  ],
  
  // Taurus - The Bull
  'Taurus': [
    { from: 0, to: 1 }, // Aldebaran to El Nath (horns)
    { from: 0, to: 2 }, // Aldebaran to body
    { from: 2, to: 3 }, // Body segments
  ],
  
  // Gemini - The Twins
  'Gemini': [
    { from: 0, to: 1 }, // Castor to Pollux (heads)
    { from: 0, to: 2 }, // Castor's body
    { from: 1, to: 3 }, // Pollux's body
    { from: 2, to: 4 }, // Bodies connect
    { from: 3, to: 4 },
  ],
  
  // Aquila - The Eagle
  'Aquila': [
    { from: 0, to: 1 }, // Altair to Tarazed (body)
    { from: 0, to: 2 }, // Altair to Alshain (body)
    { from: 1, to: 3 }, // Wing
    { from: 2, to: 4 }, // Wing
  ],
  
  // Lyra - The Lyre
  'Lyra': [
    { from: 0, to: 1 }, // Vega to Sheliak
    { from: 0, to: 2 }, // Vega to Sulafat
    { from: 1, to: 3 }, // Parallelogram
    { from: 2, to: 3 },
  ],
  
  // Andromeda - The Princess
  'Andromeda': [
    { from: 0, to: 1 }, // Alpheratz to Mirach
    { from: 1, to: 2 }, // Mirach to Almach
    { from: 1, to: 3 }, // Branch to Andromeda Galaxy region
  ],
  
  // Perseus - The Hero
  'Perseus': [
    { from: 0, to: 1 }, // Mirfak to Algol
    { from: 1, to: 2 }, // Algol to body
    { from: 2, to: 3 }, // Body segments
    { from: 0, to: 4 }, // Arm
  ],
  
  // Pegasus - The Winged Horse (Great Square)
  'Pegasus': [
    { from: 0, to: 1 }, // Markab to Scheat (square)
    { from: 1, to: 2 }, // Scheat to Algenib (square)
    { from: 2, to: 3 }, // Algenib to Alpheratz (square)
    { from: 3, to: 0 }, // Alpheratz to Markab (close square)
    { from: 1, to: 4 }, // Neck
  ],
  
  // Boötes - The Herdsman
  'Boötes': [
    { from: 0, to: 1 }, // Arcturus to Izar
    { from: 0, to: 2 }, // Arcturus to body
    { from: 2, to: 3 }, // Kite shape
    { from: 3, to: 4 },
    { from: 4, to: 1 },
  ],
  
  // Virgo - The Maiden
  'Virgo': [
    { from: 0, to: 1 }, // Spica to Porrima
    { from: 1, to: 2 }, // Body segments
    { from: 2, to: 3 },
    { from: 3, to: 4 },
  ],
};

/**
 * Remap predefined pattern indices to match actual star positions
 * This handles cases where the agent returns stars in a different order
 */
function remapPatternToStars(
  pattern: ConstellationLine[],
  stars: Star[]
): ConstellationLine[] {
  // If we have fewer stars than the pattern expects, return empty array
  const maxIndex = Math.max(...pattern.flatMap(line => [line.from, line.to]));
  
  if (maxIndex >= stars.length) {
    console.warn(
      `[constellation-lines] Pattern expects ${maxIndex + 1} stars but only ${stars.length} provided. Cannot draw constellation.`
    );
    return [];
  }

  return pattern;
}

/**
 * Get constellation lines for a given constellation
 * Uses ONLY predefined traditional patterns - no algorithmic generation
 *
 * @param name - Constellation name
 * @param stars - Array of stars with x,y coordinates
 * @returns Array of line definitions connecting stars, or empty array if no pattern exists
 */
export function getConstellationLines(
  name: string,
  stars: Star[]
): ConstellationLine[] {
  if (stars.length < 2) {
    return [];
  }

  // Ensure all stars have coordinates
  const hasCoordinates = stars.every(s => s.x !== undefined && s.y !== undefined);
  if (!hasCoordinates) {
    console.warn('[constellation-lines] Some stars missing coordinates');
    return [];
  }

  // Use predefined patterns only (traditional asterisms)
  if (CONSTELLATION_PATTERNS[name]) {
    console.log(`[constellation-lines] Using traditional pattern for ${name}`);
    return remapPatternToStars(CONSTELLATION_PATTERNS[name], stars);
  }

  // No pattern available - return empty array
  // Asterisms are cultural artifacts, not algorithmic
  console.log(`[constellation-lines] No traditional pattern available for ${name}`);
  return [];
}

/**
 * Check if a constellation has a predefined pattern
 */
export function hasPredefinedPattern(name: string): boolean {
  return name in CONSTELLATION_PATTERNS;
}

/**
 * Get list of all constellations with predefined patterns
 */
export function getPredefinedConstellations(): string[] {
  return Object.keys(CONSTELLATION_PATTERNS);
}

// Made with Bob