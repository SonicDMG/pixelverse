'use client';

import { useState } from 'react';
import { 
  raToDecimalDegrees, 
  decToDecimalDegrees,
  calculateConstellationBounds,
  convertStarsToCanvasWithProjection,
  type CelestialCoordinate
} from '@/utils/space/celestial-coordinates';

export default function TestCoordinateDebugPage() {
  // Test data for three constellations
  const constellations = {
    bigDipper: {
      name: "Big Dipper (Ursa Major)",
      stars: [
        { name: "Dubhe", ra: "11h 4m", dec: "+61° 45'" },
        { name: "Merak", ra: "11h 2m", dec: "+56° 23'" },
        { name: "Phecda", ra: "11h 54m", dec: "+53° 42'" },
        { name: "Megrez", ra: "12h 15m", dec: "+57° 2'" },
        { name: "Alioth", ra: "12h 54m", dec: "+55° 58'" },
        { name: "Mizar", ra: "13h 24m", dec: "+54° 56'" },
        { name: "Alkaid", ra: "13h 48m", dec: "+49° 19'" },
      ]
    },
    cygnus: {
      name: "Cygnus (The Swan)",
      stars: [
        { name: "Deneb", ra: "20h 41m", dec: "+45° 17'" },
        { name: "Sadr", ra: "20h 22m", dec: "+40° 15'" },
        { name: "Gienah", ra: "20h 46m", dec: "+33° 58'" },
        { name: "Delta Cygni", ra: "19h 45m", dec: "+45° 8'" },
        { name: "Albireo", ra: "19h 31m", dec: "+27° 58'" },
      ]
    },
    orion: {
      name: "Orion (The Hunter)",
      stars: [
        { name: "Betelgeuse", ra: "5h 55m", dec: "+7° 24'" },
        { name: "Rigel", ra: "5h 14m", dec: "-8° 12'" },
        { name: "Bellatrix", ra: "5h 25m", dec: "+6° 21'" },
        { name: "Alnitak", ra: "5h 41m", dec: "-1° 57'" },
        { name: "Alnilam", ra: "5h 36m", dec: "-1° 12'" },
        { name: "Mintaka", ra: "5h 32m", dec: "-0° 18'" },
      ]
    }
  };

  const [selectedConstellation, setSelectedConstellation] = useState<keyof typeof constellations>('bigDipper');
  
  const constellation = constellations[selectedConstellation];
  const stars = constellation.stars as CelestialCoordinate[];
  
  // Convert coordinates
  const result = convertStarsToCanvasWithProjection(stars, 400, 50);
  const { coordinates, projectionType, bounds } = result;

  // Calculate decimal degrees for display
  const starsWithDecimal = constellation.stars.map((star, i) => ({
    name: star.name,
    ra: star.ra,
    dec: star.dec,
    raDeg: raToDecimalDegrees(star.ra),
    decDeg: decToDecimalDegrees(star.dec),
    x: coordinates[i].x,
    y: coordinates[i].y,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-pixel text-[#FFD700] glow-text uppercase tracking-wider">
            Coordinate Conversion Debug
          </h1>
          <p className="text-lg font-pixel text-[#00CED1]">
            Analyzing RA/Dec to Canvas Coordinate Transformation
          </p>
        </div>

        {/* Constellation Selector */}
        <div className="flex justify-center gap-4">
          {(Object.keys(constellations) as Array<keyof typeof constellations>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedConstellation(key)}
              className={`px-6 py-3 font-pixel text-sm uppercase rounded pixel-border transition-colors ${
                selectedConstellation === key
                  ? 'bg-[#4169E1] text-white border-2 border-[#FFD700]'
                  : 'bg-[#1a1f3a] text-gray-300 border-2 border-[#4169E1] hover:bg-[#4169E1]'
              }`}
            >
              {constellations[key].name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Projection Info */}
        <div className="p-6 bg-[#1a1f3a] border-2 border-[#9370DB] rounded-lg pixel-border">
          <h2 className="text-xl font-pixel text-[#9370DB] mb-4 uppercase">
            Projection Analysis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-pixel text-sm">
            <div>
              <div className="text-gray-400">Projection Type:</div>
              <div className="text-[#00CED1] font-bold">{projectionType}</div>
            </div>
            <div>
              <div className="text-gray-400">RA Range:</div>
              <div className="text-white">{bounds.raMin.toFixed(2)}° - {bounds.raMax.toFixed(2)}°</div>
            </div>
            <div>
              <div className="text-gray-400">Dec Range:</div>
              <div className="text-white">{bounds.decMin.toFixed(2)}° - {bounds.decMax.toFixed(2)}°</div>
            </div>
            <div>
              <div className="text-gray-400">Mean Dec:</div>
              <div className="text-white">{((bounds.decMin + bounds.decMax) / 2).toFixed(2)}°</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6 bg-[#1a1f3a] border-2 border-[#4169E1] rounded-lg pixel-border overflow-x-auto">
          <h2 className="text-xl font-pixel text-[#4169E1] mb-4 uppercase">
            Star Coordinates
          </h2>
          <table className="w-full font-pixel text-xs">
            <thead>
              <tr className="text-[#FFD700] border-b-2 border-[#4169E1]">
                <th className="text-left p-2">Star</th>
                <th className="text-right p-2">RA (HMS)</th>
                <th className="text-right p-2">RA (deg)</th>
                <th className="text-right p-2">Dec (DMS)</th>
                <th className="text-right p-2">Dec (deg)</th>
                <th className="text-right p-2">Canvas X</th>
                <th className="text-right p-2">Canvas Y</th>
              </tr>
            </thead>
            <tbody>
              {starsWithDecimal.map((star, i) => (
                <tr key={i} className="border-b border-[#4169E1]/30 hover:bg-[#4169E1]/10">
                  <td className="text-white p-2">{star.name}</td>
                  <td className="text-[#00CED1] text-right p-2">{star.ra}</td>
                  <td className="text-[#00CED1] text-right p-2">{star.raDeg.toFixed(2)}°</td>
                  <td className="text-[#9370DB] text-right p-2">{star.dec}</td>
                  <td className="text-[#9370DB] text-right p-2">{star.decDeg.toFixed(2)}°</td>
                  <td className="text-[#FFD700] text-right p-2">{star.x}</td>
                  <td className="text-[#FFD700] text-right p-2">{star.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas Visualization */}
          <div className="p-6 bg-[#1a1f3a] border-2 border-[#4169E1] rounded-lg pixel-border">
            <h3 className="text-lg font-pixel text-[#4169E1] mb-4 uppercase">
              Canvas Coordinates
            </h3>
            <div className="bg-[#0a0e27] border-2 border-[#4169E1]/30 rounded-lg p-4">
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                {/* Grid lines */}
                {[0, 100, 200, 300, 400].map(pos => (
                  <g key={pos}>
                    <line x1={pos} y1={0} x2={pos} y2={400} stroke="#4169E1" strokeWidth="0.5" opacity="0.2" />
                    <line x1={0} y1={pos} x2={400} y2={pos} stroke="#4169E1" strokeWidth="0.5" opacity="0.2" />
                  </g>
                ))}
                
                {/* Stars */}
                {starsWithDecimal.map((star, i) => (
                  <g key={i}>
                    <circle
                      cx={star.x}
                      cy={star.y}
                      r={6}
                      fill="#FFD700"
                      stroke="#FFF"
                      strokeWidth="1"
                    />
                    <text
                      x={star.x}
                      y={star.y - 10}
                      textAnchor="middle"
                      fill="#00CED1"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {star.name}
                    </text>
                    <text
                      x={star.x}
                      y={star.y + 20}
                      textAnchor="middle"
                      fill="#9370DB"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      ({star.x}, {star.y})
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Sky Position Visualization */}
          <div className="p-6 bg-[#1a1f3a] border-2 border-[#9370DB] rounded-lg pixel-border">
            <h3 className="text-lg font-pixel text-[#9370DB] mb-4 uppercase">
              Celestial Coordinates
            </h3>
            <div className="bg-[#0a0e27] border-2 border-[#9370DB]/30 rounded-lg p-4">
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                {/* Simple RA/Dec grid */}
                {starsWithDecimal.map((star, i) => {
                  // Simple linear mapping for comparison
                  const x = ((star.raDeg - bounds.raMin) / (bounds.raMax - bounds.raMin)) * 300 + 50;
                  const y = 350 - ((star.decDeg - bounds.decMin) / (bounds.decMax - bounds.decMin)) * 300;
                  
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={6}
                        fill="#9370DB"
                        stroke="#FFF"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#00CED1"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {star.name}
                      </text>
                      <text
                        x={x}
                        y={y + 20}
                        textAnchor="middle"
                        fill="#FFD700"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        RA:{star.raDeg.toFixed(1)}° Dec:{star.decDeg.toFixed(1)}°
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-xs font-pixel text-gray-400 mt-2 italic">
              * Simple linear mapping (no projection) for comparison
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/"
            className="px-6 py-3 bg-[#4169E1] hover:bg-[#9370DB] text-white font-pixel text-sm uppercase rounded pixel-border transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// Made with Bob