'use client';

import { SpaceTimeline } from '@/components/dynamic/SpaceTimeline';

export default function TestTimelinePage() {
  const testEvents = [
    {
      date: "1957-10-04",
      title: "Sputnik 1",
      description: "First artificial satellite launched by Soviet Union",
      type: "mission" as const,
    },
    {
      date: "1957-11-03",
      title: "Sputnik 2",
      description: "First animal in orbit (Laika the dog)",
      type: "mission" as const,
    },
    {
      date: "1958-01-31",
      title: "Explorer 1",
      description: "First U.S. satellite discovers Van Allen radiation belts",
      type: "discovery" as const,
    },
    {
      date: "1961-04-12",
      title: "Yuri Gagarin",
      description: "First human in space",
      type: "mission" as const,
    },
    {
      date: "1961-05-05",
      title: "Alan Shepard",
      description: "First American in space",
      type: "mission" as const,
    },
    {
      date: "1962-02-20",
      title: "John Glenn",
      description: "First American to orbit Earth",
      type: "mission" as const,
    },
    {
      date: "1963-06-16",
      title: "Valentina Tereshkova",
      description: "First woman in space",
      type: "mission" as const,
    },
    {
      date: "1965-03-18",
      title: "First Spacewalk",
      description: "Alexei Leonov performs first EVA",
      type: "mission" as const,
    },
    {
      date: "1968-12-21",
      title: "Apollo 8",
      description: "First crewed mission to orbit the Moon",
      type: "mission" as const,
    },
    {
      date: "1969-07-20",
      title: "Apollo 11",
      description: "First humans land on the Moon",
      type: "mission" as const,
    },
    {
      date: "1969-11-19",
      title: "Apollo 12",
      description: "Second Moon landing",
      type: "mission" as const,
    },
    {
      date: "1970-04-11",
      title: "Apollo 13",
      description: "Successful failure - crew returns safely after explosion",
      type: "mission" as const,
    },
    {
      date: "1971-02-05",
      title: "Apollo 14",
      description: "Third Moon landing",
      type: "mission" as const,
    },
    {
      date: "1971-07-30",
      title: "Apollo 15",
      description: "Fourth Moon landing with lunar rover",
      type: "mission" as const,
    },
    {
      date: "1972-04-16",
      title: "Apollo 16",
      description: "Fifth Moon landing",
      type: "mission" as const,
    },
    {
      date: "1972-12-11",
      title: "Apollo 17",
      description: "Final Apollo Moon landing",
      type: "mission" as const,
    },
    {
      date: "1973-05-14",
      title: "Skylab",
      description: "First U.S. space station launched",
      type: "mission" as const,
    },
    {
      date: "1975-07-17",
      title: "Apollo-Soyuz",
      description: "First international space mission",
      type: "mission" as const,
    },
    {
      date: "1981-04-12",
      title: "STS-1",
      description: "First Space Shuttle mission",
      type: "mission" as const,
    },
    {
      date: "1986-01-28",
      title: "Challenger Disaster",
      description: "Space Shuttle Challenger breaks apart",
      type: "mission" as const,
    },
    {
      date: "1990-04-24",
      title: "Hubble Launch",
      description: "Hubble Space Telescope deployed",
      type: "observation" as const,
    },
    {
      date: "1998-11-20",
      title: "ISS Construction Begins",
      description: "First ISS module Zarya launched",
      type: "mission" as const,
    },
    {
      date: "2000-11-02",
      title: "ISS Permanently Crewed",
      description: "First permanent crew arrives at ISS",
      type: "mission" as const,
    },
    {
      date: "2003-02-01",
      title: "Columbia Disaster",
      description: "Space Shuttle Columbia breaks apart on reentry",
      type: "mission" as const,
    },
    {
      date: "2004-01-04",
      title: "Spirit Rover",
      description: "Mars rover Spirit lands on Mars",
      type: "mission" as const,
    },
    {
      date: "2004-01-25",
      title: "Opportunity Rover",
      description: "Mars rover Opportunity lands on Mars",
      type: "mission" as const,
    },
    {
      date: "2011-07-21",
      title: "Final Shuttle Mission",
      description: "Space Shuttle Atlantis completes final mission",
      type: "mission" as const,
    },
    {
      date: "2012-08-06",
      title: "Curiosity Rover",
      description: "Mars Science Laboratory lands on Mars",
      type: "mission" as const,
    },
    {
      date: "2015-07-14",
      title: "New Horizons at Pluto",
      description: "First spacecraft to visit Pluto",
      type: "mission" as const,
    },
    {
      date: "2019-04-10",
      title: "First Black Hole Image",
      description: "Event Horizon Telescope captures M87 black hole",
      type: "discovery" as const,
    },
    {
      date: "2020-05-30",
      title: "SpaceX Demo-2",
      description: "First commercial crew mission to ISS",
      type: "mission" as const,
    },
    {
      date: "2021-02-18",
      title: "Perseverance Rover",
      description: "Mars 2020 rover lands in Jezero Crater",
      type: "mission" as const,
    },
    {
      date: "2021-12-25",
      title: "James Webb Launch",
      description: "James Webb Space Telescope launched",
      type: "observation" as const,
    },
    {
      date: "2022-07-12",
      title: "Webb First Images",
      description: "JWST releases first deep field images",
      type: "observation" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-pixel text-[var(--color-primary)] glow-text uppercase mb-4">
            SpaceTimeline Test Page
          </h1>
          <p className="text-sm font-pixel text-gray-400">
            Testing zoom, pan, and click interactions on horizontal timeline
          </p>
        </div>

        {/* Horizontal Timeline with Zoom/Pan */}
        <div>
          <h2 className="text-2xl font-pixel text-[var(--color-secondary)] mb-4">
            Interactive Space Exploration Timeline
          </h2>
          <SpaceTimeline
            title="Space Exploration Timeline"
            events={testEvents}
            layout="horizontal"
            scaleType="linear"
            showTimeAxis={true}
            showRelativeTime={true}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] rounded-lg pixel-border">
          <h3 className="text-xl font-pixel text-[var(--color-accent)] mb-4">
            🎮 Test Instructions
          </h3>
          <ul className="space-y-2 font-pixel text-sm text-gray-300">
            <li>🔒 <strong>Zoom Lock:</strong> Click the lock button to enable/disable mouse wheel zoom</li>
            <li>🔍 <strong>Zoom:</strong> Use mouse wheel (when unlocked) or +/− buttons to zoom</li>
            <li>👆 <strong>Pan:</strong> Click and drag to pan through the timeline</li>
            <li>🖱️ <strong>Hover:</strong> Hover over events to see preview details</li>
            <li>👆 <strong>Click:</strong> Click events to expand and see full details</li>
            <li>✕ <strong>Close:</strong> Click the X button, click event again, or click outside to close</li>
            <li>↺ <strong>Reset:</strong> Click reset button to return to default view</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
