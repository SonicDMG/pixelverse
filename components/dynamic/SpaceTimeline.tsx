'use client';

interface SpaceTimelineProps {
  title: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
    type?: 'mission' | 'discovery' | 'observation';
  }>;
}

export default function SpaceTimeline({ title, events }: SpaceTimelineProps) {
  // Helper to get event type styling
  const getEventTypeStyle = (type?: string) => {
    switch (type) {
      case 'mission':
        return {
          icon: '🚀',
          color: 'border-[#00CED1] bg-[#00CED1]/10',
          dotColor: 'bg-[#00CED1]',
          textColor: 'text-[#00CED1]',
        };
      case 'discovery':
        return {
          icon: '🔭',
          color: 'border-[#FFD700] bg-[#FFD700]/10',
          dotColor: 'bg-[#FFD700]',
          textColor: 'text-[#FFD700]',
        };
      case 'observation':
        return {
          icon: '👁️',
          color: 'border-[#9370DB] bg-[#9370DB]/10',
          dotColor: 'bg-[#9370DB]',
          textColor: 'text-[#9370DB]',
        };
      default:
        return {
          icon: '⭐',
          color: 'border-[#4169E1] bg-[#4169E1]/10',
          dotColor: 'bg-[#4169E1]',
          textColor: 'text-[#4169E1]',
        };
    }
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-4 border-[#4169E1] rounded-lg pixel-border scanline-container">
      {/* Timeline Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-pixel text-[#4169E1] glow-text uppercase tracking-wider flex items-center gap-3">
          <span className="text-[#00CED1]">⏱️</span>
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-gradient-to-r from-[#4169E1] to-transparent"></div>
      </div>

      {/* Timeline Events */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#4169E1] via-[#9370DB] to-[#4169E1] opacity-50"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const style = getEventTypeStyle(event.type);
            const isLast = index === events.length - 1;

            return (
              <div key={index} className="relative pl-16 group">
                {/* Timeline dot and icon */}
                <div className="absolute left-0 flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full ${style.color} border-2 flex items-center justify-center z-10 group-hover:scale-110 transition-transform`}
                  >
                    <span className="text-2xl">{style.icon}</span>
                  </div>
                  {/* Connecting dot on timeline */}
                  <div
                    className={`absolute left-[22px] w-2 h-2 rounded-full ${style.dotColor} animate-pulse`}
                  ></div>
                </div>

                {/* Event content */}
                <div
                  className={`p-4 bg-[#0a0e27] border-2 ${style.color.split(' ')[0]} rounded-lg pixel-border hover:border-opacity-100 transition-all group-hover:translate-x-1`}
                >
                  {/* Date and Type */}
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className={`font-pixel text-xs ${style.textColor} uppercase tracking-wide`}>
                      {event.date}
                    </div>
                    {event.type && (
                      <div className={`px-2 py-1 ${style.color} border rounded text-xs font-pixel ${style.textColor} uppercase`}>
                        {event.type}
                      </div>
                    )}
                  </div>

                  {/* Event Title */}
                  <h3 className="text-lg font-pixel text-white glow-text mb-2">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="font-pixel text-xs text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Connecting line to next event (if not last) */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 bg-gradient-to-b from-transparent via-[#4169E1] to-transparent opacity-30"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline end marker */}
        <div className="relative pl-16 mt-6">
          <div className="absolute left-0 flex items-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#4169E1] bg-[#0a0e27] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#4169E1] animate-pulse"></div>
            </div>
          </div>
          <div className="p-3 bg-[#0a0e27]/50 border border-[#4169E1]/30 rounded pixel-border">
            <p className="font-pixel text-xs text-[#4169E1] italic">
              Timeline continues...
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t-2 border-[#4169E1]/30">
        <div className="flex flex-wrap gap-4 justify-center text-xs font-pixel">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <span className="text-[#00CED1]">Mission</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔭</span>
            <span className="text-[#FFD700]">Discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            <span className="text-[#9370DB]">Observation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob