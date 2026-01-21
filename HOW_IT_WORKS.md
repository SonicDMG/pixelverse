# 🔄 How Dynamic UI Rendering Works

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ASKS QUESTION                                           │
│    "How has IBM's stock performed over the last 2 weeks?"       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND (page.tsx)                                          │
│    - Calls POST /api/ask-stock with question                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API ROUTE (app/api/ask-stock/route.ts)                      │
│    - Receives question                                           │
│    - Calls queryLangflow(question)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. LANGFLOW SERVICE (services/langflow.ts)                     │
│    - Adds session_id                                             │
│    - POSTs to Langflow: http://localhost:7861/api/v1/run/{id}  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. LANGFLOW AGENT                                               │
│    - Processes question with MCP stock tool                      │
│    - Generates response with UI specification                    │
│    - Returns JSON:                                               │
│      {                                                           │
│        "text": "IBM increased 5.2%...",                         │
│        "components": [                                           │
│          {                                                       │
│            "type": "line-chart",                                │
│            "props": { "data": [...], "symbol": "IBM" }         │
│          }                                                       │
│        ]                                                         │
│      }                                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. LANGFLOW SERVICE - PARSING                                   │
│    - Receives Langflow response                                  │
│    - Extracts message text                                       │
│    - Checks if text is JSON (starts with '{')                   │
│    - If JSON: Parse and extract components array                 │
│    - If not JSON: Fall back to legacy parsing                    │
│    - Returns StockQueryResult with components                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. API ROUTE - RESPONSE                                         │
│    - Returns result to frontend                                  │
│    {                                                             │
│      "answer": "IBM increased 5.2%...",                         │
│      "components": [...]                                         │
│    }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. FRONTEND - STATE UPDATE                                      │
│    - Receives result                                             │
│    - Checks if result.components exists                          │
│    - If yes: Sets currentStockData with components               │
│    - If no: Falls back to legacy stockData                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. FRONTEND - RENDERING DECISION                                │
│    - Checks currentStockData.components                          │
│    - If components exist: Render <DynamicUIRenderer />          │
│    - If not: Render legacy <StockChart />                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. DYNAMIC UI RENDERER (components/DynamicUIRenderer.tsx)     │
│     - Receives components array                                  │
│     - Iterates through each component spec                       │
│     - Reads component.type (e.g., "line-chart")                 │
│     - Uses switch statement to map type to React component       │
│     - Passes component.props to the component                    │
│     - Renders the component with pixel art styling               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. RENDERED UI                                                 │
│     - User sees beautiful pixel art visualization               │
│     - Chart/table/metrics displayed with data                    │
│     - All styled with cyberpunk theme                            │
└─────────────────────────────────────────────────────────────────┘
```

## Key Decision Points

### Decision 1: Is Response JSON?
**Location:** `services/langflow.ts` line ~82

```typescript
// Check if messageText is JSON with components
if (messageText.trim().startsWith('{')) {
  uiResponse = JSON.parse(messageText);
}
```

**Result:**
- ✅ JSON → Parse and extract components
- ❌ Not JSON → Use legacy stock data parsing

### Decision 2: Does Result Have Components?
**Location:** `app/page.tsx` line ~45

```typescript
if (result.components && result.components.length > 0) {
  // Agent returned UI components
  setCurrentStockData(result);
}
```

**Result:**
- ✅ Has components → Store for dynamic rendering
- ❌ No components → Use legacy stockData

### Decision 3: What to Render?
**Location:** `app/page.tsx` line ~90

```typescript
{currentStockData?.components && currentStockData.components.length > 0 ? (
  <DynamicUIRenderer components={currentStockData.components} />
) : currentStockData?.stockData ? (
  <StockChart data={currentStockData.stockData} />
) : null}
```

**Result:**
- ✅ Has components → Render DynamicUIRenderer
- ❌ No components but has stockData → Render legacy StockChart
- ❌ Neither → Render nothing

### Decision 4: Which Component to Render?
**Location:** `components/DynamicUIRenderer.tsx` line ~25

```typescript
switch (spec.type) {
  case 'line-chart':
    return <StockChart ... />;
  case 'comparison-chart':
    return <ComparisonChart ... />;
  case 'data-table':
    return <DataTable ... />;
  // ... etc
}
```

**Result:** Maps type string to actual React component

## Example: Line Chart Rendering

### Agent Returns:
```json
{
  "text": "IBM stock increased 5.2%",
  "components": [
    {
      "type": "line-chart",
      "props": {
        "title": "IBM Stock Performance",
        "data": [
          { "date": "2024-01-01", "value": 150.25 },
          { "date": "2024-01-02", "value": 152.30 }
        ],
        "symbol": "IBM"
      }
    }
  ]
}
```

### DynamicUIRenderer Processes:
```typescript
// 1. Reads spec.type = "line-chart"
// 2. Enters case 'line-chart' in switch
// 3. Extracts spec.props
// 4. Transforms data format for StockChart
// 5. Returns:
<StockChart
  data={[
    { date: "2024-01-01", price: 150.25 },
    { date: "2024-01-02", price: 152.30 }
  ]}
  symbol="IBM"
/>
```

### Result:
Beautiful pixel art line chart with IBM stock data!

## Type Safety

The system uses TypeScript to ensure type safety:

```typescript
// 1. Agent response is validated against ComponentSpec union type
type ComponentSpec = 
  | LineChartSpec 
  | ComparisonChartSpec 
  | DataTableSpec 
  | ...

// 2. Each spec has strict prop types
interface LineChartSpec {
  type: 'line-chart';
  props: {
    title: string;
    data: Array<{ date: string; value: number; }>;
    symbol?: string;
  };
}

// 3. DynamicUIRenderer enforces these types
function renderComponent(spec: ComponentSpec) {
  // TypeScript ensures spec.type and spec.props are valid
}
```

## Error Handling

### Invalid Component Type
```typescript
default:
  return (
    <div className="error-message">
      Unknown component type: {spec.type}
    </div>
  );
```

### Rendering Error
```typescript
try {
  // Render component
} catch (error) {
  return (
    <div className="error-message">
      Error rendering {spec.type}
    </div>
  );
}
```

## Agent Instructions

The agent knows what to return because:

1. **AGENT_UI_GUIDE.md** documents all component types
2. **System prompt** includes component specifications
3. **Examples** show exact JSON format needed
4. **Type definitions** are clear and documented

The agent simply needs to:
1. Analyze the question
2. Choose appropriate component type(s)
3. Format data according to component props
4. Return JSON with text + components

## Summary

**The code knows which UI to render through:**

1. **Type field** - `"type": "line-chart"` tells it which component
2. **Switch statement** - Maps type string to React component
3. **Props** - Component-specific data passed as props
4. **Whitelist** - Only pre-approved components can render
5. **Type safety** - TypeScript validates everything

It's a **declarative system** - the agent declares what to show, not how to show it. The rendering logic is all pre-built and safe!