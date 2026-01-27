/**
 * Celestial Coordinate Conversion Utilities
 * Converts Right Ascension (RA) and Declination (Dec) to canvas coordinates
 */

export interface CelestialCoordinate {
  ra: string;  // Format: "HHh MMm" (e.g., "5h 55m")
  dec: string; // Format: "±DD° MM'" (e.g., "+7° 24'")
}

export interface CanvasCoordinate {
  x: number;
  y: number;
}

/**
 * Convert RA string (e.g., "5h 55m") to decimal degrees
 */
export function raToDecimalDegrees(ra: string): number {
  const match = ra.match(/(\d+)h\s*(\d+)m/);
  if (!match) {
    throw new Error(`Invalid RA format: ${ra}. Expected format: "HHh MMm"`);
  }
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  // Convert to degrees: 1 hour = 15 degrees, 1 minute = 0.25 degrees
  return hours * 15 + minutes * 0.25;
}

/**
 * Convert Dec string (e.g., "+7° 24'" or "+7° 24") to decimal degrees
 */
export function decToDecimalDegrees(dec: string): number {
  const match = dec.match(/([+-]?)(\d+)°\s*(\d+)'?/);
  if (!match) {
    throw new Error(`Invalid Dec format: ${dec}. Expected format: "±DD° MM'" or "±DD° MM"`);
  }
  
  const sign = match[1] === '-' ? -1 : 1;
  const degrees = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  
  // Convert to decimal degrees: 1 minute = 1/60 degree
  return sign * (degrees + minutes / 60);
}

/**
 * Convert celestial coordinates (RA/Dec) to canvas coordinates
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 */
export function celestialToCanvas(
  ra: number,
  dec: number,
  bounds: {
    raMin: number;
    raMax: number;
    decMin: number;
    decMax: number;
  },
  canvasSize: number = 400,
  padding: number = 50
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  
  // Calculate ranges
  const raRange = raMax - raMin;
  const decRange = decMax - decMin;
  
  // Normalize to 0-1 range
  const xNorm = (ra - raMin) / raRange;
  const yNorm = (dec - decMin) / decRange;
  
  // Convert to canvas coordinates
  // Note: Both axes are inverted for sky view
  // - X is inverted: higher RA (east) appears on the left when looking up at the sky
  // - Y is inverted: higher Dec (north) appears at the top (lower Y coordinate)
  const drawableSize = canvasSize - 2 * padding;
  const x = Math.round(padding + (1 - xNorm) * drawableSize);
  const y = Math.round(padding + (1 - yNorm) * drawableSize);
  
  return { x, y };
}

/**
 * Calculate constellation bounds from an array of stars
 */
export function calculateConstellationBounds(
  stars: Array<{ ra: string; dec: string }>
): {
  raMin: number;
  raMax: number;
  decMin: number;
  decMax: number;
} {
  const raValues = stars.map(s => raToDecimalDegrees(s.ra));
  const decValues = stars.map(s => decToDecimalDegrees(s.dec));
  
  return {
    raMin: Math.min(...raValues),
    raMax: Math.max(...raValues),
    decMin: Math.min(...decValues),
    decMax: Math.max(...decValues),
  };
}

/**
 * Convert an array of stars with RA/Dec to canvas coordinates
 */
export function convertStarsToCanvas(
  stars: Array<CelestialCoordinate>,
  canvasSize: number = 400,
  padding: number = 50
): Array<CanvasCoordinate> {
  // Calculate bounds
  const bounds = calculateConstellationBounds(stars);
  
  // Convert each star
  return stars.map(star => {
    const ra = raToDecimalDegrees(star.ra);
    const dec = decToDecimalDegrees(star.dec);
    return celestialToCanvas(ra, dec, bounds, canvasSize, padding);
  });
}

// Made with Bob