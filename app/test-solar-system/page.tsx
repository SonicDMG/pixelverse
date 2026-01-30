'use client';

import { useState } from 'react';
import { DynamicUIRenderer } from '@/components/DynamicUIRenderer';
import mockResponse from './mock-response.json';

export default function TestSolarSystemPage() {
  const [showMock, setShowMock] = useState(true);
  const [clickedQuestion, setClickedQuestion] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-pixel text-[#FFD700] glow-text mb-4">
            🌌 SOLAR SYSTEM COMPONENT TEST
          </h1>
          <p className="text-sm font-pixel text-gray-400 mb-4">
            Testing three preset configurations + one custom configuration of the SolarSystem component
          </p>
          <button
            onClick={() => setShowMock(!showMock)}
            className="px-4 py-2 bg-[#4169E1] hover:bg-[#00CED1] text-white font-pixel text-sm rounded pixel-border transition-colors"
          >
            {showMock ? 'Hide' : 'Show'} All Presets
          </button>
        </div>

        {/* Clicked Body Question Display */}
        {clickedQuestion && (
          <div className="p-6 bg-[#1a1f3a] border-2 border-[#FFD700] rounded-lg pixel-border">
            <h2 className="text-xl font-pixel text-[#FFD700] mb-3 uppercase">
              🪐 Body Click Demo:
            </h2>
            <p className="font-pixel text-sm text-gray-300 leading-relaxed">
              Question generated: <span className="text-[#00CED1]">{clickedQuestion}</span>
            </p>
            <p className="font-pixel text-xs text-gray-400 mt-2">
              (In the main app, this would populate the question input and you could submit it)
            </p>
          </div>
        )}

        {/* Mock Response Display */}
        {showMock && (
          <div className="space-y-6">
            {/* Agent Text Response */}
            <div className="p-6 bg-[#1a1f3a] border-2 border-[#4169E1] rounded-lg pixel-border">
              <h2 className="text-lg font-pixel text-[#00CED1] mb-3">
                🤖 Agent Response:
              </h2>
              <p className="font-pixel text-sm text-gray-300 leading-relaxed">
                {mockResponse.text}
              </p>
            </div>

            {/* Rendered Components */}
            <div className="space-y-6">
              <h2 className="text-lg font-pixel text-[#00CED1]">
                📊 Rendered Components:
              </h2>
              <DynamicUIRenderer
                components={mockResponse.components as any}
                onSetQuestion={setClickedQuestion}
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 p-6 bg-[#1a1f3a]/50 border-2 border-[#9370DB]/30 rounded-lg pixel-border">
          <h3 className="text-md font-pixel text-[#9370DB] mb-3">
            📝 How to Test:
          </h3>
          <ul className="space-y-2 text-sm font-pixel text-gray-400">
            <li>• <strong className="text-[#00CED1]">Solar System:</strong> Click any planet to view details and generate a question, see all 8 planets orbiting the Sun</li>
            <li>• <strong className="text-[#00CED1]">Galilean Moons:</strong> Explore Jupiter's four largest moons with FIXED orbital speeds (no longer too fast!)</li>
            <li>• <strong className="text-[#00CED1]">Milky Way:</strong> View our galaxy's structure with Sagittarius A* at the center</li>
            <li>• <strong className="text-[#00CED1]">Earth-Moon System (Custom):</strong> NEW FEATURES demonstration!</li>
            <li>• <strong className="text-[#FFD700]">NEW - Elliptical Orbits:</strong> Earth, Mars, and Moon now show realistic elliptical orbits (not perfect circles)</li>
            <li>• <strong className="text-[#FFD700]">NEW - Nested Satellites:</strong> Moon orbits Earth, Phobos & Deimos orbit Mars (satellites of satellites!)</li>
            <li>• <strong className="text-[#FFD700]">NEW - Fixed Moon Speeds:</strong> Moons now orbit at realistic visual speeds relative to planets</li>
            <li>• Click any celestial body to generate a "Tell me about..." question</li>
            <li>• The detail card will remain visible when you click a body</li>
            <li>• Use Play/Pause to control the animation</li>
            <li>• Adjust speed from 1x to 1000x</li>
            <li>• Click Reset to return to day 0</li>
            <li>• Hover over celestial bodies to see glow effects</li>
            <li>• Check browser console for custom preset validation logs</li>
          </ul>
        </div>

        {/* Mock JSON Display */}
        <details className="p-6 bg-[#0a0e27] border-2 border-[#4169E1]/30 rounded-lg pixel-border">
          <summary className="font-pixel text-sm text-[#4169E1] cursor-pointer hover:text-[#00CED1]">
            📄 View Mock Response JSON
          </summary>
          <pre className="mt-4 p-4 bg-black/50 rounded text-xs text-green-400 overflow-x-auto">
            {JSON.stringify(mockResponse, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Made with Bob
