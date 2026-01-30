/**
 * Celestial Coordinate Conversion Utilities
 * Converts Right Ascension (RA) and Declination (Dec) to canvas coordinates
 *
 * Supports multiple projection types for accurate rendering across all declinations:
 * - Equirectangular: For mid-latitude constellations (0-60° dec)
 * - Stereographic: For high-latitude constellations (60-70° dec)
 * - Azimuthal Equidistant: For polar constellations (>70° dec)
 */

import { geoAzimuthalEquidistant, geoStereographic, geoEquirectangular } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';

export interface CelestialCoordinate {
  ra: string;  // Format: "HHh MMm" (e.g., "5h 55m")
  dec: string; // Format: "±DD° MM'" (e.g., "+7° 24'")
}

export interface CanvasCoordinate {
  x: number;
  y: number;
}

export type ProjectionType = 'equirectangular' | 'stereographic' | 'azimuthal-equidistant';

export interface ConstellationBounds {
  raMin: number;
  raMax: number;
  decMin: number;
  decMax: number;
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
 * Determine which projection type to use based on constellation bounds
 * @param bounds The RA/Dec bounds of the constellation
 * @returns The optimal projection type for the constellation
 */
export function selectProjectionType(bounds: ConstellationBounds): ProjectionType {
  const { raMin, raMax, decMin, decMax } = bounds;
  const raRange = raMax - raMin;
  const decRange = decMax - decMin;
  const meanDec = (decMin + decMax) / 2;
  const absMeanDec = Math.abs(meanDec);
  const absMaxDec = Math.max(Math.abs(decMin), Math.abs(decMax));

  // Detect circumpolar constellations:
  // - High declination (>60°) AND
  // - Either any star extends above 70° OR wraps significantly around pole (RA range >90°)
  // The absMaxDec check catches constellations like Cepheus (mean 67.9° but extends to +77° 38')
  // The 90° threshold catches constellations like Draco that span a wide arc at high declination
  const isCircumpolar = absMeanDec > 60 && (
    absMaxDec > 70 ||   // Any star extends above 70° (changed from absMeanDec > 70)
    raRange > 90        // Wraps significantly around pole (>90° at high dec is circumpolar behavior)
  );

  if (isCircumpolar) {
    return 'azimuthal-equidistant';
  }

  // High latitude constellations (60-70°)
  if (absMeanDec >= 60 && absMeanDec <= 70) {
    // Wide-ranging constellations use equirectangular
    const raDecRatio = raRange / Math.max(decRange, 1);
    if (raRange > 60 || raDecRatio > 3) {
      return 'equirectangular';
    }
    return 'stereographic';
  }

  // Default: equirectangular for mid-low latitudes
  return 'equirectangular';
}

/**
 * Convert celestial coordinates using azimuthal equidistant projection
 * Optimal for polar constellations (>70° declination)
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 */
function azimuthalEquidistantToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number,
  padding: number
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  const meanDec = (decMin + decMax) / 2;
  
  // Determine hemisphere (north or south pole)
  const isNorthern = meanDec > 0;
  const poleDec = isNorthern ? 90 : -90;
  
  // Create azimuthal equidistant projection centered on the celestial pole
  // For d3-geo azimuthal projections:
  // - rotate([λ, φ, γ]) where:
  //   - λ (lambda): rotation around vertical axis
  //   - φ (phi): negative of the latitude to center on
  //   - γ (gamma): rotation around the viewing axis (for orientation)
  // - For North Pole (Dec +90°): rotate([0, -90, 180])
  // - For South Pole (Dec -90°): rotate([0, 90, 180])
  // - The 180° γ rotation flips the view to match IAU sky chart convention
  //   where RA increases from right to left (as viewed from Earth looking up)
  const projection: GeoProjection = geoAzimuthalEquidistant()
    .rotate([0, -poleDec, 180]);
  
  // Calculate the angular extent of the constellation from the pole
  const maxPoleDistance = Math.max(
    Math.abs(poleDec - decMin),
    Math.abs(poleDec - decMax)
  );
  
  // Scale to fit the canvas with padding
  const drawableSize = canvasSize - 2 * padding;
  const scale = (drawableSize / 2) / (maxPoleDistance * Math.PI / 180);
  
  projection.scale(scale);
  
  // Translate to center of canvas
  projection.translate([canvasSize / 2, canvasSize / 2]);
  
  // Project the coordinates
  const projected = projection([ra, dec]);
  
  if (!projected) {
    // Fallback if projection fails
    return { x: canvasSize / 2, y: canvasSize / 2 };
  }
  
  // For azimuthal projections centered on the pole, d3-geo already handles
  // the correct orientation: the pole is at the center, and stars radiate outward.
  // Higher declination stars (closer to pole) naturally appear closer to center/top.
  // No Y-axis inversion needed - the projection geometry is already correct.
  return {
    x: Math.round(projected[0]),
    y: Math.round(projected[1])
  };
}

