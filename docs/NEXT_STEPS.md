# PixelSpace Implementation - Next Steps

## Context
This document tracks the implementation progress for PixelSpace features after successfully committing the dual-theme architecture.

## Completed ✅
- [x] **Dual-Theme Architecture** (Committed: 40a9462)
  - Created ThemeContext for managing theme state (ticker/space modes)
  - Added AppSwitcher component for toggling between PixelTicker and PixelSpace
  - Implemented ClientLayout wrapper for theme provider
  - Updated all components to use theme-aware styling
  - Enhanced theme constants with comprehensive color palettes

## In Progress 🚧

### Task 2: Create `/api/ask-space` Endpoint
**File to create:** `app/api/ask-space/route.ts`

**Requirements:**
- Similar structure to `app/api/ask-stock/route.ts`
- Designed for space/astronomy queries
- Should integrate with OpenRAG SDK (will add integration later)
- For now, can return mock responses or use Langflow
- Handle POST requests with question parameter
- Return structured responses compatible with DynamicUIRenderer

**Reference:** See `app/api/ask-stock/route.ts` for structure

### Task 3: Update Main Page API Routing
**File to modify:** `app/page.tsx`

**Requirements:**
- Add conditional API routing based on theme mode
- If `theme.mode === 'space'`, call `/api/ask-space`
- If `theme.mode === 'ticker'`, call `/api/ask-stock`
- Ensure smooth transition between modes
- Maintain existing functionality for PixelTicker

### Task 4: Add Space-Themed Example Questions
**File to modify:** `app/page.tsx`

**Requirements:**
- Update example questions based on current theme
- **PixelTicker examples** (keep existing):
  - Stock-related queries
- **PixelSpace examples** (add new):
  - "Tell me about the James Webb Space Telescope"
  - "What is a black hole?"
  - "Explain the Big Bang theory"
  - "How far away is Mars?"

### Task 5: Add Space-Specific UI Component Types
**File to modify:** `types/ui-spec.ts`

**New component specs to add:**
```typescript
// PlanetCardSpec - Display info about a planet
interface PlanetCardSpec {
  type: 'planet_card';
  name: string;
  diameter: string;
  distance_from_sun: string;
  moons: number;
  description: string;
  image_url?: string;
}

// ConstellationSpec - Show constellation information
interface ConstellationSpec {
  type: 'constellation';
  name: string;
  stars: number;
  visible_months: string[];
  mythology: string;
  brightest_star: string;
}

// SpaceTimelineSpec - Timeline of space missions/discoveries
interface SpaceTimelineSpec {
  type: 'space_timeline';
  events: Array<{
    date: string;
    title: string;
    description: string;
    mission?: string;
  }>;
}
```

### Task 6: Create Space Component Implementations
**Files to create in `components/dynamic/`:**
- `PlanetCard.tsx` - Basic planet information display
- `Constellation.tsx` - Constellation information display
- `SpaceTimeline.tsx` - Timeline of space events

**Requirements:**
- Use space theme colors from `constants/theme.ts`
- Keep implementations simple for now (will enhance with OpenRAG later)
- Follow existing component patterns (see MetricCard, DataTable, etc.)
- Ensure responsive design
- Add proper TypeScript types

### Task 7: Testing
**Test both modes:**
- [ ] PixelTicker mode works as before
- [ ] PixelSpace mode uses correct API endpoint
- [ ] Theme switcher works smoothly
- [ ] Example questions update based on theme
- [ ] Space components render correctly
- [ ] No console errors
- [ ] Styling is consistent with theme

## Technical Notes

### API Integration Strategy
1. **Phase 1 (Current):** Mock responses or basic Langflow integration
2. **Phase 2 (Future):** Full OpenRAG SDK integration with vector search
3. **Phase 3 (Future):** Enhanced space data with real-time astronomy APIs

### Component Architecture
- All space components should be theme-aware
- Use existing hooks (useChartAnimation, etc.) where applicable
- Maintain consistency with PixelTicker component patterns
- Prepare for future OpenRAG data integration

### Git Workflow
- Working on `pixelspace` branch
- Commit frequently with clear messages
- Keep PixelTicker functionality intact

## Important Files Reference
- Theme Context: `contexts/ThemeContext.tsx`
- Theme Constants: `constants/theme.ts`
- App Switcher: `components/AppSwitcher.tsx`
- Main Page: `app/page.tsx`
- Stock API: `app/api/ask-stock/route.ts`
- UI Specs: `types/ui-spec.ts`
- Dynamic Renderer: `components/DynamicUIRenderer.tsx`

## Questions/Decisions Needed
- Should space API use same Langflow endpoint with different flow?
- What mock data structure for space queries?
- Any specific astronomy data sources to integrate?

---
**Last Updated:** 2026-01-23
**Branch:** pixelspace
**Status:** Ready to implement Task 2 (API endpoint)