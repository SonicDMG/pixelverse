# SpaceTimeline Component - Enhanced Usage Guide

## Overview

The enhanced SpaceTimeline component now features **true temporal scaling** using d3-scale, transforming it from a simple list into an actual timeline visualization where event spacing reflects real time differences.

## Key Enhancements

### 1. Temporal Scaling
- Events are positioned based on actual time differences, not equal spacing
- Uses d3-scale for accurate temporal calculations
- Supports both linear and logarithmic scales for different time ranges

### 2. Flexible Date Parsing
Automatically handles multiple date formats:
- ISO format: `"2024-01-15T10:30:00Z"`
- Year only: `"1969"`
- Month Year: `"July 1969"`
- Full dates: `"2024-01-15"`

### 3. Time Axis
- Automatic time markers based on the timeline span
- Intelligent interval selection (years, months, days)
- Visual indicators showing the temporal scale

### 4. Time Gap Indicators
- Shows relative time between consecutive events
- Human-readable format (e.g., "2y 3mo", "15d", "3h")
- Helps visualize temporal density

### 5. Interactive Features
- Hover effects with scale animations
- Expanded details on hover
- Pulsing animations for active elements
- Glow effects on the timeline

## Props

```typescript
interface SpaceTimelineProps {
  // Required props
  title: string;
  events: Array<{
    date: string;              // Flexible date format
    title: string;
    description: string;
    type?: 'mission' | 'discovery' | 'observation';
    details?: string;          // Additional context (shown when expanded)
    relatedEvents?: string[];  // Related event titles
    sources?: string[];        // Citations and references
  }>;
  
  // Optional enhancement props
  layout?: 'horizontal';                   // Only horizontal layout supported
  scaleType?: 'linear' | 'logarithmic';   // Default: 'linear'
  showTimeAxis?: boolean;                  // Default: true
  showRelativeTime?: boolean;              // Default: true
  minHeight?: number;                      // Not used in horizontal layout
}
```

## Usage Examples

### Basic Usage (Backward Compatible)
```tsx
<SpaceTimeline
  title="Mars Exploration Timeline"
  events={[
    {
      date: "1965",
      title: "Mariner 4",
      description: "First successful flyby of Mars",
      type: "mission"
    },
    {
      date: "1976",
      title: "Viking 1 Landing",
      description: "First successful Mars landing",
      type: "mission"
    },
    {
      date: "2012",
      title: "Curiosity Rover",
      description: "Advanced rover exploring Gale Crater",
      type: "mission"
    }
  ]}
/>
```

### With Temporal Scaling Features
```tsx
<SpaceTimeline
  title="Apollo Program Timeline"
  events={apolloEvents}
  scaleType="linear"
  showTimeAxis={true}
  showRelativeTime={true}
  minHeight={800}
/>
```

### Logarithmic Scale for Large Time Spans
```tsx
<SpaceTimeline
  title="History of Astronomy"
  events={astronomyEvents}
  scaleType="logarithmic"  // Better for centuries-spanning timelines
  showTimeAxis={true}
  minHeight={1000}
/>
```

## Visual Differences: Before vs After

### Before Enhancement
- ❌ Equal spacing between all events
- ❌ No indication of actual time gaps
- ❌ No time axis or scale reference
- ❌ Static list appearance

### After Enhancement
- ✅ Events positioned by actual time differences
- ✅ Time gap indicators between events ("+2y 3mo")
- ✅ Time axis with date markers
- ✅ True timeline visualization
- ✅ Interactive hover effects
- ✅ Glow effects and animations
- ✅ Support for different time scales

## How Temporal Scaling Works

### 1. Date Parsing
```typescript
// Flexible parsing handles various formats
parseDate("1969")           → Jan 1, 1969
parseDate("July 1969")      → July 1, 1969
parseDate("1969-07-20")     → July 20, 1969
```

### 2. Time Scale Creation
```typescript
// Linear scale for normal time ranges
const timeScale = scaleTime()
  .domain([minDate, maxDate])
  .range([0, containerHeight]);

// Logarithmic scale for large spans
const timeScale = scaleLog()
  .domain([logMinTime, logMaxTime])
  .range([0, containerHeight]);
```

