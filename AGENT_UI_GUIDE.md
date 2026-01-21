# 🎨 Agent UI Specification Guide

This guide explains how the Langflow agent should structure responses to dynamically generate UI components in PixelTicker.

## Overview

Instead of just returning text, the agent can return **UI specifications** that tell the app which pre-built components to render with what data. This allows for rich, interactive visualizations tailored to each query.

## Response Format

The agent should return JSON with this structure:

```json
{
  "text": "Here's the stock performance analysis...",
  "components": [
    {
      "type": "component-type",
      "props": {
        // component-specific properties
      },
      "id": "optional-unique-id"
    }
  ]
}
```

## Available Components

### 1. Line Chart (`line-chart`)

**Use for**: Single stock performance over time

```json
{
  "type": "line-chart",
  "props": {
    "title": "IBM Stock Performance",
    "data": [
      { "date": "2024-01-01", "value": 150.25, "volume": 1000000 },
      { "date": "2024-01-02", "value": 152.30, "volume": 1200000 }
    ],
    "symbol": "IBM",
    "color": "#00ff9f",
    "showVolume": true
  }
}
```

### 2. Comparison Chart (`comparison-chart`)

**Use for**: Comparing multiple stocks

```json
{
  "type": "comparison-chart",
  "props": {
    "title": "AAPL vs GOOGL Performance",
    "datasets": [
      {
        "label": "Apple (AAPL)",
        "data": [
          { "date": "2024-01-01", "value": 180.50 },
          { "date": "2024-01-02", "value": 182.30 }
        ],
        "color": "#00ff9f"
      },
      {
        "label": "Google (GOOGL)",
        "data": [
          { "date": "2024-01-01", "value": 140.20 },
          { "date": "2024-01-02", "value": 141.50 }
        ],
        "color": "#ff00ff"
      }
    ]
  }
}
```

### 3. Data Table (`data-table`)

**Use for**: Tabular data display

```json
{
  "type": "data-table",
  "props": {
    "title": "Stock Data Summary",
    "headers": ["Date", "Open", "Close", "Volume"],
    "rows": [
      ["2024-01-01", 150.00, 152.50, 1000000],
      ["2024-01-02", 152.50, 154.20, 1200000]
    ],
    "highlightColumn": 2
  }
}
```

### 4. Comparison Table (`comparison-table`)

**Use for**: Side-by-side metric comparisons

```json
{
  "type": "comparison-table",
  "props": {
    "title": "AAPL vs GOOGL Comparison",
    "column1Label": "Apple",
    "column2Label": "Google",
    "items": [
      {
        "label": "Current Price",
        "value1": "$180.50",
        "value2": "$140.20",
        "change": 2.5
      },
      {
        "label": "Market Cap",
        "value1": "$2.8T",
        "value2": "$1.7T"
      }
    ]
  }
}
```

### 5. Metric Card (`metric-card`)

**Use for**: Single key metric display

```json
{
  "type": "metric-card",
  "props": {
    "title": "Current Price",
    "value": "$180.50",
    "change": 2.5,
    "changeLabel": "today",
    "subtitle": "As of market close"
  }
}
```

### 6. Metric Grid (`metric-grid`)

**Use for**: Multiple metrics in a grid

```json
{
  "type": "metric-grid",
  "props": {
    "metrics": [
      {
        "label": "Current Price",
        "value": "$180.50",
        "change": 2.5,
        "icon": "📈"
      },
      {
        "label": "Volume",
        "value": "1.2M",
        "change": -5.2,
        "icon": "📊"
      },
      {
        "label": "Market Cap",
        "value": "$2.8T",
        "icon": "💰"
      }
    ]
  }
}
```

### 7. Alert Box (`alert-box`)

**Use for**: Important messages or warnings

```json
{
  "type": "alert-box",
  "props": {
    "severity": "warning",
    "title": "Market Alert",
    "message": "Stock has dropped 10% in the last hour"
  }
}
```

Severity options: `"info"`, `"warning"`, `"success"`, `"error"`

### 8. Text Block (`text-block`)

**Use for**: Formatted text content

```json
{
  "type": "text-block",
  "props": {
    "content": "IBM stock has shown strong performance...",
    "format": "plain"
  }
}
```

## Example Responses

### Example 1: Simple Stock Query

**User**: "How has IBM's stock performed over the last 2 weeks?"

**Agent Response**:
```json
{
  "text": "IBM stock has increased 5.2% over the past 2 weeks, showing strong upward momentum.",
  "components": [
    {
      "type": "line-chart",
      "props": {
        "title": "IBM Stock - Last 2 Weeks",
        "data": [
          { "date": "2024-01-08", "value": 145.20 },
          { "date": "2024-01-09", "value": 146.50 },
          { "date": "2024-01-10", "value": 148.30 },
          { "date": "2024-01-11", "value": 147.80 },
          { "date": "2024-01-12", "value": 149.50 },
          { "date": "2024-01-15", "value": 150.20 },
          { "date": "2024-01-16", "value": 151.80 },
          { "date": "2024-01-17", "value": 152.75 }
        ],
        "symbol": "IBM"
      }
    },
    {
      "type": "metric-grid",
      "props": {
        "metrics": [
          { "label": "Current Price", "value": "$152.75", "change": 5.2 },
          { "label": "2-Week High", "value": "$152.75" },
          { "label": "2-Week Low", "value": "$145.20" }
        ]
      }
    }
  ]
}
```

