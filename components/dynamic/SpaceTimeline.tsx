'use client';

import React, { useMemo, useState } from 'react';
import { scaleTime, scaleLog } from 'd3-scale';

interface SpaceTimelineProps {
  title: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
    type?: 'mission' | 'discovery' | 'observation';
  }>;
  layout?: 'vertical' | 'horizontal';
  scaleType?: 'linear' | 'logarithmic';
  showTimeAxis?: boolean;
  showRelativeTime?: boolean;
  minHeight?: number;
}

interface ProcessedEvent {
  date: string;
  title: string;
  description: string;
  type?: 'mission' | 'discovery' | 'observation';
  parsedDate: Date;
  originalIndex: number;
  position: number;
  timeGap: string | null;
  paddedMinDate: Date;
  paddedMaxDate: Date;
  verticalOffset?: number;
  isAbove?: boolean;
  laneIndex?: number;
}

export default function SpaceTimeline({ 
  title, 
  events,
  layout = 'horizontal',
  scaleType = 'linear',
  showTimeAxis = true,
  showRelativeTime = true,
  minHeight = 600
}: SpaceTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const parseDate = (dateStr: string): Date => {
    // Try parsing as-is first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try year only (e.g., "1965")
    if (/^\d{4}$/.test(dateStr)) {
      return new Date(parseInt(dateStr), 0, 1);
    }

    // Try "Month Year" format (e.g., "July 1969")
    const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.findIndex(m =>
        m.toLowerCase().startsWith(monthYearMatch[1].toLowerCase())
      );
      if (monthIndex !== -1) {
        return new Date(parseInt(monthYearMatch[2]), monthIndex, 1);
      }
    }

    // Fallback to current date
    console.warn(`Could not parse date: ${dateStr}`);
    return new Date();
  };

  // Format time gap in human-readable form
  const formatTimeGap = (ms: number): string => {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365.25;

    if (years >= 1) {
      const y = Math.floor(years);
      const m = Math.floor((years - y) * 12);
      return m > 0 ? `${y}y ${m}mo` : `${y}y`;
    }
    if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months}mo`;
    }
    if (days >= 1) {
      return `${Math.floor(days)}d`;
    }
    if (hours >= 1) {
      return `${Math.floor(hours)}h`;
    }
    if (minutes >= 1) {
      return `${Math.floor(minutes)}m`;
    }
    return `${Math.floor(seconds)}s`;
  };

  // Process events with parsed dates and calculate temporal positions
  const processedEvents = useMemo(() => {
    const eventsWithDates = events.map((event, index) => ({
      ...event,
      parsedDate: parseDate(event.date),
      originalIndex: index
    }));

    // Sort by date
    eventsWithDates.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    // Calculate time scale
    const dates = eventsWithDates.map(e => e.parsedDate);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding to the time range (10% on each side)
    const timeRange = maxDate.getTime() - minDate.getTime();
    const paddedMinDate = new Date(minDate.getTime() - timeRange * 0.1);
    const paddedMaxDate = new Date(maxDate.getTime() + timeRange * 0.1);

    // Create scale based on type and layout
    let timeScale;
    const scaleRange = layout === 'horizontal' ? [0, 100] : [0, minHeight];
    
    if (scaleType === 'logarithmic' && timeRange > 0) {
      // For log scale, ensure we don't have zero or negative values
      const logMinTime = Math.max(1, minDate.getTime() - paddedMinDate.getTime() + 1);
      const logMaxTime = maxDate.getTime() - paddedMinDate.getTime() + logMinTime;
      timeScale = scaleLog()
        .domain([logMinTime, logMaxTime])
        .range(scaleRange);
    } else {
      timeScale = scaleTime()
        .domain([paddedMinDate, paddedMaxDate])
        .range(scaleRange);
    }

    // Calculate positions and time gaps
    return eventsWithDates.map((event, index) => {
      const position = scaleType === 'logarithmic'
        ? timeScale(event.parsedDate.getTime() - paddedMinDate.getTime() + (timeScale.domain()[0] as number))
        : timeScale(event.parsedDate);
      
      let timeGap = null;
      if (index > 0) {
        const prevDate = eventsWithDates[index - 1].parsedDate;
        const gapMs = event.parsedDate.getTime() - prevDate.getTime();
        timeGap = formatTimeGap(gapMs);
      }

      return {
        ...event,
        position,
        timeGap,
        paddedMinDate,
        paddedMaxDate
      };
    });
  }, [events, scaleType, minHeight, layout]);

  // Simple alternating vertical positioning - no overlap detection needed
  const eventsWithVerticalPositions = useMemo((): ProcessedEvent[] => {
    if (layout !== 'horizontal') return processedEvents;

    // Simple alternating pattern: even indices above, odd indices below
    return processedEvents.map((event, index): ProcessedEvent => {
      const isAbove = index % 2 === 0;
      const verticalOffset = isAbove ? -100 : 100;
      
      return {
        ...event,
        verticalOffset,
        isAbove,
        laneIndex: index % 2
      };
    });
  }, [processedEvents, layout]);

  // Generate time axis markers
  const timeAxisMarkers = useMemo(() => {
    if (!showTimeAxis || processedEvents.length === 0) return [];

    const minDate = processedEvents[0].parsedDate;
    const maxDate = processedEvents[processedEvents.length - 1].parsedDate;
    const timeRange = maxDate.getTime() - minDate.getTime();
    
    // Determine appropriate interval
    const years = timeRange / (365.25 * 24 * 60 * 60 * 1000);
    let interval: number;
    let format: (d: Date) => string;

    if (years > 100) {
      interval = 10 * 365.25 * 24 * 60 * 60 * 1000; // 10 years
      format = (d) => d.getFullYear().toString();
    } else if (years > 10) {
      interval = 365.25 * 24 * 60 * 60 * 1000; // 1 year
      format = (d) => d.getFullYear().toString();
    } else if (years > 1) {
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month
      format = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      interval = 24 * 60 * 60 * 1000; // 1 day
      format = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const markers: Array<{ date: Date; label: string; position: number }> = [];
    let currentTime = Math.ceil(minDate.getTime() / interval) * interval;

    while (currentTime <= maxDate.getTime()) {
      const date = new Date(currentTime);
      const position = processedEvents[0].position + 
        ((currentTime - minDate.getTime()) / timeRange) * 
        (processedEvents[processedEvents.length - 1].position - processedEvents[0].position);
      
      markers.push({
        date,
        label: format(date),
        position
      });
      
      currentTime += interval;
    }

    return markers;
  }, [processedEvents, showTimeAxis]);

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

  if (processedEvents.length === 0) {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-4 border-[#4169E1] rounded-lg pixel-border">
        <h2 className="text-2xl font-pixel text-[#4169E1] glow-text-subtle uppercase tracking-wider">
          {title}
        </h2>
        <p className="mt-4 font-pixel text-sm text-gray-400">No events to display</p>
      </div>
    );
  }

  // Render horizontal layout
  if (layout === 'horizontal') {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-4 border-[#4169E1] rounded-lg pixel-border scanline-container">
        {/* Timeline Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-pixel text-[#4169E1] glow-text-subtle uppercase tracking-wider flex items-center gap-3">
            <span className="text-[#00CED1]">⏱️</span>
            {title}
          </h2>
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-[#4169E1] to-transparent"></div>
          
          {/* Timeline info */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-pixel text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-[#00CED1]">📅</span>
              <span>{processedEvents.length} events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#FFD700]">⚡</span>
              <span>Scale: {scaleType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#9370DB]">↔️</span>
              <span>Scroll horizontally to explore</span>
            </div>
          </div>
        </div>

        {/* Horizontal Timeline Container */}
        <div className="relative w-full overflow-x-auto overflow-y-visible pb-4" style={{ minHeight: '400px' }}>
          <div className="relative" style={{ minWidth: 'max(200%, 1600px)', height: '400px' }}>
            
            {/* Horizontal timeline axis - centered exactly at 50% */}
            <div
              className="absolute left-0 right-0 h-3 bg-gradient-to-r from-[#4169E1] via-[#9370DB] to-[#00CED1] rounded-full shadow-[0_0_20px_rgba(65,105,225,0.5)]"
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10
              }}
            ></div>

            {/* Time axis markers - positioned below the centered timeline */}
            {showTimeAxis && timeAxisMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute flex flex-col items-start"
                style={{
                  left: `${marker.position}%`,
                  top: '50%',
                  transform: 'translateY(10px)'
                }}
              >
                <div className="w-0.5 h-4 bg-[#4169E1] opacity-50 mb-1"></div>
                <span
                  className="text-[10px] font-pixel text-[#4169E1] opacity-70 whitespace-nowrap"
                  style={{
                    transform: 'rotate(45deg)',
                    transformOrigin: 'top left',
                    marginLeft: '4px'
                  }}
                >
                  {marker.label}
                </span>
              </div>
            ))}

            {/* Events positioned with simple alternating pattern */}
            {eventsWithVerticalPositions.map((event, index) => {
              const style = getEventTypeStyle(event.type);
              const isHovered = hoveredIndex === index;
              const isAbove = event.isAbove ?? false;
              const verticalOffset = event.verticalOffset ?? 0;

              return (
                <React.Fragment key={index}>
                  {/* Connecting line - positioned independently, BEHIND timeline bar */}
                  <div
                    className={`absolute transition-all duration-300 ${isHovered ? 'opacity-80 w-1' : 'opacity-50 w-0.5'}`}
                    style={{
                      left: `${event.position}%`,
                      top: '50%',
                      height: '100px',
                      transform: isAbove
                        ? 'translate(-50%, -100%)' // Go UP from timeline
                        : 'translate(-50%, 0)', // Go DOWN from timeline
                      transformOrigin: isAbove ? 'bottom' : 'top',
                      background: isAbove
                        ? 'linear-gradient(to top, rgba(0, 206, 209, 0.8), transparent)'
                        : 'linear-gradient(to bottom, rgba(0, 206, 209, 0.8), transparent)',
                      boxShadow: '0 0 4px rgba(0, 206, 209, 0.5)',
                      zIndex: 5
                    }}
                  ></div>

                  {/* Timeline dot - positioned exactly ON the timeline bar */}
                  <div
                    className="absolute"
                    style={{
                      left: `${event.position}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 25
                    }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${style.dotColor} transition-all duration-300 ${
                        isHovered ? 'scale-125 animate-pulse' : ''
                      }`}
                      style={{
                        boxShadow: isHovered
                          ? '0 0 20px currentColor, 0 0 30px currentColor'
                          : '0 0 15px currentColor'
                      }}
                    ></div>
                  </div>

                  {/* Event card with enhanced visual hierarchy */}
                  <div
                    className="absolute group"
                    style={{
                      left: `${event.position}%`,
                      top: '50%',
                      transform: `translate(-50%, ${verticalOffset}px)`,
                      width: '220px',
                      zIndex: isHovered ? 50 : 15
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div
                      className={`bg-[#0a0e27] border-2 ${style.color.split(' ')[0]} rounded-lg pixel-border transition-all duration-300 relative ${
                        isHovered
                          ? 'border-opacity-100 scale-110 z-10 p-4'
                          : 'hover:border-opacity-100 group-hover:scale-102 p-3'
                      }`}
                      style={{
                        boxShadow: isHovered
                          ? `0 0 20px ${style.color.includes('00CED1') ? 'rgba(0, 206, 209, 0.3)' : style.color.includes('FFD700') ? 'rgba(255, 215, 0, 0.3)' : style.color.includes('9370DB') ? 'rgba(147, 112, 219, 0.3)' : 'rgba(65, 105, 225, 0.3)'}`
                          : 'none'
                      }}
                    >
                    {/* Arrow pointing to timeline */}
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                      style={{
                        [isAbove ? 'bottom' : 'top']: '-8px',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        [isAbove ? 'borderTop' : 'borderBottom']: `8px solid ${style.color.includes('00CED1') ? '#00CED1' : style.color.includes('FFD700') ? '#FFD700' : style.color.includes('9370DB') ? '#9370DB' : '#4169E1'}`
                      }}
                    />
                    {/* Compact view (default) */}
                    {!isHovered && (
                      <div className="flex flex-col items-center gap-2">
                        <h3 className="text-[11px] font-pixel text-white text-center leading-tight line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                    )}

                    {/* Expanded view (on hover) */}
                    {isHovered && (
                      <>
                        {/* Icon and Date */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{style.icon}</span>
                            <div className={`font-pixel text-xs ${style.textColor} uppercase tracking-wide`}>
                              {event.date}
                            </div>
                          </div>
                          {event.type && (
                            <div className={`px-2 py-1 ${style.color} border rounded text-[10px] font-pixel ${style.textColor} uppercase`}>
                              {event.type}
                            </div>
                          )}
                        </div>

                        {/* Event Title */}
                        <h3 className="text-sm font-pixel text-white mb-2 leading-tight">
                          {event.title}
                        </h3>

                        {/* Event Description */}
                        <p className="font-pixel text-[10px] text-gray-300 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Time gap indicator */}
                        {showRelativeTime && event.timeGap && (
                          <div className="mt-2 pt-2 border-t border-[#4169E1]/30">
                            <div className="flex items-center gap-2 text-[10px] font-pixel text-[#4169E1]">
                              <span>⏱️</span>
                              <span>+{event.timeGap}</span>
                            </div>
                          </div>
                        )}
                      </>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Timeline start marker - centered */}
            <div
              className="absolute left-0 transform -translate-x-1/2"
              style={{
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-6 h-6 rounded-full border-2 border-[#4169E1] bg-[#0a0e27] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#4169E1] animate-pulse"></div>
              </div>
            </div>

            {/* Timeline end marker - centered */}
            <div
              className="absolute right-0"
              style={{
                top: '50%',
                transform: 'translate(50%, -50%)'
              }}
            >
              <div className="w-6 h-6 rounded-full border-2 border-[#00CED1] bg-[#0a0e27] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#00CED1] animate-pulse"></div>
              </div>
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

        {/* Add custom styles for animations and effects */}
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  // Render vertical layout (original)
  return (
    <div className="w-full p-6 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border-4 border-[#4169E1] rounded-lg pixel-border scanline-container">
      {/* Timeline Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-pixel text-[#4169E1] glow-text-subtle uppercase tracking-wider flex items-center gap-3">
          <span className="text-[#00CED1]">⏱️</span>
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-gradient-to-r from-[#4169E1] to-transparent"></div>
        
        {/* Timeline info */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-pixel text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-[#00CED1]">📅</span>
            <span>{processedEvents.length} events</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#FFD700]">⚡</span>
            <span>Scale: {scaleType}</span>
          </div>
          {showTimeAxis && (
            <div className="flex items-center gap-2">
              <span className="text-[#9370DB]">📊</span>
              <span>Time axis enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative" style={{ minHeight: `${minHeight}px` }}>
        {/* Vertical timeline line with glow effect */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4169E1] via-[#9370DB] to-[#4169E1] opacity-50 glow-line"></div>

        {/* Time axis markers */}
        {showTimeAxis && timeAxisMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute left-0 flex items-center"
            style={{ top: `${marker.position}px` }}
          >
            <div className="w-4 h-0.5 bg-[#4169E1] opacity-50"></div>
            <span className="ml-2 text-[10px] font-pixel text-[#4169E1] opacity-70">
              {marker.label}
            </span>
          </div>
        ))}

        {/* Events with temporal positioning */}
        {processedEvents.map((event, index) => {
          const style = getEventTypeStyle(event.type);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="absolute left-0 right-0 pl-16 group"
              style={{ top: `${event.position}px` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Time gap indicator */}
              {showRelativeTime && event.timeGap && (
                <div className="absolute left-6 -top-6 transform -translate-x-1/2">
                  <div className="px-2 py-1 bg-[#0a0e27] border border-[#4169E1]/30 rounded text-[10px] font-pixel text-[#4169E1] whitespace-nowrap">
                    +{event.timeGap}
                  </div>
                  <div className="absolute left-1/2 top-full w-0.5 h-6 bg-gradient-to-b from-[#4169E1] to-transparent opacity-30 transform -translate-x-1/2"></div>
                </div>
              )}

              {/* Timeline dot and icon */}
              <div className="absolute left-0 flex items-center">
                <div
                  className={`w-12 h-12 rounded-full ${style.color} border-2 flex items-center justify-center z-10 transition-all duration-300 ${
                    isHovered ? 'scale-125 shadow-lg shadow-current' : 'group-hover:scale-110'
                  }`}
                >
                  <span className="text-2xl">{style.icon}</span>
                </div>
                {/* Connecting dot on timeline */}
                <div
                  className={`absolute left-[22px] w-2 h-2 rounded-full ${style.dotColor} ${
                    isHovered ? 'animate-ping' : 'animate-pulse'
                  }`}
                ></div>
              </div>

              {/* Event content */}
              <div
                className={`p-4 bg-[#0a0e27] border-2 ${style.color.split(' ')[0]} rounded-lg pixel-border transition-all duration-300 ${
                  isHovered
                    ? 'border-opacity-100 translate-x-2 shadow-lg shadow-current/20'
                    : 'hover:border-opacity-100 group-hover:translate-x-1'
                }`}
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
                <h3 className="text-lg font-pixel text-white mb-2">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="font-pixel text-xs text-gray-300 leading-relaxed">
                  {event.description}
                </p>

                {/* Expanded details on hover */}
                {isHovered && event.timeGap && (
                  <div className="mt-3 pt-3 border-t border-[#4169E1]/30">
                    <div className="flex items-center gap-2 text-[10px] font-pixel text-[#4169E1]">
                      <span>⏱️</span>
                      <span>{event.timeGap} after previous event</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Timeline end marker */}
        <div
          className="absolute left-0 right-0 pl-16"
          style={{ top: `${processedEvents[processedEvents.length - 1].position + 100}px` }}
        >
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

      {/* Add custom styles for glow effects */}
      <style jsx>{`
        .glow-line {
          box-shadow: 0 0 10px rgba(65, 105, 225, 0.5),
                      0 0 20px rgba(65, 105, 225, 0.3);
        }
      `}</style>
    </div>
  );
}

// Made with Bob