### 3. Position Calculation
```typescript
// Each event gets positioned based on its date
const eventPosition = timeScale(eventDate);
// Events closer in time appear closer together
// Events far apart in time have more space
```

### 4. Time Gap Display
```typescript
// Calculate and format time between events
const gapMs = currentDate - previousDate;
formatTimeGap(gapMs) → "2y 3mo" or "15d" or "3h"
```

## Example: Apollo Program Timeline

```tsx
const apolloEvents = [
  {
    date: "1961-05-25",
    title: "Kennedy's Moon Speech",
    description: "President Kennedy announces goal to land on the Moon",
    type: "observation"
  },
  {
    date: "1968-12-21",
    title: "Apollo 8",
    description: "First crewed mission to orbit the Moon",
    type: "mission"
  },
  {
    date: "1969-07-20",
    title: "Apollo 11 Landing",
    description: "First humans land on the Moon",
    type: "mission"
  },
  {
    date: "1969-11-19",
    title: "Apollo 12",
    description: "Second Moon landing mission",
    type: "mission"
  },
  {
    date: "1972-12-11",
    title: "Apollo 17",
    description: "Final Apollo Moon landing",
    type: "mission"
  }
];

<SpaceTimeline
  title="Apollo Program Milestones"
  events={apolloEvents}
  scaleType="linear"
  showTimeAxis={true}
  showRelativeTime={true}
/>
```

**Visual Result:**
- Kennedy's speech to Apollo 8: Large gap (~7.5 years)
- Apollo 8 to Apollo 11: Medium gap (~7 months)
- Apollo 11 to Apollo 12: Small gap (~4 months)
- Apollo 12 to Apollo 17: Large gap (~3 years)

The spacing visually reflects these time differences!

## When to Use Each Scale Type

### Linear Scale (Default)
- **Best for:** Events within a few decades
- **Examples:** Space missions in a program, recent discoveries
- **Advantage:** Intuitive, proportional spacing

### Logarithmic Scale
- **Best for:** Events spanning centuries or millennia
- **Examples:** History of astronomy, geological timelines
- **Advantage:** Compresses large time spans while maintaining detail

## Styling & Theme

