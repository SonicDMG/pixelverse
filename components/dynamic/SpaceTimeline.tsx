'use client';

import React, { useMemo, useState, useRef } from 'react';
import { scaleTime, scaleLog } from 'd3-scale';

interface SpaceTimelineEvent {
  date: string;
  title: string;
  description: string;
  type?: 'mission' | 'discovery' | 'observation';
}

interface SpaceTimelineProps {
  title: string;
  events: Array<SpaceTimelineEvent>;
  scaleType?: 'linear' | 'logarithmic';
  showTimeAxis?: boolean;
  showRelativeTime?: boolean;
  onEventClick?: (event: SpaceTimelineEvent) => void; // Callback when event is clicked
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

export function SpaceTimeline({
  title,
  events,
  scaleType = 'linear',
  showTimeAxis = true,
  showRelativeTime = true,
  onEventClick
}: SpaceTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isZoomLocked, setIsZoomLocked] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Zoom constants
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.25;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoom(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  const handleToggleZoomLock = () => {
    setIsZoomLocked(prev => !prev);
  };

  // Mouse wheel zoom handler - prevent page scroll and center on mouse
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isZoomLocked && containerRef.current) {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(zoom + delta, MAX_ZOOM));
      
      if (newZoom !== zoom) {
        const container = containerRef.current;
        
        // Get mouse position relative to the container
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const scrollLeft = container.scrollLeft;
        
        // Calculate the point in the content that's under the mouse
        const contentX = mouseX + scrollLeft;
        
        // Calculate how much the content will grow/shrink
        const zoomRatio = newZoom / zoom;
        
        // Calculate new scroll position to keep the point under the mouse stationary
        const newScrollLeft = contentX * zoomRatio - mouseX;
        
        // Update zoom and scroll position synchronously
        setZoom(newZoom);
        container.scrollLeft = newScrollLeft;
      }
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0 && containerRef.current) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX + containerRef.current.scrollLeft,
        y: e.clientY
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && containerRef.current) {
      const newScrollLeft = panStart.x - e.clientX;
      containerRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // Click handler for event - just triggers callback
  const handleEventClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger callback if provided
    if (onEventClick) {
      const clickedEvent = events[processedEvents[index].originalIndex];
      onEventClick(clickedEvent);
    }
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

    // Create scale based on type (horizontal layout only)
    let timeScale;
    const scaleRange = [0, 100];
    
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
  }, [events, scaleType, zoom]);

  // Multi-lane collision detection system for horizontal layout
  const eventsWithVerticalPositions = useMemo((): ProcessedEvent[] => {

    // Define lanes: 3 above, 3 below the timeline (wider spacing)
    const lanes = {
      top: [-100, -150, -200],
      bottom: [100, 150, 200]
    };

    // Helper function to check horizontal overlap
    // Card is 220px max width, container is typically 1600px min-width
    // So we need ~15% spacing to prevent overlaps (220/1600 * 100 = 13.75%)
    const checkHorizontalOverlap = (pos1: number, pos2: number, minSpacing: number = 15): boolean => {
      return Math.abs(pos1 - pos2) < minSpacing;
    };

    const positionedEvents: ProcessedEvent[] = [];

    processedEvents.forEach((event, index) => {
      const isAbove = index % 2 === 0;
      const direction = isAbove ? 'top' : 'bottom';
      let laneIndex = 0;

      // Check for overlaps with ALL previous events (no early break)
      for (let i = positionedEvents.length - 1; i >= 0; i--) {
        const prevEvent = positionedEvents[i];

        if (checkHorizontalOverlap(event.position, prevEvent.position)) {
          // If overlapping with an event in the same direction, try next lane
          const prevIsAbove = prevEvent.isAbove ?? false;
          if (prevIsAbove === isAbove) {
            const prevLaneIndex = prevEvent.laneIndex ?? 0;
            laneIndex = Math.max(laneIndex, prevLaneIndex + 1);
            
            // Cap at maximum lane index
            if (laneIndex >= lanes[direction].length) {
              laneIndex = lanes[direction].length - 1;
            }
          }
        }
      }

      positionedEvents.push({
        ...event,
        verticalOffset: lanes[direction][laneIndex],
        isAbove,
        laneIndex
      });
    });

    return positionedEvents;
  }, [processedEvents]);

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
          color: 'border-[var(--color-event-mission)] bg-[var(--color-event-mission)]/10',
          dotColor: 'bg-[var(--color-event-mission)]',
          textColor: 'text-[var(--color-event-mission)]',
        };
      case 'discovery':
        return {
          icon: '🔭',
          color: 'border-[var(--color-event-discovery)] bg-[var(--color-event-discovery)]/10',
          dotColor: 'bg-[var(--color-event-discovery)]',
          textColor: 'text-[var(--color-event-discovery)]',
        };
      case 'observation':
        return {
          icon: '👁️',
          color: 'border-[var(--color-event-observation)] bg-[var(--color-event-observation)]/10',
          dotColor: 'bg-[var(--color-event-observation)]',
          textColor: 'text-[var(--color-event-observation)]',
        };
      default:
        return {
          icon: '⭐',
          color: 'border-[var(--color-primary)] bg-[var(--color-primary)]/10',
          dotColor: 'bg-[var(--color-primary)]',
          textColor: 'text-[var(--color-primary)]',
        };
    }
  };

  if (processedEvents.length === 0) {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-card)] border-4 border-[var(--color-primary)] rounded-lg pixel-border">
        <h2 className="text-2xl font-pixel text-[var(--color-primary)] glow-text-subtle uppercase tracking-wider">
          {title}
        </h2>
        <p className="mt-4 font-pixel text-sm text-gray-400">No events to display</p>
      </div>
    );
  }

  // Render horizontal timeline
  return (
      <div className="w-full p-6 bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-card)] border-4 border-[var(--color-primary)] rounded-lg pixel-border scanline-container">
        {/* Timeline Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-pixel text-[var(--color-primary)] glow-text-subtle uppercase tracking-wider flex items-center gap-3">
            <span className="text-[var(--color-secondary)]">⏱️</span>
            {title}
          </h2>
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-[var(--color-primary)] to-transparent"></div>
          
          {/* Timeline info */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-pixel text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-secondary)]">📅</span>
              <span>{processedEvents.length} events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-accent)]">⚡</span>
              <span>Scale: {scaleType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-purple)]">🔍</span>
              <span>Zoom: {zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-secondary)]">👆</span>
              <span>Click events to ask questions</span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-[var(--color-bg-card)]/90 border-2 border-[var(--color-primary)] rounded-lg pixel-border p-2">
          <button
            onClick={handleToggleZoomLock}
            className={`w-10 h-10 ${isZoomLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center`}
            title={isZoomLocked ? "Unlock Zoom (Mouse Wheel Disabled)" : "Lock Zoom (Mouse Wheel Enabled)"}
          >
            {isZoomLocked ? '🔒' : '🔓'}
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            +
          </button>
          <div className="text-center text-xs font-pixel text-[var(--color-accent)] py-1">
            {zoom.toFixed(1)}x
          </div>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-10 h-10 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-pixel text-lg rounded pixel-border transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="w-10 h-10 bg-[var(--color-purple)] hover:bg-[var(--color-purple)]/80 text-white font-pixel text-xs rounded pixel-border transition-colors flex items-center justify-center"
            title="Reset Zoom & Pan"
          >
            ↺
          </button>
        </div>

        {/* Horizontal Timeline Container */}
        <div
          ref={containerRef}
          className="relative w-full overflow-x-auto overflow-y-visible pb-4 cursor-grab active:cursor-grabbing"
          style={{ minHeight: '500px' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="relative"
            style={{
              minWidth: `max(${200 * zoom}%, ${1600 * zoom}px)`,
              height: '500px'
            }}
          >
            
            {/* Horizontal timeline axis - centered exactly at 50% */}
            <div
              className="absolute left-0 right-0 h-3 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-purple)] to-[var(--color-secondary)] rounded-full shadow-[0_0_20px_rgba(65,105,225,0.5)]"
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
                <div className="w-0.5 h-4 bg-[var(--color-primary)] opacity-50 mb-1"></div>
                <span
                  className="text-[10px] font-pixel text-[var(--color-primary)] opacity-70 whitespace-nowrap"
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
                      height: `${Math.abs(verticalOffset)}px`,
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

                  {/* Event card with hover and click interaction */}
                  <div
                    className="absolute group"
                    style={{
                      left: `${event.position}%`,
                      top: '50%',
                      transform: `translate(-50%, ${verticalOffset}px) ${!isAbove ? 'translateY(-100%)' : ''}`,
                      width: isHovered ? '220px' : '140px',
                      zIndex: isHovered ? 50 : 15,
                      transition: 'width 0.3s ease-in-out, z-index 0s'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={(e) => handleEventClick(index, e)}
                  >
                    <div
                      className={`bg-[var(--color-bg-dark)] border-2 ${style.color.split(' ')[0]} rounded-lg pixel-border transition-all duration-300 relative cursor-pointer ${
                        isHovered
                          ? 'border-opacity-100 z-10 p-4'
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

                    {/* Hover view */}
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
                          <div className="mt-2 pt-2 border-t border-[var(--color-primary)]/30">
                            <div className="flex items-center gap-2 text-[10px] font-pixel text-[var(--color-primary)]">
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
              <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg-dark)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
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
              <div className="w-6 h-6 rounded-full border-2 border-[var(--color-secondary)] bg-[var(--color-bg-dark)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t-2 border-[var(--color-primary)]/30">
          <div className="flex flex-wrap gap-4 justify-center text-xs font-pixel">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <span className="text-[var(--color-event-mission)]">Mission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔭</span>
              <span className="text-[var(--color-event-discovery)]">Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">👁️</span>
              <span className="text-[var(--color-event-observation)]">Observation</span>
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

// Made with Bob