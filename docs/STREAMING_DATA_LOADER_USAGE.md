# Streaming Data Loader Component Usage

## Overview

The `streaming-data-loader` is a dynamic component that visualizes real-time data streaming from Langflow agents. It displays animated pixel blocks that fill progressively as data chunks arrive, providing visual feedback during long-running queries.

## Component Type

**Type:** `streaming-data-loader`

## When to Use

Use this component when:
- Fetching large datasets that take time to retrieve
- Processing complex queries that stream results
- Providing real-time feedback during multi-step operations
- Showing progress for astronomical data retrieval, calculations, or API calls

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | string | No | "STREAMING DATA..." | Status message to display |
| `chunksReceived` | number | No | 0 | Number of data chunks received so far |
| `totalChunks` | number | No | undefined | Total expected chunks (if known) |
| `status` | string | No | "streaming" | Current status: "connecting", "streaming", "processing", or "complete" |

## Status Values

- **connecting**: Initial connection to data source
- **streaming**: Actively receiving data chunks
- **processing**: Processing received data
- **complete**: Stream finished successfully

## Usage Examples

### Basic Streaming Indicator

```json
{
  "components": [
    {
      "type": "streaming-data-loader",
      "props": {
        "message": "Receiving astronomical data...",
        "status": "streaming"
      }
    }
  ]
}
```

### With Progress Tracking

```json
{
  "components": [
    {
      "type": "streaming-data-loader",
      "props": {
        "message": "Fetching star catalog data...",
        "chunksReceived": 5,
        "totalChunks": 10,
        "status": "streaming"
      }
    }
  ]
}
```

### Processing State

```json
{
  "components": [
    {
      "type": "streaming-data-loader",
      "props": {
        "message": "Calculating orbital mechanics...",
        "chunksReceived": 10,
        "totalChunks": 10,
        "status": "processing"
      }
    }
  ]
}
```

## Streaming Response Pattern

For true streaming responses, the Langflow agent should:

1. **Initial Response**: Return the streaming-data-loader component
2. **Update Responses**: Send updated component specs with incremented `chunksReceived`
3. **Final Response**: Replace with actual data components when complete

### Example Flow

**Step 1 - Start Streaming:**
```json
{
  "answer": "Fetching data from NASA API...",
  "components": [
    {
      "type": "streaming-data-loader",
      "props": {
        "message": "Connecting to NASA API...",
        "status": "connecting"
      }
    }
  ]
}
```

**Step 2 - Receiving Data:**
```json
{
  "answer": "Receiving planetary data...",
  "components": [
    {
      "type": "streaming-data-loader",
      "props": {
        "message": "Receiving planetary data...",
        "chunksReceived": 3,
        "totalChunks": 8,
        "status": "streaming"
      }
    }
  ]
}
```

**Step 3 - Complete:**
```json
{
  "answer": "Here's the planetary data you requested:",
  "components": [
    {
      "type": "celestial-body-card",
      "props": {
        "name": "Mars",
        "bodyType": "planet",
        "description": "The Red Planet...",
        ...
      }
    }
  ]
}
```

## Implementation Notes

### For Langflow Agents

1. **Enable Streaming**: Configure your Langflow flow to support streaming responses
2. **Chunk Data**: Break large responses into logical chunks
3. **Update Progress**: Send intermediate responses with updated `chunksReceived` values
4. **Replace on Complete**: Send final response with actual data components

### For Frontend Integration

The component is already integrated into the DynamicUIRenderer and will automatically render when the agent returns a `streaming-data-loader` component spec.

## Visual Design

The component features:
- Animated pixel blocks that fill progressively
- Varying block heights for visual interest
- Pulsing glow effect on the most recent block
- Status indicator with color-coded states
- Chunk counter display
- Progress bar
- Cyberpunk/pixel aesthetic matching the app theme

## Best Practices

1. **Set Realistic Totals**: If you know the total chunks, provide `totalChunks` for accurate progress
2. **Update Frequently**: Send updates every 1-2 chunks for smooth animation
3. **Use Appropriate Messages**: Tailor the message to the specific operation
4. **Transition Smoothly**: Replace with actual components when complete, don't leave the loader hanging

## Testing

To test the component, you can manually return it from your Langflow agent:

```python
# In your Langflow component
return {
    "answer": "Testing streaming loader...",
    "components": [
        {
            "type": "streaming-data-loader",
            "props": {
                "message": "Simulating data stream...",
                "chunksReceived": 5,
                "totalChunks": 10,
                "status": "streaming"
            }
        }
    ]
}
```

## Related Components

- **LoadingSpinner**: Used for general loading states (choosing agent, initial connection)
- **StreamingLoader** (shared): Alternative loader for non-dynamic scenarios
- **TextBlock**: For displaying status messages alongside the loader

## Future Enhancements

Potential improvements for streaming support:
- WebSocket integration for true real-time updates
- Server-Sent Events (SSE) for progressive rendering
- Automatic chunk detection and progress tracking
- Streaming text display for partial results

---

**Made with Bob**