The component maintains the pixel-art space theme:
- **Colors:** Royal blue (#4169E1), cyan (#00CED1), gold (#FFD700), purple (#9370DB)
- **Effects:** Glow effects, scanlines, pixel borders
- **Animations:** Pulse, scale, translate on hover
- **Typography:** Pixel font throughout

## Performance Considerations

- Events are sorted and processed once using `useMemo`
- Time scale calculations are cached
- Hover state uses local state for smooth interactions
- Supports hundreds of events efficiently

## Accessibility

- Semantic HTML structure
- Clear visual hierarchy
- Readable font sizes
- High contrast colors
- Hover states for interactivity

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses CSS transforms and animations
- Responsive design

## Interactive Features

### Zoom and Pan

The SpaceTimeline supports zoom and pan functionality on the horizontal timeline:

#### Zoom Controls
- **Mouse Wheel**: Scroll to zoom in/out (when unlocked) - zooms centered on mouse cursor position
- **Zoom Lock Toggle**: 🔒/🔓 button to enable/disable mouse wheel zoom (prevents accidental page scrolling)
- **Zoom In/Out Buttons**: +/− buttons for precise zoom control
- **Reset Button**: ↺ button to reset zoom and pan to default
- **Zoom Range**: 0.5x to 5x magnification
- **Zoom Display**: Shows current zoom level (e.g., "1.5x")

#### Pan Controls
- **Click and Drag**: Click and hold to pan through the timeline
- **Horizontal Pan**: Pan horizontally to explore the timeline
- **Smooth Transitions**: Animated pan movements when not actively dragging
- **Visual Feedback**: Cursor changes to grab/grabbing during pan

#### Zoom Behavior
- **Horizontal Scaling**: Expands the timeline container width, naturally spreading events apart
- **Mouse-Centered Zoom**: Zoom focuses on the cursor position, keeping that point stationary
- **Smooth Transitions**: Animated zoom and pan for fluid user experience
- **Prevents Page Scroll**: Mouse wheel events are captured to prevent unwanted page scrolling
- **De-cluttering**: Helps separate overlapping timeline cards for better readability

### Click Interactions

Events are now fully interactive with click-to-expand functionality:

#### Event States
1. **Compact View** (Default)
   - Shows only the event title
   - Minimal space usage
   - Quick overview of timeline

2. **Hover View**
   - Expands to show icon, date, type badge
   - Displays full description
   - Shows time gap from previous event
   - Smooth width transition

3. **Expanded View** (On Click)
   - Maximum detail display
   - Shows all available information:
     - Full description
     - Additional details (if provided)
     - Related events list
     - Source citations
     - Time gap information
   - Close button (✕) in top-right corner
   - Click anywhere to close
   - Only one event expanded at a time
   - Enhanced shadow and glow effects

#### Expanded Event Data
Events can now include additional optional fields:

```typescript
{
  date: string;
  title: string;
  description: string;
  type?: 'mission' | 'discovery' | 'observation';
  details?: string;           // Additional context
  relatedEvents?: string[];   // Related event titles
  sources?: string[];         // Citations and references
}
```

#### Visual Feedback
- **Cursor**: Changes to pointer on hover
- **Border Glow**: Intensifies on hover and expansion
- **Shadow Effects**: Progressively stronger for hover → expanded
- **Width Animation**: Smooth transitions between states
- **Z-Index Management**: Expanded events appear above others

### Keyboard Accessibility
- Events can be clicked for expansion
- Close button for expanded events
- Click outside to close expanded event
- Visual indicators for interactive elements

## Usage Examples

### Basic Timeline with Zoom/Pan
```tsx
<SpaceTimeline
  title="Mars Exploration Timeline"
  events={marsEvents}
  layout="horizontal"
  scaleType="linear"
/>
```

### Timeline with Detailed Events
```tsx
const detailedEvents = [
  {
    date: "1969-07-20",
    title: "Apollo 11 Moon Landing",
    description: "First humans land on the Moon",
    type: "mission",
    details: "Neil Armstrong and Buzz Aldrin spent 21.5 hours on the lunar surface while Michael Collins orbited above.",
    relatedEvents: [
      "Apollo 8 - First crewed orbit of Moon",
      "Apollo 12 - Second Moon landing"
    ],
    sources: [
      "NASA Apollo 11 Mission Report",
      "https://www.nasa.gov/mission_pages/apollo/apollo11.html"
    ]
  },
  // ... more events
];

<SpaceTimeline
  title="Apollo Program Milestones"
  events={detailedEvents}
  layout="horizontal"
  showTimeAxis={true}
  showRelativeTime={true}
/>
```

### Timeline with Logarithmic Scale
```tsx
<SpaceTimeline
  title="History of Space Exploration"
  events={spaceEvents}
  layout="horizontal"
  scaleType="logarithmic"
/>
```

## Tips for Best Experience

### Zoom and Pan
- **Start Locked**: Zoom lock is enabled by default to prevent accidental scrolling
- **Unlock to Zoom**: Click the 🔒 button to enable mouse wheel zoom
- **Use Buttons**: For precise control, use the +/− buttons instead of mouse wheel
- **Reset Often**: Use the ↺ button to return to default view
- **Pan for Navigation**: Click and drag to move through zoomed timelines

### Event Interaction
- **Hover First**: Hover to preview event details before clicking
- **Click to Expand**: Click any event to see full details
- **One at a Time**: Only one event can be expanded at once
- **Easy Close**: Click the ✕ button, click the event again, or click outside to close
- **Rich Content**: Add `details`, `relatedEvents`, and `sources` for comprehensive information

### Performance
- Zoom and pan use CSS transforms for smooth 60fps animations
- Event expansion uses width transitions for fluid resizing
- Only expanded event renders additional detail sections
- Efficient event handling prevents unnecessary re-renders

## Future Enhancements

- Event filtering by type
- Export timeline as image
- Custom color schemes
- Mobile touch interactions
- Pinch-to-zoom on touch devices
- Keyboard navigation for events

---

**Made with Bob** 🚀