/**
 * Convert celestial coordinates using stereographic projection
 * Optimal for high-latitude constellations (60-70° declination)
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 */
function stereographicToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number,
  padding: number
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  const meanDec = (decMin + decMax) / 2;
  const meanRa = (raMin + raMax) / 2;
  
  // Create stereographic projection centered on the constellation
  const projection: GeoProjection = geoStereographic()
    .center([meanRa, meanDec])
    .rotate([0, 0, 0]);
  
  // Calculate the angular extent
  // Note: Unlike equirectangular, stereographic projection handles spherical
  // geometry internally, so we use the raw RA range without cos(dec) correction
  const raAngularRange = raMax - raMin;
  const decRange = decMax - decMin;
  const maxRange = Math.max(raAngularRange, decRange);
  
  // Scale to fit the canvas with padding
  const drawableSize = canvasSize - 2 * padding;
  const scale = (drawableSize / 2) / (maxRange * Math.PI / 180);
  
  projection.scale(scale);
  
  // Translate to center of canvas
  projection.translate([canvasSize / 2, canvasSize / 2]);
  
  // Project the coordinates
  const projected = projection([ra, dec]);
  
  if (!projected) {
    // Fallback if projection fails
    return { x: canvasSize / 2, y: canvasSize / 2 };
  }
  
  return {
    x: Math.round(projected[0]),
    y: Math.round(projected[1])
  };
}

/**
 * Convert celestial coordinates using equirectangular projection
 * Optimal for mid-latitude constellations (0-60° declination)
 * This is the original implementation with spherical correction
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 */
function equirectangularToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number,
  padding: number
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  
  // Calculate the mean declination for the constellation
  // This is used to apply the spherical correction factor
  const meanDec = (decMin + decMax) / 2;
  const meanDecRadians = (meanDec * Math.PI) / 180;
  
  // Apply spherical correction to RA range
  // At higher declinations, RA circles are smaller, so we need to scale by cos(dec)
  // This gives us the true angular separation on the celestial sphere
  const raAngularRange = (raMax - raMin) * Math.cos(meanDecRadians);
  const decRange = decMax - decMin;
  
  // Determine the maximum range to maintain aspect ratio
  // This ensures we use the full drawable area while preserving celestial proportions
  const maxRange = Math.max(raAngularRange, decRange);
  
  // Calculate the drawable area (square canvas minus padding)
  const drawableSize = canvasSize - 2 * padding;
  
  // Calculate scale factors to maintain proper aspect ratio
  // Both dimensions use the same scale based on the maximum range
  const scale = drawableSize / maxRange;
  
  // Calculate the actual drawable dimensions for each axis
  const drawableWidth = raAngularRange * scale;
  const drawableHeight = decRange * scale;
  
  // Center the constellation in the available space
  const xOffset = padding + (drawableSize - drawableWidth) / 2;
  const yOffset = padding + (drawableSize - drawableHeight) / 2;
  
  // Normalize to 0-1 range within the actual data bounds
  // Invert xNorm so higher RA values appear on the left (IAU sky chart convention)
  const xNorm = 1 - (ra - raMin) / (raMax - raMin);
  const yNorm = (dec - decMin) / decRange;
  
  // Convert to canvas coordinates with proper spherical projection
  // Note: Y axis is inverted for sky view
  // - X follows IAU convention: RA increases from right to left (as viewed from Earth)
  //   This is achieved by inverting xNorm above
  // - Y is inverted: higher Dec (north) appears at the top (lower Y coordinate)
  const x = Math.round(xOffset + xNorm * drawableWidth);
  const y = Math.round(yOffset + (1 - yNorm) * drawableHeight);
  
  return { x, y };
}

/**
 * Convert celestial coordinates using d3.geoEquirectangular() projection
 * This is for comparison with the custom implementation
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 */
function d3EquirectangularToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number,
  padding: number
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  const meanRa = (raMin + raMax) / 2;
  const meanDec = (decMin + decMax) / 2;
  
  // Create d3 equirectangular projection
  // Note: d3-geo uses [longitude, latitude] convention where:
  // - longitude maps to RA (0-360°)
  // - latitude maps to Dec (-90 to +90°)
  //
  // Key insight: For equirectangular, we need to use .rotate() to center the view
  // .rotate([λ, φ, γ]) rotates the sphere:
  // - λ (lambda): rotation around vertical axis (use -meanRa to center on RA)
  // - φ (phi): rotation around horizontal axis (use -meanDec to center on Dec)
  // - γ (gamma): rotation around viewing axis (0 for standard orientation)
  const projection: GeoProjection = geoEquirectangular()
    .rotate([-meanRa, -meanDec, 0])
    // Reflect X-axis to match IAU sky chart convention (RA increases right-to-left)
    .reflectX(true);
  
  // Calculate angular extents
  // Apply spherical correction to RA range to match custom implementation
  const meanDecRadians = (meanDec * Math.PI) / 180;
  const raAngularRange = (raMax - raMin) * Math.cos(meanDecRadians);
  const decRange = decMax - decMin;
  const maxRange = Math.max(raAngularRange, decRange);
  
  // Scale to fit canvas with padding
  const drawableSize = canvasSize - 2 * padding;
  // Adjust scale calculation to better fill the canvas
  // Use the same approach as custom implementation for consistency
  const scale = drawableSize / (maxRange * Math.PI / 180);
  
  projection.scale(scale);
  projection.translate([canvasSize / 2, canvasSize / 2]);
  
  // Project the coordinates
  const projected = projection([ra, dec]);
  
  if (!projected) {
    // Fallback if projection fails
    return { x: canvasSize / 2, y: canvasSize / 2 };
  }
  
  return {
    x: Math.round(projected[0]),
    y: Math.round(projected[1])
  };
}

