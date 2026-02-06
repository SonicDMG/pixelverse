'use client';

import { Constellation } from '@/components/dynamic/Constellation';
import { ConstellationComparison } from '@/components/dynamic/ConstellationComparison';
import { getProjectionType } from '@/utils/space/celestial-coordinates';

export default function TestProjectionsPage() {
  // Test constellation 1: Orion (Equatorial, ~0-10° dec) - Should use equirectangular
  // Complete 8-star pattern showing the iconic hourglass shape with head
  // UPDATED: Using authoritative coordinates from constellations.csv
  const orion = {
    name: "Orion",
    abbreviation: "Ori",
    description: "Equatorial constellation (0-10° dec) - Testing equirectangular projection",
    brightestStar: "Rigel (β Ori)",
    visibility: "Visible worldwide",
    stars: [
      { name: "Betelgeuse (α Ori)", magnitude: 0.45, ra: "5h 55m", dec: "+7° 24'", color: "M", size: 2.5 },
      { name: "Rigel (β Ori)", magnitude: 0.18, ra: "5h 14m", dec: "-8° 12'", color: "B", size: 2.8 },
      { name: "Bellatrix (γ Ori)", magnitude: 1.64, ra: "5h 25m", dec: "+6° 21'", color: "B" },
      { name: "Alnitak (ζ Ori)", magnitude: 1.74, ra: "5h 41m", dec: "-1° 57'", color: "O" },
      { name: "Alnilam (ε Ori)", magnitude: 1.69, ra: "5h 36m", dec: "-1° 12'", color: "B" },
      { name: "Mintaka (δ Ori)", magnitude: 2.23, ra: "5h 32m", dec: "-0° 18'", color: "B" },
      { name: "Saiph (κ Ori)", magnitude: 2.07, ra: "5h 48m", dec: "-9° 40'", color: "B" },
      { name: "Meissa (λ Ori)", magnitude: 3.54, ra: "5h 35m", dec: "+9° 56'", color: "O" },
    ],
    lines: [
      // Head to shoulders (Meissa forms triangle with Betelgeuse and Bellatrix)
      { from: 7, to: 0 },
      { from: 7, to: 2 },
      // Left shoulder to right shoulder (top of hourglass)
      { from: 0, to: 2 },
      // Right shoulder to belt
      { from: 2, to: 5 },
      // Belt stars (Mintaka -> Alnilam -> Alnitak)
      { from: 5, to: 4 },
      { from: 4, to: 3 },
      // Belt to legs (bottom of hourglass)
      { from: 3, to: 1 },
      { from: 3, to: 6 },
      // Left shoulder to belt
      { from: 0, to: 3 },
    ]
  };

  // Test constellation 2: Draco (Circumpolar, ~61° dec, 96° RA range) - Should use azimuthal equidistant
  // Expanded pattern showing the dragon's head and complete serpentine body
  const draco = {
    name: "Draco",
    abbreviation: "Dra",
    description: "Circumpolar constellation (61° dec, 96° RA span) - Testing azimuthal equidistant projection",
    brightestStar: "Eltanin (γ Dra)",
    visibility: "Northern Hemisphere, visible year-round",
    stars: [
      { name: "Eltanin (γ Dra)", magnitude: 2.23, ra: "17h 56m", dec: "+51° 29'", color: "K", size: 2.0 },
      { name: "Rastaban (β Dra)", magnitude: 2.79, ra: "17h 30m", dec: "+52° 18'", color: "G" },
      { name: "Thuban (α Dra)", magnitude: 3.65, ra: "14h 04m", dec: "+64° 22'", color: "A" },
      { name: "Edasich (ι Dra)", magnitude: 3.29, ra: "15h 25m", dec: "+58° 58'", color: "K" },
      { name: "Aldhibah (ζ Dra)", magnitude: 3.17, ra: "17h 08m", dec: "+65° 43'", color: "B" },
      { name: "Grumium (ξ Dra)", magnitude: 3.75, ra: "17h 53m", dec: "+56° 52'", color: "K" },
      { name: "Eta Draconis (η Dra)", magnitude: 2.74, ra: "16h 24m", dec: "+61° 31'", color: "G" },
      { name: "Kappa Draconis (κ Dra)", magnitude: 3.87, ra: "12h 33m", dec: "+69° 47'", color: "B" },
      { name: "Lambda Draconis (λ Dra)", magnitude: 3.84, ra: "11h 31m", dec: "+69° 20'", color: "M" },
    ],
    lines: [
      // Dragon's head (Eltanin -> Rastaban -> Grumium)
      { from: 0, to: 1 },
      { from: 1, to: 5 },
      { from: 5, to: 0 },
      // Neck connecting to body (Rastaban -> Aldhibah)
      { from: 1, to: 4 },
      // Body winding through (Aldhibah -> Eta -> Thuban)
      { from: 4, to: 6 },
      { from: 6, to: 2 },
      // Body continuing (Thuban -> Edasich -> Kappa -> Lambda)
      { from: 2, to: 3 },
      { from: 3, to: 7 },
      { from: 7, to: 8 },
    ]
  };

  // Test constellation 3: Ursa Major (Mid-high latitude, ~56° dec) - Should use equirectangular
  // Complete Big Dipper pattern with all 7 stars
  // UPDATED: Using authoritative coordinates from constellations.csv
  const ursaMajor = {
    name: "Ursa Major",
    abbreviation: "UMa",
    description: "Mid-high latitude constellation (~56° dec) - Testing equirectangular projection",
    brightestStar: "Alioth (ε UMa)",
    visibility: "Northern Hemisphere, visible year-round",
    stars: [
      { name: "Dubhe (α UMa)", magnitude: 1.79, ra: "11h 04m", dec: "+61° 45'", color: "K", size: 2.1 },
      { name: "Merak (β UMa)", magnitude: 2.37, ra: "11h 02m", dec: "+56° 23'", color: "A" },
      { name: "Phecda (γ UMa)", magnitude: 2.44, ra: "11h 54m", dec: "+53° 42'", color: "A" },
      { name: "Megrez (δ UMa)", magnitude: 3.31, ra: "12h 15m", dec: "+57° 02'", color: "A" },
      { name: "Alioth (ε UMa)", magnitude: 1.76, ra: "12h 54m", dec: "+55° 58'", color: "A", size: 2.2 },
      { name: "Mizar (ζ UMa)", magnitude: 2.23, ra: "13h 24m", dec: "+54° 56'", color: "A" },
      { name: "Alkaid (η UMa)", magnitude: 1.86, ra: "13h 48m", dec: "+49° 19'", color: "B", size: 2.0 },
    ],
    lines: [
      // Bowl of the dipper (Dubhe -> Merak -> Phecda -> Megrez -> back to Dubhe)
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 0 },
      // Handle of the dipper (Megrez -> Alioth -> Mizar -> Alkaid)
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
    ]
  };

  // Test constellation 4: Ursa Minor (Polar, ~75-90° dec) - Should use azimuthal equidistant
  // Complete Little Dipper pattern with all 7 stars
  const ursaMinor = {
    name: "Ursa Minor",
    abbreviation: "UMi",
    description: "Circumpolar constellation (>70° dec) - Testing azimuthal equidistant projection",
    brightestStar: "Polaris (α UMi)",
    visibility: "Northern Hemisphere, visible year-round",
    stars: [
      { name: "Polaris (α UMi)", magnitude: 1.98, ra: "2h 32m", dec: "+89° 16'", color: "F", size: 2.0 },
      { name: "Kochab (β UMi)", magnitude: 2.08, ra: "14h 51m", dec: "+74° 09'", color: "K", size: 1.9 },
      { name: "Pherkad (γ UMi)", magnitude: 3.05, ra: "15h 21m", dec: "+71° 50'", color: "A" },
      { name: "Yildun (δ UMi)", magnitude: 4.35, ra: "17h 32m", dec: "+86° 35'", color: "A" },
      { name: "Urodelus (ε UMi)", magnitude: 4.23, ra: "16h 46m", dec: "+82° 02'", color: "G" },
      { name: "Ahfa al Farkadain (ζ UMi)", magnitude: 4.32, ra: "15h 44m", dec: "+77° 48'", color: "A" },
      { name: "Anwar al Farkadain (η UMi)", magnitude: 4.95, ra: "16h 17m", dec: "+75° 45'", color: "F" },
    ],
    lines: [
      // Handle of the dipper (Polaris -> Yildun -> Urodelus)
      { from: 0, to: 3 },
      { from: 3, to: 4 },
      // Bowl of the dipper (Urodelus -> Ahfa -> Anwar -> Kochab -> Pherkad)
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 1 },
      { from: 1, to: 2 },
      // Close the bowl (Pherkad -> Ahfa)
      { from: 2, to: 5 },
    ]
  };

  // Test constellation 5: Cassiopeia (High-latitude, compact ~60° dec) - Should use stereographic
  // Classic W-shape pattern with all 5 main stars
  const cassiopeia = {
    name: "Cassiopeia",
    abbreviation: "Cas",
    description: "High-latitude compact constellation (~60° dec, narrow RA) - Testing stereographic projection",
    brightestStar: "Shedir (α Cas)",
    visibility: "Northern Hemisphere, visible year-round",
    stars: [
      { name: "Shedir (α Cas)", magnitude: 2.24, ra: "0h 40m", dec: "+56° 32'", color: "F", size: 2.0 },
      { name: "Caph (β Cas)", magnitude: 2.28, ra: "0h 09m", dec: "+59° 08'", color: "A", size: 1.9 },
      { name: "Gamma Cassiopeiae (γ Cas)", magnitude: 2.47, ra: "0h 56m", dec: "+60° 43'", color: "B" },
      { name: "Ruchbah (δ Cas)", magnitude: 2.68, ra: "1h 25m", dec: "+60° 15'", color: "B" },
      { name: "Segin (ε Cas)", magnitude: 3.38, ra: "1h 49m", dec: "+63° 42'", color: "A" },
    ],
    lines: [
      // Classic W-shape connecting all 5 stars in sequence
      { from: 1, to: 0 },
      { from: 0, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
    ]
  };

  // Test constellation 6: Cygnus (Mid-latitude ~40° dec) - Should use equirectangular
  // Northern Cross pattern showing the swan flying along the Milky Way
  // UPDATED: Using authoritative coordinates from constellations.csv
  const cygnus = {
    name: "Cygnus",
    abbreviation: "Cyg",
    description: "Mid-latitude constellation (~40° dec) - Testing equirectangular projection",
    brightestStar: "Deneb (α Cyg)",
    visibility: "Northern Hemisphere summer",
    stars: [
      { name: "Deneb (α Cyg)", magnitude: 1.25, ra: "20h 41m", dec: "+45° 17'", color: "A", size: 2.5 },
      { name: "Sadr (γ Cyg)", magnitude: 2.23, ra: "20h 22m", dec: "+40° 15'", color: "B", size: 2.0 },
      { name: "Albireo (β Cyg)", magnitude: 3.08, ra: "19h 31m", dec: "+27° 58'", color: "A" },
      { name: "Gienah (ε Cyg)", magnitude: 2.48, ra: "20h 46m", dec: "+33° 58'", color: "K" },
      { name: "Delta Cygni (δ Cyg)", magnitude: 2.86, ra: "19h 45m", dec: "+45° 08'", color: "B" },
    ],
    lines: [
      // Cross pattern: vertical line (Deneb -> Sadr -> Albireo)
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      // Horizontal line (Delta -> Sadr -> Gienah)
      { from: 4, to: 1 },
      { from: 1, to: 3 },
    ]
  };

  // Test constellation 7: Scorpius (Southern mid-latitude ~-30° dec) - Should use equirectangular
  // Complete scorpion pattern showing head, body, claws, and curved tail that hooks upward
  // UPDATED: Using authoritative coordinates from constellations.csv
  const scorpius = {
    name: "Scorpius",
    abbreviation: "Sco",
    description: "Southern mid-latitude constellation (~-30° dec) - Testing equirectangular projection",
    brightestStar: "Antares (α Sco)",
    visibility: "Southern Hemisphere, northern summer",
    stars: [
      { name: "Antares (α Sco)", magnitude: 0.96, ra: "16h 29m", dec: "-26° 26'", color: "M", size: 2.5 },
      { name: "Shaula (λ Sco)", magnitude: 1.62, ra: "17h 34m", dec: "-37° 06'", color: "B", size: 2.1 },
      { name: "Sargas (θ Sco)", magnitude: 1.86, ra: "17h 37m", dec: "-43° 00'", color: "F", size: 2.0 },
      { name: "Dschubba (δ Sco)", magnitude: 2.32, ra: "16h 00m", dec: "-22° 37'", color: "B" },
      { name: "Graffias (β Sco)", magnitude: 2.62, ra: "16h 05m", dec: "-19° 48'", color: "B" },
      { name: "Pi Scorpii (π Sco)", magnitude: 2.89, ra: "15h 59m", dec: "-26° 07'", color: "B" },
      { name: "Tau Scorpii (τ Sco)", magnitude: 2.82, ra: "16h 36m", dec: "-28° 13'", color: "B" },
      { name: "Epsilon Scorpii (ε Sco)", magnitude: 2.29, ra: "16h 50m", dec: "-34° 18'", color: "K" },
      { name: "Kappa Scorpii (κ Sco)", magnitude: 2.41, ra: "17h 42m", dec: "-39° 02'", color: "B" },
      { name: "Iota Scorpii (ι Sco)", magnitude: 3.03, ra: "17h 48m", dec: "-40° 08'", color: "F" },
      { name: "Lesath (υ Sco)", magnitude: 2.70, ra: "17h 31m", dec: "-37° 18'", color: "B" },
      { name: "Sigma Scorpii (σ Sco)", magnitude: 2.90, ra: "16h 21m", dec: "-25° 36'", color: "B" },
      { name: "Mu-1 Scorpii (μ¹ Sco)", magnitude: 3.04, ra: "16h 52m", dec: "-38° 03'", color: "B" },
      { name: "Zeta-1 Scorpii (ζ¹ Sco)", magnitude: 4.73, ra: "16h 54m", dec: "-42° 22'", color: "B" },
      { name: "Eta Scorpii (η Sco)", magnitude: 3.33, ra: "17h 12m", dec: "-43° 14'", color: "F" },
      { name: "Nu Scorpii (ν Sco)", magnitude: 4.01, ra: "16h 12m", dec: "-19° 28'", color: "B" },
      { name: "G Scorpii (G Sco)", magnitude: 3.21, ra: "17h 50m", dec: "-37° 03'", color: "K" },
    ],
    lines: [
      // Head/claws (Graffias -> Dschubba -> Pi)
      { from: 4, to: 3 },   // Graffias to Dschubba
      { from: 3, to: 5 },   // Dschubba to Pi
      // Body from head to heart (Dschubba -> Sigma -> Antares)
      { from: 3, to: 11 },  // Dschubba to Sigma
      { from: 11, to: 0 },  // Sigma to Antares (the heart)
      // Body continuing down (Antares -> Tau -> Epsilon)
      { from: 0, to: 6 },   // Antares to Tau
      { from: 6, to: 7 },   // Tau to Epsilon
      // Tail curve (Epsilon -> Mu-1 -> Shaula -> Lesath)
      { from: 7, to: 12 },  // Epsilon to Mu-1
      { from: 12, to: 1 },  // Mu-1 to Shaula
      { from: 1, to: 10 },  // Shaula to Lesath
      // Stinger (Lesath -> Kappa -> Iota -> Sargas)
      { from: 10, to: 8 },  // Lesath to Kappa
      { from: 8, to: 9 },   // Kappa to Iota
      { from: 9, to: 2 },   // Iota to Sargas (stinger tip)
    ]
  };

  // Test constellation 8: Cepheus (High-latitude, compact ~65° dec) - Should use stereographic or azimuthal
  // Compact house/pentagon shape showing the central portion of the constellation
  // Note: Errai at +77° 38' may trigger azimuthal projection due to high declination
  const cepheus = {
    name: "Cepheus",
    abbreviation: "Cep",
    description: "High-latitude compact constellation (~65° dec, narrow RA) - Testing stereographic/azimuthal projection",
    brightestStar: "Alderamin (α Cep)",
    visibility: "Northern Hemisphere, visible year-round",
    stars: [
      { name: "Alderamin (α Cep)", magnitude: 2.45, ra: "21h 19m", dec: "+62° 35'", color: "A", size: 2.0 },
      { name: "Alfirk (β Cep)", magnitude: 3.23, ra: "21h 29m", dec: "+70° 34'", color: "B" },
      { name: "Errai (γ Cep)", magnitude: 3.21, ra: "23h 39m", dec: "+77° 38'", color: "K" },
      { name: "Delta Cephei (δ Cep)", magnitude: 3.98, ra: "22h 29m", dec: "+58° 25'", color: "F" },
      { name: "Zeta Cephei (ζ Cep)", magnitude: 3.39, ra: "22h 11m", dec: "+58° 12'", color: "K" },
    ],
    lines: [
      // House/pentagon shape connecting all 5 stars
      { from: 0, to: 1 },  // Alderamin to Alfirk (right side of house)
      { from: 1, to: 2 },  // Alfirk to Errai (roof peak)
      { from: 2, to: 3 },  // Errai to Delta (left side of roof)
      { from: 3, to: 4 },  // Delta to Zeta (bottom left)
      { from: 4, to: 0 },  // Zeta back to Alderamin (bottom - close the shape)
    ]
  };

  // Calculate which projection each constellation will use
  const getProjectionInfo = (stars: any[]) => {
    const raValues = stars.map(s => {
      const match = s.ra.match(/(\d+)h\s*(\d+)m/);
      if (!match) return 0;
      return parseInt(match[1]) * 15 + parseInt(match[2]) * 0.25;
    });
    const decValues = stars.map(s => {
      const match = s.dec.match(/([+-]?)(\d+)°\s*(\d+)'/);
      if (!match) return 0;
      const sign = match[1] === '-' ? -1 : 1;
      return sign * (parseInt(match[2]) + parseInt(match[3]) / 60);
    });
    
    const bounds = {
      raMin: Math.min(...raValues),
      raMax: Math.max(...raValues),
      decMin: Math.min(...decValues),
      decMax: Math.max(...decValues),
    };
    
    return {
      projection: getProjectionType(bounds),
      meanDec: ((bounds.decMin + bounds.decMax) / 2).toFixed(1)
    };
  };

  const orionInfo = getProjectionInfo(orion.stars);
  const ursaMajorInfo = getProjectionInfo(ursaMajor.stars);
  const dracoInfo = getProjectionInfo(draco.stars);
  const ursaMinorInfo = getProjectionInfo(ursaMinor.stars);
  const cassiopeiaInfo = getProjectionInfo(cassiopeia.stars);
  const cygnusInfo = getProjectionInfo(cygnus.stars);
  const scorpiusInfo = getProjectionInfo(scorpius.stars);
  const cepheusInfo = getProjectionInfo(cepheus.stars);

  return (
    <div className="min-h-screen bg-[var(--color-bg-darker)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-pixel text-[var(--color-accent)] glow-text">
            Projection System Test
          </h1>
          <p className="text-lg font-pixel text-gray-300">
            Comprehensive testing of automatic projection selection across all declination zones
          </p>
          <p className="text-sm font-pixel text-gray-400">
            8 constellations covering equatorial, mid-latitude, high-latitude, and polar regions
          </p>
        </div>

        {/* Projection Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] rounded">
            <h3 className="font-pixel text-[var(--color-accent)] mb-2">Equirectangular</h3>
            <p className="text-sm font-pixel text-gray-300">0-60° declination</p>
            <p className="text-xs font-pixel text-gray-500 mt-1">Standard projection for mid-latitude constellations</p>
            <p className="text-xs font-pixel text-[var(--color-accent)] mt-2">Used by: Orion, Ursa Major, Cygnus, Scorpius</p>
          </div>
          <div className="p-4 bg-[var(--color-bg-card)] border-2 border-[var(--color-secondary)] rounded">
            <h3 className="font-pixel text-[var(--color-secondary)] mb-2">Stereographic</h3>
            <p className="text-sm font-pixel text-gray-300">60-70° declination (compact)</p>
            <p className="text-xs font-pixel text-gray-500 mt-1">For compact high-latitude constellations</p>
            <p className="text-xs font-pixel text-[var(--color-secondary)] mt-2">Used by: Cassiopeia, Cepheus</p>
          </div>
          <div className="p-4 bg-[var(--color-bg-card)] border-2 border-[var(--color-purple)] rounded">
            <h3 className="font-pixel text-[var(--color-purple)] mb-2">Azimuthal Equidistant</h3>
            <p className="text-sm font-pixel text-gray-300">Circumpolar (RA {'>'} 90° at high dec or {'>'} 70° dec)</p>
            <p className="text-xs font-pixel text-gray-500 mt-1">Polar projection for constellations wrapping around pole</p>
            <p className="text-xs font-pixel text-[var(--color-purple)] mt-2">Used by: Draco, Ursa Minor</p>
          </div>
        </div>

        {/* Projection Visualization Section */}
        <div className="border-4 border-[var(--color-accent)] rounded-lg p-6 bg-[var(--color-bg-card)]">
          <h2 className="text-2xl font-pixel text-[var(--color-accent)] mb-4 text-center">
            🔬 d3-geo Projection Visualization
          </h2>
          <p className="text-sm font-pixel text-gray-300 mb-6 text-center">
            Dual view of d3-geo projections (same projection shown in different colors for visual reference)
          </p>
          
          {/* Cygnus Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Cygnus (The Swan) - Mean Dec: {cygnusInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Cygnus"
              stars={cygnus.stars}
              lines={cygnus.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Mid-latitude constellation:</strong> Cygnus spans ~40° declination with significant RA range.
                The d3-geo equirectangular projection handles the spherical geometry correctly, producing accurate star positions.
              </p>
            </div>
          </div>

          {/* Orion Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Orion (The Hunter) - Mean Dec: {orionInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Orion"
              stars={orion.stars}
              lines={orion.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Equatorial constellation:</strong> Orion is near the celestial equator (~0° dec).
                The equirectangular projection works well for equatorial regions.
              </p>
            </div>
          </div>

          {/* Ursa Major Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Ursa Major (Big Dipper) - Mean Dec: {ursaMajorInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Ursa Major"
              stars={ursaMajor.stars}
              lines={ursaMajor.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">High-latitude constellation:</strong> Ursa Major at ~56° dec demonstrates how d3-geo
                handles spherical geometry at higher latitudes, properly accounting for RA compression.
              </p>
            </div>
          </div>

          {/* Scorpius Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Scorpius (The Scorpion) - Mean Dec: {scorpiusInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Scorpius"
              stars={scorpius.stars}
              lines={scorpius.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Southern hemisphere constellation:</strong> Scorpius at ~-30° dec demonstrates
                d3-geo projection handling of southern sky coordinates.
              </p>
            </div>
          </div>

          {/* Cassiopeia Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Cassiopeia (The Queen) - Mean Dec: {cassiopeiaInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Cassiopeia"
              stars={cassiopeia.stars}
              lines={cassiopeia.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Compact high-latitude constellation:</strong> Cassiopeia at ~60° dec with narrow RA range
                uses d3-geo stereographic projection for optimal rendering.
              </p>
            </div>
          </div>

          {/* Cepheus Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Cepheus (The King) - Mean Dec: {cepheusInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Cepheus"
              stars={cepheus.stars}
              lines={cepheus.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Very high-latitude constellation:</strong> Cepheus at ~65° dec with one star at +77°
                uses d3-geo azimuthal equidistant projection due to the extreme declination.
              </p>
            </div>
          </div>

          {/* Draco Comparison */}
          <div className="mb-8">
            <h3 className="text-xl font-pixel text-white mb-4">
              Draco (The Dragon) - Mean Dec: {dracoInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Draco"
              stars={draco.stars}
              lines={draco.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Circumpolar constellation:</strong> Draco at ~61° dec with 96° RA span wraps around the pole.
                Uses d3-geo azimuthal equidistant projection for accurate circumpolar rendering.
              </p>
            </div>
          </div>

          {/* Ursa Minor Comparison */}
          <div>
            <h3 className="text-xl font-pixel text-white mb-4">
              Ursa Minor (Little Dipper) - Mean Dec: {ursaMinorInfo.meanDec}°
            </h3>
            <ConstellationComparison
              name="Ursa Minor"
              stars={ursaMinor.stars}
              lines={ursaMinor.lines}
              canvasSize={400}
            />
            <div className="mt-4 p-4 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-xs text-gray-400">
                <strong className="text-[var(--color-accent)]">Polar constellation:</strong> Ursa Minor at ~81° dec includes Polaris at +89°.
                Uses d3-geo azimuthal equidistant projection centered on the pole for accurate polar rendering.
              </p>
            </div>
          </div>
        </div>

        {/* Test Constellations */}
        <div className="space-y-8">
          <div className="border-4 border-[var(--color-primary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{orionInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{orionInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...orion} />
          </div>

          <div className="border-4 border-[var(--color-primary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{ursaMajorInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{ursaMajorInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...ursaMajor} />
          </div>

          <div className="border-4 border-[var(--color-purple)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{dracoInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{dracoInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...draco} />
          </div>

          <div className="border-4 border-[var(--color-purple)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{ursaMinorInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{ursaMinorInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...ursaMinor} />
          </div>

          <div className="border-4 border-[var(--color-secondary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{cassiopeiaInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{cassiopeiaInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...cassiopeia} />
          </div>

          <div className="border-4 border-[var(--color-secondary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{cepheusInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{cepheusInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...cepheus} />
          </div>

          <div className="border-4 border-[var(--color-primary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{cygnusInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{cygnusInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...cygnus} />
          </div>

          <div className="border-4 border-[var(--color-primary)] rounded-lg p-4">
            <div className="mb-4 p-3 bg-[var(--color-bg-darker)] rounded">
              <p className="font-pixel text-sm text-[var(--color-accent)]">
                Projection: <span className="text-white">{scorpiusInfo.projection}</span>
              </p>
              <p className="font-pixel text-sm text-[var(--color-secondary)]">
                Mean Declination: <span className="text-white">{scorpiusInfo.meanDec}°</span>
              </p>
            </div>
            <Constellation {...scorpius} />
          </div>
        </div>

        <div className="text-center p-6 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] rounded">
          <h3 className="font-pixel text-lg text-[var(--color-accent)] mb-3">
            ✓ Comprehensive Projection Test Coverage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <p className="font-pixel text-sm text-[var(--color-accent)] mb-2">Equirectangular (4)</p>
              <p className="font-pixel text-xs text-gray-300">• Orion (~0° dec)</p>
              <p className="font-pixel text-xs text-gray-300">• Ursa Major (~56° dec)</p>
              <p className="font-pixel text-xs text-gray-300">• Cygnus (~40° dec)</p>
              <p className="font-pixel text-xs text-gray-300">• Scorpius (~-30° dec)</p>
            </div>
            <div>
              <p className="font-pixel text-sm text-[var(--color-secondary)] mb-2">Stereographic (1-2)</p>
              <p className="font-pixel text-xs text-gray-300">• Cassiopeia (~60° dec, compact)</p>
              <p className="font-pixel text-xs text-gray-300">• Cepheus (~65° dec, may use azimuthal due to Errai at +77°)</p>
            </div>
            <div>
              <p className="font-pixel text-sm text-[var(--color-purple)] mb-2">Azimuthal Equidistant (2)</p>
              <p className="font-pixel text-xs text-gray-300">• Draco (~61° dec, 96° RA span)</p>
              <p className="font-pixel text-xs text-gray-300">• Ursa Minor (~81° dec, polar)</p>
            </div>
          </div>
          <p className="font-pixel text-xs text-gray-400 mt-4">
            Testing 8 constellations across all declination zones: equatorial, mid-latitude (north & south), high-latitude compact, circumpolar, and polar
          </p>
          <p className="font-pixel text-xs text-[var(--color-accent)] mt-2">
            Projection logic: Equirectangular (0-60°) → Stereographic (60-70° compact) → Azimuthal (circumpolar/polar)
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
