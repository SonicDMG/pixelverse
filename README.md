<div align="center">

<pre style="font-family: monospace; line-height: 1.2;">
<span style="color: #ff00ff;">████████████████████████████████████████████████████████████████████████████████</span>
<span style="color: #ff00ff;">█</span>                                                                              <span style="color: #ff00ff;">█</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">██████╗ ██╗██╗  ██╗███████╗██╗</span>     <span style="color: #00d4ff;">██╗   ██╗███████╗██████╗ ███████╗███████╗</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">██╔══██╗██║╚██╗██╔╝██╔════╝██║</span>     <span style="color: #00d4ff;">██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">██████╔╝██║ ╚███╔╝ █████╗  ██║</span>     <span style="color: #00d4ff;">██║   ██║█████╗  ██████╔╝███████╗█████╗</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║</span>     <span style="color: #00d4ff;">╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">██║     ██║██╔╝ ██╗███████╗███████╗</span> <span style="color: #00d4ff;">╚████╔╝ ███████╗██║  ██║███████║███████╗</span>
<span style="color: #ff00ff;">█</span>  <span style="color: #00ff9f;">╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝</span>  <span style="color: #00d4ff;">╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝</span>
<span style="color: #ff00ff;">█</span>                                                                              <span style="color: #ff00ff;">█</span>
<span style="color: #ff00ff;">████████████████████████████████████████████████████████████████████████████████</span>
</pre>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&duration=3000&pause=1000&color=00FF9F&center=true&vCenter=true&width=800&lines=Welcome+to+the+PixelVerse;Your+gateway+to+a+retro+agentic+experience;Powered+by+Langflow+%7C+MCP+%7C+OpenRAG" alt="Typing SVG" />

</div>

<div align="center">

**Welcome to the <span style="color: #00ff9f;">Pixel</span><span style="color: #00d4ff;">Verse</span>.** Your gateway to a retro agentic experience where cyberpunk aesthetics meet cutting-edge AI. Powered by [Langflow](https://github.com/langflow-ai/langflow), [MCP](https://modelcontextprotocol.io), and [OpenRAG](https://github.com/langflow-ai/openrag).

<br/>

[![OpenRAG](https://img.shields.io/badge/OpenRAG-Powered-orange?style=for-the-badge&logo=github)](https://github.com/langflow-ai/openrag)
[![Langflow](https://img.shields.io/badge/Langflow-Integration-purple?style=for-the-badge&logo=github)](https://github.com/langflow-ai/langflow)
![PixelTicker](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

---

<table align="center">
<tr>
<td width="45%" align="center" valign="top">

### 📈 PixelTicker

<img src="public/images/pixel-ticker.png" alt="PixelTicker App" width="100%" />

**Stock Analysis** • Ask natural language questions about stock performance with AI-powered insights and pixel art styled charts

</td>
<td width="10%"></td>
<td width="45%" align="center" valign="top">

### 🌌 PixelSpace

<img src="public/images/pixel-space.png" alt="PixelSpace App" width="100%" />

**Space Exploration** • Explore the cosmos with AI-powered space data, celestial visualizations, and interactive timelines

</td>
</tr>
</table>

<div align="center">
<img src="public/images/pixel-space-orbit.gif" alt="PixelSpace Orbit Animation" width="100%" />
</div>

## 🚀 Quick Start

### Prerequisites
- `Node.js 18+` installed
- `npm` or `yarn` package manager

### Installation

**[STEP 1]** Install dependencies:
```bash
$ npm install
# Installing PixelVerse dependencies...
# ████████████████████████████████████████ 100%
```

**[STEP 2]** Configure environment:
```bash
$ cp .env.example .env.local
# Environment template copied
# Edit .env.local with your API keys
```
📝 See [Configuration](#-configuration) for detailed setup

**[STEP 3]** Launch application:
```bash
$ npm run dev
# Starting PixelVerse development server...
# ✓ Ready on http://localhost:3000
```

<div align="center">

```diff
+ ACCESS GRANTED
```

🌐 Navigate to `http://localhost:3000`

Click **"GUEST ACCESS"** to enter the PixelVerse

</div>

> 💡 **GUEST MODE**: Full access to PixelTicker & PixelSpace • No authentication required
> 🔐 **FULL AUTH**: Includes test pages • See [Authentication](#-authentication)

```
═══════════════════════════════════════════════════════════════════════════════
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Charts**: Chart.js + react-chartjs-2
- **Font**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)

## ⚙️ Configuration

### Environment Variables

Copy the example environment file and configure it:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your values:
```js
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
- See `.env.example` for detailed documentation

### Langflow Setup

**Prerequisites:**
- Langflow instance running on port 7861
- Stock MCP server configured in Langflow

**Update Flow ID:**
Open `services/langflow.ts` and replace `your-flow-id` with your actual Langflow flow ID:
```typescript
`${LANGFLOW_URL}/api/v1/run/your-actual-flow-id`
```

## 🔐 Authentication

<div align="center">
<img src="public/images/login.png" alt="PixelVerse Login Screen" width="70%" />
</div>

<br/>

On first visit, you'll see an authentication page with two access options:

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
```js
# Development (.env.local)
NODE_ENV=development
LANGFLOW_URL=http://localhost:7861  # ✅ Allowed in development

# Production (.env.local)
NODE_ENV=production
LANGFLOW_URL=https://api.langflow.io  # ✅ Must be public URL
# LANGFLOW_URL=http://localhost:7861  # ❌ Blocked in production (SSRF protection)
```

For detailed security documentation, see `.env.example`.

## 🤝 Contributing

This is a demo application. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using Next.js, Langflow, and MCP**
