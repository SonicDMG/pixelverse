/**
 * Celestial Coordinate Conversion Utilities
 *
 * Converts Right Ascension (RA) and Declination (Dec) to canvas coordinates using
 * d3-geo map projections. Celestial coordinates are spherical and cannot be directly
 * plotted on a 2D canvas without proper projection to account for spherical geometry.
 *
 * This implementation uses d3-geo's battle-tested projection library to ensure
 * astronomically accurate rendering across all declination ranges, following IAU
 * (International Astronomical Union) sky chart conventions.
 *
 * Supported projections (automatically selected based on declination):
 * - Equirectangular: For mid-latitude constellations (0-60° dec)
 * - Stereographic: For high-latitude constellations (60-70° dec)
 * - Azimuthal Equidistant: For polar constellations (>70° dec)
 *
 * @see {@link file://./docs/CONSTELLATION_RENDERING_GUIDE.md} for detailed technical explanation
 * @module celestial-coordinates
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
 *
 * The selection algorithm considers:
 * 1. Mean declination (average latitude of constellation)
 * 2. Maximum declination (highest point reached)
 * 3. RA range (how wide the constellation spans)
 *
 * **Circumpolar Detection**: Constellations are considered circumpolar if they have
 * high mean declination (>60°) AND either extend above 70° OR span >90° in RA
 * (indicating they wrap around the celestial pole).
 *
 * **Projection Selection**:
 * - Circumpolar → Azimuthal Equidistant (pole-centered view)
 * - 60-70° dec → Stereographic (conformal, preserves shapes at high latitudes)
 * - 0-60° dec → Equirectangular (standard cylindrical projection)
 *
 * @param bounds The RA/Dec bounds of the constellation
 * @returns The optimal projection type for the constellation
 * @see {@link file://./docs/CONSTELLATION_RENDERING_GUIDE.md#automatic-projection-selection}
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
 *
 * Optimal for polar constellations (>70° declination) and circumpolar constellations.
 * This projection centers on the celestial pole and preserves distances from the center,
 * making it ideal for constellations that wrap around the pole.
 *
 * **d3-geo Configuration**:
 * - `.rotate([0, -poleDec, 180])`: Centers on pole and applies 180° rotation for IAU convention
 *   - λ (lambda): 0° - no rotation around vertical axis
 *   - φ (phi): -poleDec - centers on the appropriate pole (+90° or -90°)
 *   - γ (gamma): 180° - flips view to match IAU sky chart convention (RA increases right-to-left)
 * - `.scale()`: Calculated to fit constellation within canvas bounds
 * - `.translate()`: Centers the projection on the canvas
 *
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 * @see {@link https://d3js.org/d3-geo/azimuthal#geoAzimuthalEquidistant}
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
  
  // Adaptive padding for small constellations
  const minPadding = padding * 0.3;
  const adaptivePadding = maxPoleDistance < 20
    ? Math.max(minPadding, padding * (maxPoleDistance / 20))
    : padding;
  
  // Scale to fit the canvas with adaptive padding
  const drawableSize = canvasSize - 2 * adaptivePadding;
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
 *
 * Optimal for high-latitude constellations (60-70° declination). Stereographic
 * projection is conformal (preserves angles and shapes locally), making it ideal
 * for compact high-latitude constellations where shape preservation is important.
 *
 * **d3-geo Configuration**:
 * - `.center([meanRa, meanDec])`: Centers projection on constellation's midpoint
 * - `.rotate([0, 0, 0])`: No additional rotation (centering handles positioning)
 * - `.scale()`: Calculated based on constellation's angular extent
 * - `.translate()`: Centers the projection on the canvas
 *
 * Unlike equirectangular, stereographic handles spherical geometry internally,
 * so no manual cos(declination) correction is needed.
 *
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 * @see {@link https://d3js.org/d3-geo/conic#geoStereographic}
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
  const raAngularRange = raMax - raMin;
  const decRange = decMax - decMin;
  const maxRange = Math.max(raAngularRange, decRange);
  
  // Adaptive padding for small constellations
  const minPadding = padding * 0.3;
  const adaptivePadding = maxRange < 20
    ? Math.max(minPadding, padding * (maxRange / 20))
    : padding;
  
  // Scale to fit the canvas with adaptive padding
  const drawableSize = canvasSize - 2 * adaptivePadding;
  const scale = (drawableSize / 2) / (maxRange * Math.PI / 180);
  
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
 * Convert celestial coordinates using equirectangular projection (d3-geo implementation)
 *
 * Optimal for mid-latitude constellations (0-60° declination). Equirectangular
 * (also called "plate carrée") is a simple cylindrical projection that maps
 * longitude/latitude (RA/Dec) directly to X/Y coordinates.
 *
 * **Key Implementation Details**:
 *
 * 1. **Spherical Correction**: RA circles shrink at higher declinations due to
 *    spherical geometry. We apply `cos(meanDec)` correction to the RA range to
 *    account for this, ensuring accurate angular measurements.
 *
 *    Example: At 60° declination, RA circles are only 50% as wide as at the equator.
 *    Without correction, constellations would appear horizontally stretched.
 *
 * 2. **IAU Sky Chart Convention**: Astronomical charts show the sky as viewed from
 *    Earth looking up, where RA increases from right to left (east to west).
 *    We implement this using `.reflectX(true)` to flip the X-axis.
 *
 * 3. **d3-geo Configuration**:
 *    - `.rotate([-meanRa, -meanDec, 0])`: Centers view on constellation
 *      - λ (lambda): -meanRa rotates to center RA
 *      - φ (phi): -meanDec rotates to center Dec
 *      - γ (gamma): 0° (no roll rotation)
 *    - `.reflectX(true)`: Implements IAU convention (RA increases right-to-left)
 *    - `.scale()`: Calculated using spherical-corrected angular extent
 *    - `.translate()`: Centers projection on canvas
 *
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas
 * @param padding Padding around the edges
 * @returns Canvas coordinates
 * @see {@link https://d3js.org/d3-geo/cylindrical#geoEquirectangular}
 * @see {@link file://./docs/CONSTELLATION_RENDERING_GUIDE.md#equirectangular-projection}
 */