/**
 * Convert celestial coordinates (RA/Dec) to canvas coordinates
 * Automatically selects the optimal projection based on declination
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 * @returns Canvas coordinates and the projection type used
 */
export function celestialToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number = 400,
  padding: number = 50
): CanvasCoordinate {
  // Select the optimal projection based on constellation bounds
  const projectionType = selectProjectionType(bounds);
  
  // Route to the appropriate projection function
  switch (projectionType) {
    case 'azimuthal-equidistant':
      return azimuthalEquidistantToCanvas(ra, dec, bounds, canvasSize, padding);
    
    case 'stereographic':
      return stereographicToCanvas(ra, dec, bounds, canvasSize, padding);
    
    case 'equirectangular':
    default:
      return equirectangularToCanvas(ra, dec, bounds, canvasSize, padding);
  }
}

/**
 * Get the projection type that would be used for a given constellation
 * Useful for displaying projection information in the UI
 * @param bounds The RA/Dec bounds of the constellation
 * @returns The projection type that will be used
 */
export function getProjectionType(bounds: ConstellationBounds): ProjectionType {
  return selectProjectionType(bounds);
}

/**
 * Calculate constellation bounds from an array of stars
 */
export function calculateConstellationBounds(
  stars: Array<{ ra: string; dec: string }>
): ConstellationBounds {
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
 * @param stars Array of stars with RA/Dec coordinates
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 * @returns Array of canvas coordinates
 */
export function convertStarsToCanvas(
  stars: Array<CelestialCoordinate>,
  canvasSize: number = 400,
  padding: number = 50
): Array<CanvasCoordinate> {
  // Calculate bounds
  const bounds = calculateConstellationBounds(stars);
  
  // Convert each star using the automatically selected projection
  return stars.map(star => {
    const ra = raToDecimalDegrees(star.ra);
    const dec = decToDecimalDegrees(star.dec);
    return celestialToCanvas(ra, dec, bounds, canvasSize, padding);
  });
}

/**
 * Convert an array of stars with RA/Dec to canvas coordinates
 * and return the projection type used
 * @param stars Array of stars with RA/Dec coordinates
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 * @returns Object containing canvas coordinates and projection type
 */
export function convertStarsToCanvasWithProjection(
  stars: Array<CelestialCoordinate>,
  canvasSize: number = 400,
  padding: number = 50
): {
  coordinates: Array<CanvasCoordinate>;
  projectionType: ProjectionType;
  bounds: ConstellationBounds;
} {
  // Calculate bounds
  const bounds = calculateConstellationBounds(stars);
  
  // Get the projection type that will be used
  const projectionType = selectProjectionType(bounds);
  
  // Convert each star
  const coordinates = stars.map(star => {
    const ra = raToDecimalDegrees(star.ra);
    const dec = decToDecimalDegrees(star.dec);
    return celestialToCanvas(ra, dec, bounds, canvasSize, padding);
  });
  
  return {
    coordinates,
    projectionType,
    bounds
  };
}

// Made with Bob
/**
 * Compare custom equirectangular vs d3.geoEquirectangular() projections
 * Returns coordinates from both methods for visual comparison
 * @param stars Array of stars with RA/Dec coordinates
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 * @returns Object with coordinates from both projection methods
 */
export function compareProjections(
  stars: Array<CelestialCoordinate>,
  canvasSize: number = 400,
  padding: number = 50
): {
  custom: Array<CanvasCoordinate>;
  d3Geo: Array<CanvasCoordinate>;
  bounds: ConstellationBounds;
  projectionType: ProjectionType;
} {
  const bounds = calculateConstellationBounds(stars);
  const projectionType = selectProjectionType(bounds);
  
  // Get coordinates using custom implementation
  const custom = stars.map(star => {
    const ra = raToDecimalDegrees(star.ra);
    const dec = decToDecimalDegrees(star.dec);
    return equirectangularToCanvas(ra, dec, bounds, canvasSize, padding);
  });
  
  // Get coordinates using d3.geoEquirectangular()
  const d3Geo = stars.map(star => {
    const ra = raToDecimalDegrees(star.ra);
    const dec = decToDecimalDegrees(star.dec);
    return d3EquirectangularToCanvas(ra, dec, bounds, canvasSize, padding);
  });
  
  return {
    custom,
    d3Geo,
    bounds,
    projectionType
  };
}
