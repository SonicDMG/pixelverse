# 🎮 PixelVerse

A cyberpunk pixel art application suite (PixelTicker & PixelSpace) powered by Langflow, MCP, and OpenRAG.

![PixelTicker](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

- **🔐 Secure Authentication**: HTTP Basic Auth with cyberpunk-styled landing page
- **Retro Cyberpunk UI**: Pixel art design with neon cyan and magenta colors
- **Stock Analysis**: Ask natural language questions about stock performance (PixelTicker)
- **Space Exploration**: Explore the cosmos with AI-powered space data (PixelSpace)
- **Interactive Charts**: Visualize data with pixel art styled charts
- **Langflow Integration**: Powered by Langflow agents with MCP and OpenRAG
- **Real-time Updates**: Get instant responses to your queries
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Architecture

```
PixelTicker/
├── app/
│   ├── page.tsx              # Main UI with state management
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Cyberpunk pixel art theme
│   └── api/
│       └── ask-stock/
│           └── route.ts      # API proxy to Langflow
├── components/
│   ├── StockChart.tsx        # Chart.js pixel art charts
│   ├── QuestionInput.tsx     # Input with example questions
│   ├── MessageHistory.tsx    # Q&A conversation display
│   └── LoadingSpinner.tsx    # Pixel art loading animation
├── services/
│   └── langflow.ts           # Langflow API client
└── types/
    └── index.ts              # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Langflow instance running on port 7861
- Stock MCP server configured in Langflow

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd pixelticker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy the example environment file and configure it:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and set your values:
   ```env
   # Authentication (REQUIRED - minimum 8 characters)
   AUTH_PASSWORD=your_secure_password_here
   
   # Langflow Configuration (REQUIRED)
   LANGFLOW_URL=http://localhost:7861
   LANGFLOW_API_KEY=your_langflow_api_key
   
   # EverArt Configuration (REQUIRED)
   EVERART_API_KEY=your_everart_api_key
   
   # Optional: Flow IDs for different themes
   # LANGFLOW_FLOW_ID_TICKER=your_ticker_flow_id
   # LANGFLOW_FLOW_ID_SPACE=your_space_flow_id
   ```
   
   **Important Security Notes:**
   - Set a strong password for `AUTH_PASSWORD` (minimum 8 characters, 12+ recommended for production)
   - All required environment variables are validated at startup
   - In development mode, localhost and private IPs are allowed for `LANGFLOW_URL`
   - In production mode, `LANGFLOW_URL` must be a public URL (SSRF protection)
   - Never commit `.env.local` to version control
   - See `.env.example` for detailed documentation

4. **Update Langflow Flow ID:**
   
   Open `services/langflow.ts` and replace `your-flow-id` with your actual Langflow flow ID:
   ```typescript
   `${LANGFLOW_URL}/api/v1/run/your-actual-flow-id`
   ```

### Running the App

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

The app will be available at `http://localhost:3000`

### 🔐 Authentication

On first visit, you'll see a cyberpunk-styled authentication page with two access options:

#### Full Authentication
Enter the password you set in `AUTH_PASSWORD` to get full access to all features including test pages.

#### Guest Access
Click "GUEST ACCESS" for limited access to main application features. Guest users can:
- ✅ Use PixelTicker (stock analysis)
- ✅ Use PixelSpace (space exploration)
- ✅ Access all main features
- ❌ Cannot access test pages (`/test-*` routes)

**Security Features:**
- Rate limiting (5 attempts per minute per IP)
- Secure httpOnly cookies
- Session management
- Two-tier access control (authenticated vs guest)
- Test pages require full authentication
- User status indicator in header (AUTH/GUEST badge)
- Logout functionality

**Access Control:**
- **Public**: `/auth`, public assets, API auth endpoints
- **Guest or Authenticated**: Main app pages (`/`, PixelTicker, PixelSpace)
- **Authenticated Only**: Test pages (`/test-*`)

**To change the password:**
1. Update `AUTH_PASSWORD` in `.env.local`
2. Restart the development server
3. Clear your browser cookies or use incognito mode

**To logout:**
- Click the "LOGOUT" button in the header (visible on all pages)
- You'll be redirected to the authentication page

## 🎯 Usage

1. **Start your Langflow instance** on port 7861 with the stock MCP server configured
2. **Open PixelTicker** in your browser
3. **Ask stock questions** like:
   - "How has IBM's stock performed over the last 2 weeks?"
   - "What is Apple's current stock price?"
   - "Compare AAPL vs GOOGL performance"
   - "Show me Tesla stock trends"
4. **View results** in the pixel art chart and conversation history

## 🔒 Security

### Environment Variable Validation

All environment variables are validated at application startup to prevent security vulnerabilities:

**VULN-002 (Critical) - SSRF Protection:**
- `LANGFLOW_URL` is validated to prevent Server-Side Request Forgery (SSRF) attacks
- In **production mode**: Private IP addresses and localhost are blocked
- In **development mode**: Localhost and private IPs are allowed for local testing
- Only `http://` and `https://` protocols are permitted
- Blocked ranges in production: `127.x.x.x`, `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`, `169.254.x.x`, IPv6 private ranges

**VULN-003 (Critical) - API Key Validation:**
- `LANGFLOW_API_KEY` and `EVERART_API_KEY` must be non-empty
- Keys are validated at both startup and runtime
- Recommendation: Rotate API keys every 90 days

**Authentication:**
- `AUTH_PASSWORD` must be at least 8 characters (12+ recommended for production)
- Passwords are validated at startup
- Use strong, unique passwords

**Validation Behavior:**
- Application fails fast if required variables are missing or invalid
- Clear error messages guide configuration
- Warnings are shown for optional variables or weak configurations

**Development vs Production:**
```bash
# Development (.env.local)
NODE_ENV=development
LANGFLOW_URL=http://localhost:7861  # ✅ Allowed in development

# Production (.env.local)
NODE_ENV=production
LANGFLOW_URL=https://api.langflow.io  # ✅ Must be public URL
# LANGFLOW_URL=http://localhost:7861  # ❌ Blocked in production (SSRF protection)
```

For detailed security documentation, see `.env.example`.

## 🎨 Design Theme

- **Colors**: Neon cyan (#00ff9f) and magenta (#ff00ff) on dark backgrounds
- **Font**: Press Start 2P (retro pixel font from Google Fonts)
- **Style**: Cyberpunk pixel art with glowing effects
- **Charts**: Pixelated line charts with no curves for authentic retro feel

## 🔧 Configuration

### Langflow Setup

Your Langflow flow should:
1. Accept text input (stock questions)
2. Use MCP tools to fetch stock data
3. Return responses with:
   - Text answer
   - Optional structured stock data (array of {date, price, volume})

### Response Format

The app expects Langflow responses in this format:
```json
{
  "outputs": [{
    "outputs": [{
      "results": {
        "message": {
          "text": "Answer text here",
          "data": [
            {"date": "2024-01-01", "price": 150.25, "volume": 1000000},
            ...
          ]
        }
      }
    }]
  }]
}
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **Font**: Press Start 2P (Google Fonts)

## 📝 API Routes

### POST /api/ask-stock

Ask a stock-related question.

**Request:**
```json
{
  "question": "How has IBM's stock performed?"
}
```

**Response:**
```json
{
  "answer": "IBM stock has...",
  "stockData": [...],
  "symbol": "IBM"
}
```

## 🐛 Troubleshooting

### Langflow Connection Issues

- Verify Langflow is running on port 7861
- Check the flow ID in `services/langflow.ts`
- Ensure CORS is enabled in Langflow

### Chart Not Displaying

- Verify stock data is in the correct format
- Check browser console for errors
- Ensure Chart.js is properly registered

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## 🤝 Contributing

This is a demo application. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🎮 Demo Queries

Try these example questions:
- "How has IBM's stock performed over the last 2 weeks?"
- "What is Apple's current stock price?"
- "Compare AAPL vs GOOGL performance this month"
- "Show me Tesla stock trends for the past week"
- "What's the volume for Microsoft stock today?"

---

**Built with ❤️ using Next.js, Langflow, and MCP**
