# 📁 PixelTicker Project Structure

## Directory Overview

```
pixelticker/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── ask-stock/
│   │       └── route.ts          # Stock query endpoint
│   ├── globals.css               # Global styles & pixel art theme
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application page
│
├── components/                   # React Components
│   ├── LoadingSpinner.tsx        # Pixel art loading animation
│   ├── MessageHistory.tsx        # Chat history display
│   ├── QuestionInput.tsx         # Input form with examples
│   └── StockChart.tsx            # Chart.js visualization
│
├── services/                     # Business Logic
│   └── langflow.ts               # Langflow API client
│
├── types/                        # TypeScript Definitions
│   └── index.ts                  # Type interfaces
│
├── .env.local                    # Environment variables
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.ts                # Next.js config
├── README.md                     # Main documentation
├── SETUP_GUIDE.md                # Setup instructions
└── PROJECT_STRUCTURE.md          # This file
```

## Key Files Explained

### 🎨 Frontend Components

#### `app/page.tsx` (Main Application)
- **Purpose**: Main UI with state management
- **State**: Messages, loading, errors, stock data
- **Features**: Question handling, chart display, message history
- **Lines**: ~122

#### `components/StockChart.tsx`
- **Purpose**: Pixel art stock chart visualization
- **Library**: Chart.js with react-chartjs-2
- **Features**: Customized colors, pixel styling, tooltips
- **Lines**: ~125

#### `components/QuestionInput.tsx`
- **Purpose**: User input with example questions
- **Features**: Example buttons, form validation, loading states
- **Lines**: ~72

#### `components/MessageHistory.tsx`
- **Purpose**: Display conversation history
- **Features**: User/assistant messages, timestamps
- **Lines**: ~44

#### `components/LoadingSpinner.tsx`
- **Purpose**: Pixel art loading animation
- **Features**: Animated dots with bounce effect
- **Lines**: ~9

### 🔧 Backend & Services

#### `app/api/ask-stock/route.ts`
- **Purpose**: API endpoint for stock queries
- **Method**: POST
- **Input**: `{ question: string }`
- **Output**: `{ answer, stockData?, symbol?, error? }`
- **Lines**: ~34

#### `services/langflow.ts`
- **Purpose**: Langflow API client
- **Features**: Query handling, response parsing, error handling
- **Key Functions**:
  - `queryLangflow()`: Main query function
  - `parseStockData()`: Extract stock data from response
- **Lines**: ~95

### 📝 Type Definitions

#### `types/index.ts`
- **Purpose**: TypeScript interfaces
- **Types**:
  - `StockDataPoint`: Chart data structure
  - `Message`: Chat message structure
  - `LangflowRequest`: API request format
  - `LangflowResponse`: API response format
  - `StockQueryResult`: Query result structure
- **Lines**: ~44

### 🎨 Styling

#### `app/globals.css`
- **Purpose**: Global styles and pixel art theme
- **Features**:
  - CSS variables for colors
  - Pixel art font (Press Start 2P)
  - Pixel border effects
  - Glowing text effects
  - Animated background grid
  - Custom scrollbar
  - Responsive design
- **Lines**: ~145

## Configuration Files

### `package.json`
**Key Dependencies:**
- `next`: 16.1.4
- `react`: 19.x
- `typescript`: 5.x
- `chart.js`: Latest
- `react-chartjs-2`: Latest
- `axios`: Latest
- `tailwindcss`: 3.x

### `.env.local`
**Environment Variables:**
```env
NEXT_PUBLIC_LANGFLOW_URL=http://localhost:7861
LANGFLOW_API_KEY=
```

### `tsconfig.json`
**TypeScript Configuration:**
- Strict mode enabled
- Path aliases: `@/*` → `./*`
- Target: ES2017
- Module: ESNext

### `tailwind.config.ts`
**Tailwind Configuration:**
- Content paths for app and components
- Custom theme extensions (if any)

## Data Flow

```
User Input
    ↓
QuestionInput Component
    ↓
page.tsx (handleQuestion)
    ↓
POST /api/ask-stock
    ↓
services/langflow.ts
    ↓
Langflow API (port 7861)
    ↓
MCP Stock Server
    ↓
Stock Data Response
    ↓
Parse & Format
    ↓
Update UI (Chart + Messages)
```

## Component Hierarchy

```
page.tsx (Main)
├── Header
├── Error Display
├── StockChart
│   └── Chart.js Line Chart
├── LoadingSpinner
├── MessageHistory
│   └── Message Items
└── QuestionInput
    ├── Example Questions
    └── Input Form
```

## Styling Architecture

### Color Scheme
- **Primary**: Neon Cyan (#00ff9f)
- **Secondary**: Neon Magenta (#ff00ff)
- **Background**: Dark Blue (#0a0e27)
- **Darker BG**: Very Dark Blue (#050814)
- **Card BG**: Medium Blue (#1a1f3a)

### Typography
- **Font**: Press Start 2P (Google Fonts)
- **Sizes**: 8px - 10px (small), 12px - 14px (medium), 16px+ (large)
- **Line Height**: 1.6 for readability

### Effects
- **Glow**: Text shadow with neon colors
- **Borders**: 4px solid with pixel effect
- **Shadows**: Box shadow for depth
- **Animation**: Bounce, pulse, fade-in

## API Endpoints

### POST /api/ask-stock
**Request:**
```typescript
{
  question: string
}
```

**Response (Success):**
```typescript
{
  answer: string,
  stockData?: StockDataPoint[],
  symbol?: string
}
```

**Response (Error):**
```typescript
{
  error: string
}
```

## Environment Setup

### Development
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Required Services
1. **Langflow**: Port 7861
2. **MCP Stock Server**: Configured in Langflow
3. **Node.js**: v18+

## Next Steps for Testing

1. Update Flow ID in `services/langflow.ts`
2. Start Langflow on port 7861
3. Run `npm run dev`
4. Test with example questions
5. Verify chart rendering
6. Check error handling

---

**For detailed setup instructions, see SETUP_GUIDE.md**