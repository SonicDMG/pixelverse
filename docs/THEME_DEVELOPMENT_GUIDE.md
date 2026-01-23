# 🎨 Theme Development Guide

> **A comprehensive guide to adding new themes to PixelTicker**

## 📋 Table of Contents

1. [Introduction](#-introduction)
2. [Quick Start Guide](#-quick-start-guide)
3. [Theme Configuration](#-theme-configuration)
4. [Directory Structure](#-directory-structure)
5. [Step-by-Step Tutorial](#-step-by-step-tutorial)
6. [Best Practices](#-best-practices)
7. [Troubleshooting](#-troubleshooting)
8. [Reference](#-reference)

---

## 🌟 Introduction

### Overview

PixelTicker features a **fully extensible theme architecture** that allows you to create custom themed experiences with minimal effort. Each theme provides:

- 🎨 **Custom color palettes** - Define your own retro-futuristic color schemes
- 🎵 **Background music** - Add theme-specific audio tracks
- 🤖 **AI-powered interactions** - Connect to custom API endpoints
- 💬 **Example questions** - Guide users with relevant prompts
- 🎭 **Visual identity** - Icons, taglines, and branding

### Benefits

- ✅ **Modular Design** - Themes are completely isolated and self-contained
- ✅ **Type-Safe** - Full TypeScript support with validation
- ✅ **Hot-Swappable** - Switch themes instantly via URL parameters
- ✅ **Zero Core Changes** - Add themes without modifying existing code
- ✅ **Consistent API** - All themes follow the same interface

### Time Estimate

⏱️ **~10 minutes** to add a fully functional new theme (excluding music file preparation)

---

## 🚀 Quick Start Guide

### Adding a "Medical" Theme Example

Here's what you'll do to add a medical/healthcare themed version:

1. **Add theme configuration** to `constants/theme-registry.ts`
2. **Create music directory** at `public/audio/music/medical/`
3. **Add music files** (2-3 background tracks)
4. **Create API endpoint** at `app/api/ask-medical/route.ts`
5. **Test your theme** by visiting `/?app=medical`

That's it! The system handles everything else automatically.

---

## 🔧 Theme Configuration

### The `ThemeConfig` Interface

Every theme must implement the `ThemeConfig` interface defined in `constants/theme-registry.ts`:

```typescript
export interface ThemeConfig {
  // Required: Unique identifier (lowercase, no spaces)
  id: string;
  
  // Required: Display name shown in UI
  name: string;
  
  // Required: Subtitle/tagline text
  tagline: string;
  
  // Required: API route for this theme's queries
  apiEndpoint: string;
  
  // Required: Music folder name (matches directory in public/audio/music/)
  musicDirectory: string;
  
  // Optional: Emoji/icon for UI representation
  icon?: string;
  
  // Required: Color palette configuration
  colors: {
    primary: string;        // Main brand color
    secondary: string;      // Secondary accent
    accent: string;         // Highlight color
    neonCyan: string;       // Cyan neon effect
    neonMagenta: string;    // Magenta neon effect
    neonBlue: string;       // Blue neon effect
    neonYellow: string;     // Yellow neon effect
    darkBg: string;         // Main background
    darkerBg: string;       // Deeper background
    cardBg: string;         // Card/panel background
    error: string;          // Error state color
  };
  
  // Required: Font configuration
  fonts: {
    pixel: string;          // Pixel font family
  };
  
  // Required: Animation timing
  animations: {
    duration: {
      fast: number;         // Fast animations (ms)
      normal: number;       // Normal animations (ms)
      slow: number;         // Slow animations (ms)
    };
  };
  
  // Required: Audio settings
  audio: {
    soundEffectsVolume: number;  // Volume level (0.0 - 1.0)
  };
  
  // Required: Example questions for users
  exampleQuestions: string[];
}
```

### Example Configuration (Medical Theme)

```typescript
medical: {
  id: 'medical',
  name: 'PixelMed',
  tagline: 'RETRO HEALTH ANALYSIS POWERED BY LANGFLOW + MCP',
  apiEndpoint: '/api/ask-medical',
  musicDirectory: 'medical',
  icon: '🏥',
  colors: {
    primary: '#00ff88',      // Medical green
    secondary: '#00d4ff',    // Clean cyan
    accent: '#ff4444',       // Alert red
    neonCyan: '#00ffcc',
    neonMagenta: '#ff66cc',
    neonBlue: '#4488ff',
    neonYellow: '#ffee44',
    darkBg: '#0a1a0e',       // Dark green tint
    darkerBg: '#050f08',
    cardBg: '#1a2f1e',
    error: '#ff0000',
  },
  fonts: {
    pixel: "'Press Start 2P', monospace",
  },
  animations: {
    duration: {
      fast: 200,
      normal: 500,
      slow: 1500,
    },
  },
  audio: {
    soundEffectsVolume: 0.125,
  },
  exampleQuestions: [
    'What are the symptoms of the flu?',
    'Explain how vaccines work',
    'What is a healthy heart rate?',
    'Tell me about vitamin D benefits',
    'How does the immune system work?',
  ],
},
```

---

## 📁 Directory Structure

### File Locations

```
pixelticker/
├── constants/
│   └── theme-registry.ts          # ⭐ Add your theme here
├── app/
│   └── api/
│       └── ask-medical/           # ⭐ Create your API endpoint here
│           └── route.ts
└── public/
    └── audio/
        └── music/
            └── medical/           # ⭐ Add your music files here
                ├── track1.mp3
                ├── track2.mp3
                └── track3.mp3
```

### Music Files

- **Location**: `public/audio/music/{musicDirectory}/`
- **Format**: MP3 (recommended)
- **Quantity**: 2-5 tracks for variety
- **Naming**: Descriptive names (e.g., `Calm Ambience.mp3`)

### API Endpoints

- **Location**: `app/api/ask-{themeId}/route.ts`
- **Pattern**: Must match `apiEndpoint` in theme config
- **Method**: POST endpoint accepting `{ question: string }`

---

## 📖 Step-by-Step Tutorial

### Step 1: Add Theme to Registry

Open `constants/theme-registry.ts` and add your theme to the `THEME_REGISTRY` object:

```typescript
export const THEME_REGISTRY: Record<string, ThemeConfig> = {
  ticker: { /* existing ticker theme */ },
  space: { /* existing space theme */ },
  
  // ⭐ Add your new theme here
  medical: {
    id: 'medical',
    name: 'PixelMed',
    tagline: 'RETRO HEALTH ANALYSIS POWERED BY LANGFLOW + MCP',
    apiEndpoint: '/api/ask-medical',
    musicDirectory: 'medical',
    icon: '🏥',
    colors: {
      primary: '#00ff88',
      secondary: '#00d4ff',
      accent: '#ff4444',
      neonCyan: '#00ffcc',
      neonMagenta: '#ff66cc',
      neonBlue: '#4488ff',
      neonYellow: '#ffee44',
      darkBg: '#0a1a0e',
      darkerBg: '#050f08',
      cardBg: '#1a2f1e',
      error: '#ff0000',
    },
    fonts: {
      pixel: "'Press Start 2P', monospace",
    },
    animations: {
      duration: {
        fast: 200,
        normal: 500,
        slow: 1500,
      },
    },
    audio: {
      soundEffectsVolume: 0.125,
    },
    exampleQuestions: [
      'What are the symptoms of the flu?',
      'Explain how vaccines work',
      'What is a healthy heart rate?',
      'Tell me about vitamin D benefits',
      'How does the immune system work?',
    ],
  },
};
```

### Step 2: Add Music Files

1. Create the music directory:
   ```bash
   mkdir -p public/audio/music/medical
   ```

2. Add your MP3 files to the directory:
   ```bash
   public/audio/music/medical/
   ├── Calm Medical Ambience.mp3
   ├── Healing Frequencies.mp3
   └── Wellness Vibes.mp3
   ```

3. The system will automatically discover and play these tracks randomly.

### Step 3: Create API Endpoint

Create `app/api/ask-medical/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Error response interface
 */
interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * Medical query result interface
 */
interface MedicalQueryResult {
  answer: string;
  components?: Array<{
    type: string;
    props: Record<string, any>;
    id?: string;
  }>;
  error?: string;
}

/**
 * Validate and sanitize question input
 * Following OWASP security standards
 */
function validateQuestion(question: unknown): { 
  valid: boolean; 
  error?: string; 
  sanitized?: string 
} {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'Question is required and must be a string' };
  }

  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Question cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Question too long (max 500 characters)' };
  }

  // Basic sanitization - remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  return { valid: true, sanitized };
}

/**
 * Mock medical responses for development
 * TODO: Replace with actual Langflow integration
 */
function getMockMedicalResponse(question: string): MedicalQueryResult {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('flu') || lowerQuestion.includes('influenza')) {
    return {
      answer: 'The flu (influenza) is a contagious respiratory illness caused by influenza viruses. Common symptoms include fever, cough, sore throat, body aches, and fatigue. Most people recover within a week, but it can be serious for vulnerable populations.',
      components: [
        {
          type: 'metric-grid',
          props: {
            metrics: [
              { label: 'Incubation Period', value: '1-4 days', icon: '⏰' },
              { label: 'Contagious Period', value: '5-7 days', icon: '🦠' },
              { label: 'Recovery Time', value: '1-2 weeks', icon: '💊' },
              { label: 'Vaccine Effectiveness', value: '40-60%', icon: '💉' }
            ]
          }
        }
      ]
    };
  }
  
  // Default response
  return {
    answer: 'I can help you with health and medical information! Ask me about symptoms, treatments, preventive care, or general health topics.',
    components: [
      {
        type: 'alert-box',
        props: {
          message: 'Try asking about common health conditions, symptoms, or wellness tips!',
          severity: 'info',
          title: 'Medical Assistant Ready'
        }
      }
    ]
  };
}

/**
 * POST /api/ask-medical
 * Handle medical/health related questions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    // Validate and sanitize input
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Langflow integration
    const result = getMockMedicalResponse(validation.sanitized!);

    if (result.error) {
      return NextResponse.json<ApiErrorResponse>(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Medical API] Route error:', error);
    
    const errorMessage = process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Internal server error';
    
    const response: ApiErrorResponse = {
      error: 'Internal server error',
    };

    if (process.env.NODE_ENV === 'development') {
      response.details = errorMessage;
    }

    return NextResponse.json(response, { status: 500 });
  }
}
```

### Step 4: Test Your Theme

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit your theme in the browser:
   ```
   http://localhost:3000/?app=medical
   ```

3. Test the functionality:
   - ✅ Theme colors should be applied
   - ✅ Background music should play
   - ✅ Example questions should appear
   - ✅ API endpoint should respond to queries
   - ✅ Theme switcher should show your theme

### Step 5: (Optional) Add Custom Components

If your theme needs special UI components, you can create them in `components/dynamic/`:

```typescript
// components/dynamic/HealthMetricCard.tsx
export function HealthMetricCard({ metric, value, unit, status }: Props) {
  return (
    <div className="health-metric-card">
      <h3>{metric}</h3>
      <div className="value">{value} {unit}</div>
      <div className={`status ${status}`}>{status}</div>
    </div>
  );
}
```

Then reference it in your API responses:

```typescript
components: [
  {
    type: 'health-metric-card',
    props: {
      metric: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'normal'
    }
  }
]
```

---

## ✨ Best Practices

### Naming Conventions

- **Theme ID**: Lowercase, no spaces (e.g., `medical`, `crypto`, `gaming`)
- **Theme Name**: PascalCase with "Pixel" prefix (e.g., `PixelMed`, `PixelCrypto`)
- **Music Directory**: Same as theme ID
- **API Endpoint**: `/api/ask-{themeId}`

### Color Palette Selection

1. **Choose a primary color** that represents your theme's identity
2. **Maintain contrast** - Ensure text is readable on backgrounds
3. **Use neon colors** for the retro-futuristic aesthetic
4. **Test in dark mode** - All themes use dark backgrounds
5. **Consider accessibility** - Follow WCAG guidelines for contrast ratios

**Color Palette Tools:**
- [Coolors.co](https://coolors.co/) - Generate color schemes
- [Adobe Color](https://color.adobe.com/) - Color wheel and harmony rules
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verify accessibility

### Example Questions Guidelines

1. **Be specific** - "What is the current price of AAPL?" vs "Tell me about stocks"
2. **Show variety** - Cover different aspects of your theme
3. **Keep it simple** - Questions should be clear and concise
4. **5-7 questions** - Enough variety without overwhelming users
5. **Test them** - Ensure your API can handle each example

### Music Selection Tips

1. **Match the mood** - Music should complement your theme's atmosphere
2. **Instrumental preferred** - Avoid vocals that might distract
3. **Consistent volume** - Normalize audio levels across tracks
4. **Loop-friendly** - Tracks should transition smoothly
5. **Royalty-free** - Use licensed or original music only

**Music Resources:**
- [Pixabay Music](https://pixabay.com/music/) - Free music library
- [Free Music Archive](https://freemusicarchive.org/) - Creative Commons music
- [Incompetech](https://incompetech.com/) - Royalty-free music by Kevin MacLeod

---

## 🔍 Troubleshooting

### Common Issues

#### Theme Not Appearing in Switcher

**Problem**: Your theme doesn't show up in the app switcher.

**Solution**: 
1. Verify the theme is added to `THEME_REGISTRY` in `constants/theme-registry.ts`
2. Check that the theme ID is unique
3. Restart the development server
4. Clear browser cache

#### Music Not Playing

**Problem**: Background music doesn't play for your theme.

**Solution**:
1. Verify music files are in `public/audio/music/{musicDirectory}/`
2. Check file format (MP3 recommended)
3. Ensure `musicDirectory` in theme config matches folder name
4. Check browser console for 404 errors
5. Verify file permissions

#### API Endpoint Not Found

**Problem**: Getting 404 errors when asking questions.

**Solution**:
1. Verify API route file exists at `app/api/ask-{themeId}/route.ts`
2. Check that `apiEndpoint` in theme config matches the route path
3. Ensure the file exports a `POST` function
4. Restart the development server

#### Colors Not Applying

**Problem**: Theme colors aren't showing correctly.

**Solution**:
1. Verify all required color properties are defined
2. Check color format (use hex codes: `#00ff9f`)
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
4. Inspect elements in browser DevTools to verify CSS variables

### Validation Errors

The system includes built-in validation. If you see validation errors:

```typescript
// Use the validateThemeConfig function to check your theme
import { validateThemeConfig } from '@/constants/theme-registry';

const isValid = validateThemeConfig(myTheme);
console.log('Theme valid:', isValid);
```

**Common validation failures:**
- Missing required properties
- Invalid color format
- Wrong data types (string vs number)
- Empty arrays or objects
- Invalid animation duration values

### Debugging Theme Loading

Add console logs to track theme loading:

```typescript
// In your component
const { theme, appMode } = useTheme();
console.log('Current theme:', appMode);
console.log('Theme config:', theme);
console.log('Available themes:', availableThemes);
```

Check the browser console for:
- Theme validation warnings
- API endpoint errors
- Music loading errors
- Component rendering issues

---

## 📚 Reference

### Key Files

- **Theme Registry**: [`constants/theme-registry.ts`](../constants/theme-registry.ts)
  - Central theme configuration
  - Theme validation functions
  - Helper utilities

- **Theme Context**: [`contexts/ThemeContext.tsx`](../contexts/ThemeContext.tsx)
  - React context for theme state
  - Theme switching logic
  - URL parameter handling

- **Example Themes**:
  - Ticker Theme: See `THEME_REGISTRY.ticker` in theme-registry.ts
  - Space Theme: See `THEME_REGISTRY.space` in theme-registry.ts

### API Endpoint Patterns

All API endpoints should follow this pattern:

```typescript
// app/api/ask-{themeId}/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;
    
    // 1. Validate input
    // 2. Process question (call Langflow, external API, etc.)
    // 3. Return structured response
    
    return NextResponse.json({
      answer: 'Your answer here',
      components: [/* Optional UI components */]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Response Format

API endpoints should return:

```typescript
{
  answer: string;              // Main text response
  components?: Array<{         // Optional UI components
    type: string;              // Component type (e.g., 'metric-grid')
    props: Record<string, any>; // Component props
    id?: string;               // Optional unique ID
  }>;
  error?: string;              // Error message if applicable
}
```

### Available Component Types

- `metric-grid` - Grid of metric cards
- `metric-card` - Single metric display
- `data-table` - Tabular data
- `comparison-table` - Side-by-side comparison
- `comparison-chart` - Visual comparison chart
- `alert-box` - Info/warning/error messages

### Helper Functions

```typescript
// From constants/theme-registry.ts
getTheme(themeId: string): ThemeConfig | undefined
getAllThemes(): ThemeConfig[]
getThemeIds(): string[]
isValidThemeId(id: string): boolean
validateThemeConfig(config: Partial<ThemeConfig>): boolean
```

### URL Parameters

- `?app=themeId` - Switch to a specific theme
- Example: `http://localhost:3000/?app=medical`

---

## 🎉 Conclusion

You now have everything you need to create custom themes for PixelTicker! The extensible architecture makes it easy to add new themed experiences without touching core application code.

**Next Steps:**
1. Choose your theme concept
2. Design your color palette
3. Gather music tracks
4. Follow the step-by-step tutorial
5. Test thoroughly
6. Share your creation!

**Need Help?**
- Check existing themes for reference
- Review the troubleshooting section
- Examine the TypeScript interfaces for type safety
- Use the validation functions to catch errors early

Happy theming! 🚀

---

*Made with Bob* 🤖