### Example 2: Stock Comparison

**User**: "Compare AAPL vs GOOGL performance"

**Agent Response**:
```json
{
  "text": "Apple has outperformed Google by 3.2% this month, with stronger momentum in the tech sector.",
  "components": [
    {
      "type": "comparison-chart",
      "props": {
        "title": "AAPL vs GOOGL - Monthly Performance",
        "datasets": [
          {
            "label": "Apple (AAPL)",
            "data": [
              { "date": "2024-01-01", "value": 175.00 },
              { "date": "2024-01-08", "value": 178.50 },
              { "date": "2024-01-15", "value": 182.30 },
              { "date": "2024-01-22", "value": 185.20 }
            ],
            "color": "#00ff9f"
          },
          {
            "label": "Google (GOOGL)",
            "data": [
              { "date": "2024-01-01", "value": 138.00 },
              { "date": "2024-01-08", "value": 139.50 },
              { "date": "2024-01-15", "value": 141.20 },
              { "date": "2024-01-22", "value": 142.80 }
            ],
            "color": "#ff00ff"
          }
        ]
      }
    },
    {
      "type": "comparison-table",
      "props": {
        "title": "Key Metrics Comparison",
        "column1Label": "Apple",
        "column2Label": "Google",
        "items": [
          { "label": "Current Price", "value1": "$185.20", "value2": "$142.80", "change": 5.8 },
          { "label": "Monthly Change", "value1": "+5.8%", "value2": "+3.5%" },
          { "label": "Market Cap", "value1": "$2.9T", "value2": "$1.8T" }
        ]
      }
    }
  ]
}
```

### Example 3: Detailed Analysis

**User**: "Give me a detailed analysis of Tesla stock"

**Agent Response**:
```json
{
  "text": "Tesla stock analysis for the past month shows mixed signals with high volatility.",
  "components": [
    {
      "type": "metric-grid",
      "props": {
        "metrics": [
          { "label": "Current Price", "value": "$242.50", "change": -2.3 },
          { "label": "Volume", "value": "125M", "change": 15.2 },
          { "label": "Market Cap", "value": "$770B", "change": -2.1 },
          { "label": "P/E Ratio", "value": "65.4" },
          { "label": "52-Week High", "value": "$299.29" },
          { "label": "52-Week Low", "value": "$138.80" }
        ]
      }
    },
    {
      "type": "line-chart",
      "props": {
        "title": "Tesla Stock - 30 Day Performance",
        "data": [
          { "date": "2024-01-01", "value": 248.50 },
          { "date": "2024-01-08", "value": 245.20 },
          { "date": "2024-01-15", "value": 250.80 },
          { "date": "2024-01-22", "value": 242.50 }
        ],
        "symbol": "TSLA"
      }
    },
    {
      "type": "alert-box",
      "props": {
        "severity": "info",
        "title": "Analyst Note",
        "message": "High volatility expected due to upcoming earnings report"
      }
    }
  ]
}
```

## Best Practices

### 1. **Match Component to Query Type**
- Price over time → `line-chart`
- Comparing stocks → `comparison-chart` + `comparison-table`
- Key metrics → `metric-grid` or `metric-card`
- Detailed data → `data-table`

### 2. **Combine Components**
Return multiple components for comprehensive answers:
- Chart + Metrics
- Table + Alert
- Comparison Chart + Comparison Table

### 3. **Keep Data Reasonable**
- Charts: 10-30 data points
- Tables: 5-20 rows
- Metrics: 3-6 per grid

### 4. **Use Appropriate Colors**
- Primary: `#00ff9f` (cyan)
- Secondary: `#ff00ff` (magenta)
- Tertiary: `#00d4ff` (blue)
- Warning: `#ffff00` (yellow)

### 5. **Provide Context**
Always include the `text` field with a summary, even when returning components.

## Error Handling

If data is unavailable or invalid:

```json
{
  "text": "Unable to retrieve stock data for the requested period.",
  "components": [
    {
      "type": "alert-box",
      "props": {
        "severity": "error",
        "title": "Data Unavailable",
        "message": "Stock data could not be retrieved. Please try again later."
      }
    }
  ]
}
```

## Security Note

All components are pre-built and whitelisted. The agent cannot inject arbitrary code - only specify which approved components to use with what data. This ensures safe, dynamic UI generation.

---

**Remember**: The goal is to provide rich, visual answers that make stock data easy to understand at a glance!