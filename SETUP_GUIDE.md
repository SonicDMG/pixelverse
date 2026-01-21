# 🚀 PixelTicker Setup Guide

This guide will help you get PixelTicker up and running with your Langflow instance.

## Step 1: Configure Langflow Flow ID

1. Open your Langflow instance at `http://localhost:7861`
2. Navigate to your stock analysis flow
3. Copy the Flow ID from the URL or flow settings
4. Open `services/langflow.ts` in the PixelTicker project
5. Replace `your-flow-id` on line 48 with your actual Flow ID:

```typescript
const response = await axios.post<LangflowResponse>(
  `${LANGFLOW_URL}/api/v1/run/YOUR_ACTUAL_FLOW_ID_HERE`,
  request,
  // ...
);
```

## Step 2: Verify Langflow Configuration

Your Langflow flow should:

### Input Configuration
- **Input Type**: Chat or Text
- **Input Name**: `input_value` (or update the service to match your input name)

### MCP Stock Tool Configuration
- Ensure your MCP stock server is running and accessible
- Configure the MCP tool in Langflow to connect to your stock data provider
- Test the MCP tool independently in Langflow first

### Output Configuration
The flow should return data in this structure:
```json
{
  "outputs": [{
    "outputs": [{
      "results": {
        "message": {
          "text": "Stock analysis response here",
          "data": [
            {
              "date": "2024-01-01",
              "price": 150.25,
              "volume": 1000000
            }
          ]
        }
      }
    }]
  }]
}
```

## Step 3: Environment Variables

The `.env.local` file is already created. Update if needed:

```env
# Langflow endpoint (default: http://localhost:7861)
NEXT_PUBLIC_LANGFLOW_URL=http://localhost:7861

# Optional: Add API key if your Langflow requires authentication
LANGFLOW_API_KEY=your_api_key_here
```

If you add an API key, update `services/langflow.ts` to include it in headers:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`,
},
```

## Step 4: Test the Setup

1. **Start Langflow** (if not already running):
   ```bash
   langflow run --port 7861
   ```

2. **Start PixelTicker**:
   ```bash
   cd pixelticker
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

4. **Test with a simple query**:
   - Click on one of the example questions
   - Or type: "What is Apple's current stock price?"

## Step 5: Troubleshooting

### Issue: "Failed to connect to Langflow"

**Solutions:**
- Verify Langflow is running: `curl http://localhost:7861/health`
- Check the Flow ID is correct
- Ensure no firewall is blocking port 7861
- Check browser console for CORS errors

### Issue: "No stock data displayed"

**Solutions:**
- Verify your MCP stock tool is returning data in Langflow
- Check the response format matches the expected structure
- Look at the browser console for parsing errors
- Test the Langflow flow directly in the Langflow UI

### Issue: Chart not rendering

**Solutions:**
- Ensure stock data includes `date` and `price` fields
- Check that dates are in a valid format (YYYY-MM-DD)
- Verify prices are numbers, not strings
- Open browser DevTools and check for Chart.js errors

## Step 6: Customization

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --neon-cyan: #00ff9f;      /* Primary color */
  --neon-magenta: #ff00ff;   /* Secondary color */
  --dark-bg: #0a0e27;        /* Background */
}
```

### Add More Example Questions
Edit `components/QuestionInput.tsx`:
```typescript
const EXAMPLE_QUESTIONS = [
  "Your custom question here",
  // ... add more
];
```

### Modify Chart Style
Edit `components/StockChart.tsx` to customize:
- Colors
- Line thickness
- Point sizes
- Grid styling
- Tooltip format

## Step 7: Production Deployment

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Test production build locally**:
   ```bash
   npm start
   ```

3. **Deploy to your platform**:
   - Vercel: `vercel deploy`
   - Netlify: Connect your Git repository
   - Docker: Use the included Dockerfile (if created)

4. **Update environment variables** in your deployment platform

## Need Help?

- Check the main README.md for detailed documentation
- Review Langflow documentation for MCP configuration
- Test your Langflow flow independently before integrating
- Check browser console and terminal logs for errors

---

**Happy Stock Analyzing! 🎮📈**