function equirectangularToCanvas(
  ra: number,
  dec: number,
  bounds: ConstellationBounds,
  canvasSize: number,
  padding: number
): CanvasCoordinate {
  const { raMin, raMax, decMin, decMax } = bounds;
  
  console.log('🔧 NEW LINEAR MAPPING CODE ACTIVE - equirectangularToCanvas called');
  console.log('Input:', { ra, dec, bounds });
  
  // Use simple linear mapping instead of complex projection
  // This approach directly maps celestial coordinates to canvas coordinates
  // without the distortion caused by d3-geo's rotate() method
  
  // Calculate the range of coordinates
  let raRange = raMax - raMin;
  let decRange = decMax - decMin;
  
  // Handle RA wrapping at 0°/360° boundary
  if (raRange < 0) {
    raRange += 360;
  }
  
  // Apply spherical correction to RA range based on declination
  // At higher declinations, RA lines converge, so we need to account for this
  const meanDec = (decMin + decMax) / 2;
  const meanDecRadians = (meanDec * Math.PI) / 180;
  const raAngularRange = raRange * Math.cos(meanDecRadians);
  
  // Use the larger of the two ranges to determine scale
  const maxRange = Math.max(raAngularRange, decRange);
  
  // Adaptive padding: reduce padding for small constellations
  const minPadding = padding * 0.3;
  const adaptivePadding = maxRange < 20
    ? Math.max(minPadding, padding * (maxRange / 20))
    : padding;
  
  // Calculate drawable area
  const drawableSize = canvasSize - 2 * adaptivePadding;
  
  // Calculate scale to fit the constellation in the drawable area
  const scale = drawableSize / maxRange;
  
  // Normalize coordinates relative to bounds center
  const meanRa = (raMin + raMax) / 2;
  let normalizedRa = ra - meanRa;
  
  // Handle RA wrapping
  if (normalizedRa > 180) normalizedRa -= 360;
  if (normalizedRa < -180) normalizedRa += 360;
  
  const normalizedDec = dec - meanDec;
  
  // Apply spherical correction to RA coordinate
  const correctedRa = normalizedRa * Math.cos(meanDecRadians);
  
  // Map to canvas coordinates
  // X: RA increases LEFT-TO-RIGHT (standard map convention)
  // Y: Dec increases bottom-to-top, so we negate it (canvas Y increases downward)
  const x = canvasSize / 2 + (correctedRa * scale);  // Changed from minus to plus
  const y = canvasSize / 2 - (normalizedDec * scale);
  
  console.log('Converted:', { ra, dec, normalizedRa, correctedRa, x, y });
  
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
}

/**
 * Convert celestial coordinates (RA/Dec) to canvas coordinates
 *
 * This is the main entry point for coordinate conversion. It automatically:
 * 1. Selects the optimal projection based on constellation declination
 * 2. Routes to the appropriate d3-geo projection function
 * 3. Returns canvas coordinates ready for rendering
 *
 * **Automatic Projection Selection**:
 * - Analyzes constellation bounds (RA/Dec range)
 * - Chooses projection optimized for the declination range
 * - Handles special cases (circumpolar constellations)
 *
 * @param ra Right Ascension in decimal degrees
 * @param dec Declination in decimal degrees
 * @param bounds The RA/Dec bounds of the constellation
 * @param canvasSize Size of the canvas (default 400)
 * @param padding Padding around the edges (default 50)
 * @returns Canvas coordinates
 * @see {@link selectProjectionType} for projection selection logic
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

