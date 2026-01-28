'use client';

import { useState } from 'react';
import { DynamicUIRenderer } from '@/components/DynamicUIRenderer';
import { UIResponse } from '@/types/ui-spec';
import mockResponse from './mock-response.json';

export default function TestConstellationPage() {
  const [response] = useState<UIResponse>(mockResponse as UIResponse);
  const [clickedQuestion, setClickedQuestion] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-pixel text-[#FFD700] glow-text uppercase tracking-wider">
            Constellation Component Test
          </h1>
          <p className="text-lg font-pixel text-[#00CED1]">
            Testing the Orion Constellation Visualization
          </p>
          <div className="flex justify-center gap-2 text-sm font-pixel text-gray-400">
            <span>★</span>
            <span>Mock Data Preview</span>
            <span>★</span>
          </div>
        </div>

        {/* Response Text */}
        <div className="p-6 bg-[#1a1f3a] border-2 border-[#4169E1] rounded-lg pixel-border">
          <h2 className="text-xl font-pixel text-[#4169E1] mb-3 uppercase">
            AI Response:
          </h2>
          <p className="font-pixel text-sm text-gray-300 leading-relaxed">
            {response.text}
          </p>
        </div>

        {/* Clicked Star Question Display */}
        {clickedQuestion && (
          <div className="p-6 bg-[#1a1f3a] border-2 border-[#FFD700] rounded-lg pixel-border">
            <h2 className="text-xl font-pixel text-[#FFD700] mb-3 uppercase">
              Star Click Demo:
            </h2>
            <p className="font-pixel text-sm text-gray-300 leading-relaxed">
              Question generated: <span className="text-[#00CED1]">{clickedQuestion}</span>
            </p>
            <p className="font-pixel text-xs text-gray-400 mt-2">
              (In the main app, this would populate the question input and you could submit it)
            </p>
          </div>
        )}

        {/* Dynamic UI Components */}
        <div className="space-y-6">
          <h2 className="text-2xl font-pixel text-[#9370DB] uppercase tracking-wide flex items-center gap-3">
            <span>✦</span>
            <span>Rendered Components</span>
            <span>✦</span>
          </h2>
          <DynamicUIRenderer
            components={response.components || []}
            onSetQuestion={setClickedQuestion}
          />
        </div>

        {/* Info Box */}
        <div className="p-6 bg-[#0a0e27] border-2 border-[#9370DB]/30 rounded-lg pixel-border">
          <h3 className="text-lg font-pixel text-[#9370DB] mb-3 uppercase">
            About This Test
          </h3>
          <div className="space-y-2 text-sm font-pixel text-gray-400">
            <p>• This page demonstrates the Constellation component with Orion data</p>
            <p>• Star magnitudes are visually represented (lower = brighter)</p>
            <p>• Click on any star to generate a "Tell me about..." question</p>
            <p>• In the main app, clicking a star populates the question input</p>
            <p>• Hover effects and animations enhance the space theme</p>
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
          <a
            href="/test-solar-system"
            className="px-6 py-3 bg-[#1a1f3a] hover:bg-[#4169E1] text-white font-pixel text-sm uppercase rounded pixel-border border-2 border-[#4169E1] transition-colors"
          >
            View Solar System Test
          </a>
        </div>
      </div>
    </div>
  );
}

// Made with Bob