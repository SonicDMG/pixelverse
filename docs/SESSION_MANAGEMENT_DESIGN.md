# Session Management Design Document

## Executive Summary

This document outlines a comprehensive session management strategy for the PixelTicker application to enable multi-turn conversations with Langflow. The current implementation generates a new UUID on every API call, breaking conversation context. This design introduces client-side session management with proper lifecycle controls.

**Problem Statement:**
- UUIDs are generated server-side in [`services/langflow.ts:125`](../services/langflow.ts#L125) using `randomUUID()`
- Each API call creates a new session, preventing follow-up questions
- No session persistence across multiple interactions
- Langflow's `session_id` parameter is not being utilized effectively

**Solution Overview:**
- Move UUID generation to the client side
- Implement session lifecycle management with clear creation/reset triggers
- Pass session IDs through API routes to Langflow
- Provide user controls for session management

---

## 1. Session Lifecycle Management

### 1.1 Session Creation Triggers

A new session should be created in the following scenarios:

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION CREATION EVENTS                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Initial Page Load (First Visit)                         │
│     └─> Generate UUID on component mount                    │
│                                                              │
│  2. Theme Switch (ticker ↔ space)                           │
│     └─> Different themes = different conversation contexts  │
│                                                              │
│  3. Manual Session Reset                                     │
│     └─> User clicks "CLEAR" button                          │
│                                                              │
│  4. Page Refresh (Browser Reload)                           │
│     └─> New session for fresh start                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Session Persistence Rules

**Within a Session:**
- Session ID persists across multiple questions
- Conversation history maintained in UI state
- Follow-up questions reference previous context

**Session Boundaries:**
- Sessions are **NOT** persisted to localStorage (intentional design choice)
- Each page refresh starts fresh (prevents stale context issues)
- Theme switches create new sessions (different domains require different contexts)

### 1.3 Session Lifecycle Diagram

```
┌──────────────┐
│  Page Load   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Generate Session ID  │
│ (crypto.randomUUID) │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    ACTIVE SESSION                        │
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐   │
│  │ Question 1 │───>│ Question 2 │───>│ Question 3 │   │
│  └────────────┘    └────────────┘    └────────────┘   │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│              Same session_id passed                     │
│              to all API calls                           │
└─────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  Session End Event:  │
│  - Theme Switch      │
│  - Clear Button      │
│  - Page Refresh      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate New Session │
└──────────────────────┘
```

---

## 2. Client-Side Architecture

### 2.1 Session Storage Strategy

**Approach: React Context + Custom Hook**

We'll use React Context to manage session state globally, combined with a custom hook for easy access.

```
┌─────────────────────────────────────────────────────────┐
│                   COMPONENT HIERARCHY                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  <SessionProvider>                                       │
│    │                                                     │
│    ├─> Manages session_id state                         │
│    ├─> Provides resetSession() function                 │
│    ├─> Listens to theme changes                         │
│    │                                                     │
│    └─> <ThemeProvider>                                  │
│          │                                               │
│          └─> <Home> (page.tsx)                          │
│                │                                         │
│                ├─> <QuestionInput>                      │
│                │     └─> Calls API with session_id      │
│                │                                         │
│                └─> <ConversationGroup>                  │
│                      └─> Displays conversation          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 New Files to Create

#### File: `contexts/SessionContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from './ThemeContext';

interface SessionContextType {
  sessionId: string;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { appMode } = useTheme();
  const [sessionId, setSessionId] = useState<string>('');

  // Generate initial session ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      setSessionId(window.crypto.randomUUID());
    }
  }, []);

  // Reset session when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      setSessionId(window.crypto.randomUUID());
      console.log('[Session] New session created for theme:', appMode);
    }
  }, [appMode]);

  const resetSession = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      const newSessionId = window.crypto.randomUUID();
      setSessionId(newSessionId);
      console.log('[Session] Session manually reset:', newSessionId);
    }
  };

  return (
    <SessionContext.Provider value={{ sessionId, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
```

#### File: `hooks/useSession.ts` (Alternative Approach)

If we prefer a hook-based approach without Context:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function useSession() {
  const { appMode } = useTheme();
  const [sessionId, setSessionId] = useState<string>('');

  // Generate initial session ID
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      setSessionId(window.crypto.randomUUID());
    }
  }, []);

  // Reset session when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      setSessionId(window.crypto.randomUUID());
      console.log('[Session] New session for theme:', appMode);
    }
  }, [appMode]);

  const resetSession = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      const newSessionId = window.crypto.randomUUID();
      setSessionId(newSessionId);
      console.log('[Session] Session reset:', newSessionId);
    }
  };

  return { sessionId, resetSession };
}
```

### 2.3 UUID Generation Strategy

**Browser API: `crypto.randomUUID()`**

- Available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+)
- Generates RFC 4122 version 4 UUIDs
- Cryptographically secure
- No external dependencies required

**Fallback Strategy:**

```typescript
function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback for older browsers (unlikely in 2026)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## 3. API Layer Changes

### 3.1 Modified Request Flow

```
┌──────────────┐
│   Client     │
│  (page.tsx)  │
└──────┬───────┘
       │
       │ POST /api/ask-stock or /api/ask-space
       │ Body: { question, session_id }
       │
       ▼
┌─────────────────────┐
│   API Route         │
│  (route.ts)         │
│                     │
│  1. Validate input  │
│  2. Extract params  │
│  3. Pass to service │
└──────┬──────────────┘
       │
       │ queryLangflow(question, theme, session_id)
       │
       ▼
┌─────────────────────┐
│  Langflow Service   │
│  (langflow.ts)      │
│                     │
│  1. Build payload   │
│  2. Include session │
│  3. Send to API     │
└──────┬──────────────┘
       │
       │ POST to Langflow API
       │ { input_value, session_id, ... }
       │
       ▼
┌─────────────────────┐
│   Langflow API      │
│                     │
│  Maintains context  │
│  using session_id   │
└─────────────────────┘
```

### 3.2 Service Layer Modifications

#### File: `services/langflow.ts`

**Current Implementation (Line 111-126):**
```typescript
export async function queryLangflow(question: string, theme: LangflowTheme = 'ticker'): Promise<StockQueryResult> {
  // ...
  const payload = {
    ...request,
    session_id: randomUUID(), // ❌ PROBLEM: New UUID every time
  };
  // ...
}
```

**New Implementation:**
```typescript
export async function queryLangflow(
  question: string, 
  theme: LangflowTheme = 'ticker',
  sessionId?: string  // ✅ NEW: Accept session ID from client
): Promise<StockQueryResult> {
  try {
    const flowId = getFlowIdForTheme(theme);

    const request: LangflowRequest = {
      input_value: question,
      output_type: 'chat',
      input_type: 'chat',
    };

    // Use provided session ID or generate fallback (for backward compatibility)
    const payload = {
      ...request,
      session_id: sessionId || randomUUID(),
    };

    // Log session info for debugging
    console.log('[Langflow] Using session_id:', payload.session_id);
    console.log('[Langflow] Session provided by client:', !!sessionId);

    // ... rest of implementation
  }
}
```

### 3.3 API Route Modifications

#### File: `app/api/ask-stock/route.ts`

**Current Implementation (Line 36-51):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    const result = await queryLangflow(validation.sanitized!, 'ticker');
    // ...
  }
}
```

**New Implementation:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, session_id } = body;  // ✅ NEW: Extract session_id

    // Validate question
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    // Validate session_id (optional but recommended)
    if (session_id && typeof session_id !== 'string') {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'session_id must be a string' },
        { status: 400 }
      );
    }

    // Pass session_id to Langflow
    const result = await queryLangflow(
      validation.sanitized!, 
      'ticker',
      session_id  // ✅ NEW: Pass session ID
    );

    if (result.error) {
      return NextResponse.json<ApiErrorResponse>(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    // ... error handling
  }
}
```

#### File: `app/api/ask-space/route.ts`

Apply the same modifications as `ask-stock/route.ts`:

```typescript
// Line 688-713 (modified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, session_id } = body;  // ✅ NEW: Extract session_id

    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: validation.error! },
        { status: 400 }
      );
    }

    // Validate session_id
    if (session_id && typeof session_id !== 'string') {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'session_id must be a string' },
        { status: 400 }
      );
    }

    let result: SpaceQueryResult;
    
    try {
      result = await queryLangflow(
        validation.sanitized!, 
        'space',
        session_id  // ✅ NEW: Pass session ID
      );
    } catch (error) {
      // Fallback to mock responses
      result = getMockSpaceResponse(validation.sanitized!);
    }
    
    // ... rest of implementation
  }
}
```

### 3.4 Client-Side API Calls

#### File: `app/page.tsx`

**Current Implementation (Line 122-125):**
```typescript
const response = await axios.post<StockQueryResult>(theme.apiEndpoint, {
  question: questionText,
});
```

**New Implementation:**
```typescript
// Import useSession hook
import { useSession } from '@/hooks/useSession';

// In component
const { sessionId } = useSession();

// In handleQuestion function (Line 122-125)
const response = await axios.post<StockQueryResult>(theme.apiEndpoint, {
  question: questionText,
  session_id: sessionId,  // ✅ NEW: Include session ID
});
```

---

## 4. User Experience Considerations

### 4.1 Session Indicators (Optional Enhancement)

**Visual Feedback Options:**

1. **Subtle Session ID Display** (Developer Mode)
   ```
   ┌─────────────────────────────────────────┐
   │  SESSION: abc123...  [RESET]            │
   └─────────────────────────────────────────┘
   ```

2. **Conversation Context Indicator**
   ```
   ┌─────────────────────────────────────────┐
   │  💬 Conversation Active (3 messages)    │
   └─────────────────────────────────────────┘
   ```

3. **No Visual Indicator** (Recommended)
   - Keep UI clean and simple
   - Session management happens transparently
   - Users don't need to understand technical details

**Recommendation:** Start with no visual indicator. Add only if user testing reveals confusion about conversation context.

### 4.2 Session Reset Controls

**Current "CLEAR" Button Behavior:**
- Clears conversation history from UI
- Does NOT reset session (currently)

**New "CLEAR" Button Behavior:**
```typescript
const handleClearConversation = useCallback(() => {
  setConversationGroups([]);
  setError(null);
  resetSession();  // ✅ NEW: Also reset session
}, [resetSession]);
```

**Alternative: Separate Controls**
```
┌──────────────────────────────────────────────┐
│  [CLEAR CHAT]  [NEW CONVERSATION]            │
└──────────────────────────────────────────────┘
     │                  │
     │                  └─> Resets session + clears UI
     └─> Clears UI only (keeps session for context)
```

**Recommendation:** Combine both actions in the existing "CLEAR" button for simplicity.

### 4.3 Error Handling

**Session-Related Errors:**

1. **Missing Session ID**
   - Fallback: Generate server-side UUID (backward compatibility)
   - Log warning for debugging

2. **Invalid Session ID Format**
   - Return 400 Bad Request
   - Message: "Invalid session identifier"

3. **Expired Session (Langflow-side)**
   - Langflow may expire old sessions
   - Client automatically creates new session on next request
   - No user intervention needed

**Error Recovery Flow:**
```
┌─────────────────────────────────────────────────────────┐
│  API Call with session_id                               │
└─────────────┬───────────────────────────────────────────┘
              │
              ▼
        ┌─────────────┐
        │  Success?   │
        └─────┬───┬───┘
              │   │
         Yes  │   │  No
              │   │
              ▼   ▼
         ┌────────────┐      ┌──────────────────────┐
         │  Display   │      │  Session expired?    │
         │  Response  │      └─────┬────────────────┘
         └────────────┘            │
                                   ▼
                            ┌──────────────────┐
                            │  Auto-generate   │
                            │  new session_id  │
                            │  Retry request   │
                            └──────────────────┘
```

---

## 5. Implementation Strategy

### 5.1 Implementation Phases

#### Phase 1: Core Session Management (Priority: HIGH)
**Estimated Effort:** 2-3 hours

1. Create `hooks/useSession.ts` with session generation logic
2. Modify `services/langflow.ts` to accept `sessionId` parameter
3. Update API routes to extract and pass `session_id`
4. Update `app/page.tsx` to use session hook and pass ID to API

**Files to Modify:**
- ✅ Create: `hooks/useSession.ts`
- ✅ Modify: `services/langflow.ts` (add sessionId parameter)
- ✅ Modify: `app/api/ask-stock/route.ts` (extract and pass session_id)
- ✅ Modify: `app/api/ask-space/route.ts` (extract and pass session_id)
- ✅ Modify: `app/page.tsx` (use session hook, pass to API)

#### Phase 2: Session Reset Integration (Priority: MEDIUM)
**Estimated Effort:** 1 hour

1. Connect "CLEAR" button to `resetSession()` function
2. Add logging for session lifecycle events
3. Test session reset behavior

**Files to Modify:**
- ✅ Modify: `app/page.tsx` (connect CLEAR button to resetSession)

#### Phase 3: Testing & Validation (Priority: HIGH)
**Estimated Effort:** 2-3 hours

1. Test multi-turn conversations
2. Verify session persistence across questions
3. Test session reset on theme switch
4. Test session reset on CLEAR button
5. Verify backward compatibility (API works without session_id)

#### Phase 4: Optional Enhancements (Priority: LOW)
**Estimated Effort:** 2-4 hours

1. Add session indicator UI (if needed)
2. Add session analytics/logging
3. Implement session timeout handling
4. Add session persistence to localStorage (if desired)

### 5.2 Testing Strategy

#### Unit Tests

```typescript
// hooks/useSession.test.ts
describe('useSession', () => {
  it('generates a session ID on mount', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('resets session when theme changes', () => {
    // Test implementation
  });

  it('resets session when resetSession is called', () => {
    // Test implementation
  });
});
```

#### Integration Tests

```typescript
// app/api/ask-stock/route.test.ts
describe('POST /api/ask-stock', () => {
  it('accepts and passes session_id to Langflow', async () => {
    const sessionId = crypto.randomUUID();
    const response = await POST({
      json: async () => ({ 
        question: 'What is AAPL?',
        session_id: sessionId 
      })
    });
    
    // Verify session_id was passed to Langflow
    expect(mockQueryLangflow).toHaveBeenCalledWith(
      'What is AAPL?',
      'ticker',
      sessionId
    );
  });

  it('works without session_id for backward compatibility', async () => {
    const response = await POST({
      json: async () => ({ question: 'What is AAPL?' })
    });
    
    expect(response.status).toBe(200);
  });
});
```

#### Manual Testing Checklist

- [ ] **Multi-turn conversation test**
  1. Ask initial question: "What is AAPL?"
  2. Ask follow-up: "What about its competitors?"
  3. Verify: Second response references Apple context

- [ ] **Theme switch test**
  1. Ask question in ticker mode
  2. Switch to space mode
  3. Ask question in space mode
  4. Verify: New session created (check console logs)

- [ ] **Clear button test**
  1. Have active conversation
  2. Click CLEAR button
  3. Ask new question
  4. Verify: New session ID in console logs

- [ ] **Page refresh test**
  1. Have active conversation
  2. Refresh browser
  3. Ask new question
  4. Verify: New session ID generated

- [ ] **Backward compatibility test**
  1. Call API without session_id
  2. Verify: Request succeeds with fallback UUID

### 5.3 Rollback Plan

If issues arise during implementation:

1. **Immediate Rollback:**
   - Revert `services/langflow.ts` to generate UUIDs server-side
   - Remove session_id from API route parameters
   - Remove useSession hook usage from page.tsx

2. **Partial Rollback:**
   - Keep session management code but make it optional
   - Add feature flag: `ENABLE_SESSION_MANAGEMENT=false`
   - Fallback to server-side UUID generation when disabled

3. **Data Safety:**
   - No database changes required
   - No data migration needed
   - Session state is ephemeral (no persistence)

---

## 6. API Contract Changes

### 6.1 Request Schema Changes

#### Before:
```typescript
POST /api/ask-stock
POST /api/ask-space

Body: {
  question: string
}
```

#### After:
```typescript
POST /api/ask-stock
POST /api/ask-space

Body: {
  question: string,
  session_id?: string  // Optional for backward compatibility
}
```

### 6.2 Backward Compatibility

**Guarantee:** All existing API clients will continue to work without modification.

**Compatibility Matrix:**

| Client Sends | Server Behavior | Result |
|--------------|-----------------|--------|
| `{ question }` | Generates UUID server-side | ✅ Works (legacy mode) |
| `{ question, session_id }` | Uses provided session_id | ✅ Works (new mode) |
| `{ question, session_id: null }` | Generates UUID server-side | ✅ Works (fallback) |
| `{ question, session_id: 123 }` | Returns 400 error | ❌ Invalid type |

### 6.3 Response Schema

**No changes to response schema.** All responses remain identical:

```typescript
{
  answer: string,
  stockData?: StockDataPoint[],
  symbol?: string,
  error?: string,
  components?: ComponentSpec[]
}
```

---

## 7. Architecture Diagrams

### 7.1 Current Architecture (Problem)

```
┌─────────────────────────────────────────────────────────────┐
│                      CURRENT FLOW                            │
└─────────────────────────────────────────────────────────────┘

User asks Q1 ──> API ──> Langflow (session: uuid-1)
                              │
                              └──> Response R1

User asks Q2 ──> API ──> Langflow (session: uuid-2) ❌ NEW SESSION
                              │
                              └──> Response R2 (no context from Q1)

PROBLEM: Each question gets a new session ID, breaking context
```

### 7.2 New Architecture (Solution)

```
┌─────────────────────────────────────────────────────────────┐
│                       NEW FLOW                               │
└─────────────────────────────────────────────────────────────┘

Page Load ──> Generate session_id: "abc-123"
                      │
                      ├──> Store in React state
                      │
User asks Q1 ──> API (session: abc-123) ──> Langflow
                                                  │
                                                  └──> Response R1

User asks Q2 ──> API (session: abc-123) ──> Langflow ✅ SAME SESSION
                                                  │
                                                  └──> Response R2 (has context from Q1)

User asks Q3 ──> API (session: abc-123) ──> Langflow ✅ SAME SESSION
                                                  │
                                                  └──> Response R3 (has context from Q1, Q2)

SOLUTION: Same session ID used for all questions in conversation
```

### 7.3 Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPONENT INTERACTIONS                       │
└────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   page.tsx      │
│                 │
│  useSession() ──┼──> Returns: { sessionId, resetSession }
│       │         │
│       │         │
│       ├─────────┼──> handleQuestion(question)
│       │         │         │
│       │         │         ├──> axios.post(apiEndpoint, {
│       │         │         │       question,
│       │         │         │       session_id: sessionId
│       │         │         │     })
│       │         │         │
│       │         │         └──> Receives response
│       │         │
│       └─────────┼──> handleClearConversation()
│                 │         │
│                 │         ├──> setConversationGroups([])
│                 │         └──> resetSession()
└─────────────────┘

┌─────────────────┐
│ useSession.ts   │
│                 │
│  - sessionId ───┼──> Generated on mount: crypto.randomUUID()
│  - resetSession ┼──> Generates new UUID
│                 │
│  useEffect() ───┼──> Watches appMode (theme)
│       │         │         │
│       └─────────┼─────────┴──> Resets session on theme change
└─────────────────┘

┌─────────────────┐
│  API Routes     │
│                 │
│  POST handler ──┼──> Extract { question, session_id }
│       │         │         │
│       └─────────┼─────────┴──> queryLangflow(question, theme, session_id)
└─────────────────┘

┌─────────────────┐
│  langflow.ts    │
│                 │
│  queryLangflow()┼──> Accepts sessionId parameter
│       │         │         │
│       └─────────┼─────────┴──> Includes in payload to Langflow API
└─────────────────┘
```

---

## 8. Security Considerations

### 8.1 UUID Security

**Threat Model:**
- UUIDs are not secret tokens
- Session IDs are visible in network traffic
- No authentication/authorization required for this use case

**Security Measures:**
1. **Use cryptographically secure UUIDs** (crypto.randomUUID())
2. **Validate UUID format** on server-side
3. **No sensitive data in session IDs**
4. **Rate limiting** on API endpoints (existing)
5. **Input sanitization** (existing)

### 8.2 OWASP Compliance

Following OWASP security standards:

1. **Input Validation:**
   ```typescript
   if (session_id && typeof session_id !== 'string') {
     return error('Invalid session_id type');
   }
   
   if (session_id && !isValidUUID(session_id)) {
     return error('Invalid session_id format');
   }
   ```

2. **No Session Hijacking Risk:**
   - Sessions are ephemeral (no persistence)
   - No authentication tied to sessions
   - No sensitive data in session context

3. **XSS Prevention:**
   - Session IDs never rendered in HTML
   - Only used in API calls
   - React's built-in XSS protection applies

### 8.3 Privacy Considerations

**Data Retention:**
- Session IDs are not logged to persistent storage
- Conversation history stored only in client memory
- No PII associated with sessions

**GDPR Compliance:**
- No personal data collected
- Sessions are anonymous
- No tracking across page loads

---

## 9. Performance Considerations

### 9.1 Impact Analysis

**Positive Impacts:**
- ✅ Reduced Langflow processing time (context reuse)
- ✅ Better response quality (conversation context)
- ✅ No additional network requests

**Neutral Impacts:**
- ➖ Minimal client-side memory overhead (one UUID string)
- ➖ Negligible computational cost (UUID generation)

**No Negative Impacts:**
- No additional API calls
- No database queries
- No increased payload size (UUID is ~36 bytes)

### 9.2 Scalability

**Client-Side:**
- UUID generation is O(1) operation
- No memory leaks (session ID is a simple string)
- Works with any number of concurrent users

**Server-Side:**
- No server-side session storage required
- Langflow handles session management internally
- Stateless API design maintained

---

## 10. Monitoring & Observability

### 10.1 Logging Strategy

**Client-Side Logs:**
```typescript
console.log('[Session] New session created:', sessionId);
console.log('[Session] Session reset:', newSessionId);
console.log('[Session] Theme changed, new session:', sessionId);
```

**Server-Side Logs:**
```typescript
console.log('[Langflow] Using session_id:', payload.session_id);
console.log('[Langflow] Session provided by client:', !!sessionId);
console.log('[Langflow] Fallback to server-generated UUID');
```

### 10.2 Metrics to Track

1. **Session Usage:**
   - % of requests with client-provided session_id
   - % of requests using server-generated fallback
   - Average questions per session

2. **Session Lifecycle:**
   - Session creation events (page load, theme switch, reset)
   - Average session duration
   - Questions per session distribution

3. **Error Rates:**
   - Invalid session_id format errors
   - Session-related API failures
   - Fallback activation rate

### 10.3 Debug Tools

**Browser Console Commands:**
```javascript
// Check current session ID
window.__DEBUG_SESSION_ID = sessionId;

// Force session reset
window.__DEBUG_RESET_SESSION = resetSession;

// View session history
window.__DEBUG_SESSION_HISTORY = [];
```

---

## 11. Future Enhancements

### 11.1 Session Persistence (Optional)

**Use Case:** Preserve conversations across page refreshes

**Implementation:**
```typescript
// Save to localStorage
useEffect(() => {
  if (sessionId) {
    localStorage.setItem('pixelticker_session_id', sessionId);
  }
}, [sessionId]);

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('pixelticker_session_id');
  if (saved) {
    setSessionId(saved);
  }
}, []);
```

**Considerations:**
- Add expiration timestamp (e.g., 24 hours)
- Clear on theme switch (different contexts)
- Provide "Start Fresh" option

### 11.2 Session Analytics

**Potential Metrics:**
- Conversation depth (questions per session)
- Topic switching patterns
- User engagement metrics
- Follow-up question rate

### 11.3 Multi-Tab Session Sharing

**Use Case:** Share session across multiple browser tabs

**Implementation:**
- Use localStorage for session ID
- Listen to storage events for sync
- Handle conflicts (last-write-wins)

### 11.4 Session Export/Import

**Use Case:** Save and restore conversations

**Implementation:**
```typescript
interface SessionExport {
  sessionId: string;
  conversationGroups: ConversationGroup[];
  timestamp: Date;
  theme: string;
}

function exportSession(): SessionExport {
  return {
    sessionId,
    conversationGroups,
    timestamp: new Date(),
    theme: appMode
  };
}

function importSession(data: SessionExport) {
  setSessionId(data.sessionId);
  setConversationGroups(data.conversationGroups);
  // Switch to correct theme if needed
}
```

---

## 12. Decision Log

### 12.1 Key Design Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Client-side UUID generation** | Enables conversation context, reduces server complexity | Server-side generation (current), hybrid approach |
| **No session persistence** | Simpler implementation, avoids stale context issues | localStorage persistence, cookie-based |
| **React hook approach** | Lightweight, flexible, easy to test | Context API, Redux, Zustand |
| **Reset on theme switch** | Different themes = different domains/contexts | Preserve session across themes |
| **Backward compatible API** | No breaking changes for existing clients | Require session_id (breaking change) |
| **No visual session indicator** | Cleaner UI, users don't need technical details | Show session ID, show conversation count |

### 12.2 Trade-offs

**Chosen Approach:**
- ✅ Simple implementation
- ✅ No breaking changes
- ✅ Enables multi-turn conversations
- ❌ Sessions lost on page refresh
- ❌ No cross-tab session sharing

**Alternative (Session Persistence):**
- ✅ Conversations survive page refresh
- ✅ Better user experience for long sessions
- ❌ More complex implementation
- ❌ Risk of stale context
- ❌ Privacy concerns (data retention)

**Recommendation:** Start with simple approach, add persistence later if user feedback indicates need.

---

## 13. Success Criteria

### 13.1 Functional Requirements

- ✅ Multi-turn conversations work correctly
- ✅ Session resets on theme switch
- ✅ Session resets on CLEAR button
- ✅ New session on page load
- ✅ Backward compatibility maintained
- ✅ No breaking changes to API

### 13.2 Non-Functional Requirements

- ✅ No performance degradation
- ✅ No security vulnerabilities introduced
- ✅ Code is maintainable and well-documented
- ✅ Tests cover critical paths
- ✅ Logging enables debugging

### 13.3 User Experience Goals

- ✅ Follow-up questions work naturally
- ✅ Context is maintained within conversations
- ✅ Clear button provides fresh start
- ✅ Theme switching feels intentional (new context)
- ✅ No confusing behavior or errors

---

## 14. Implementation Checklist

### Phase 1: Core Implementation
- [ ] Create `hooks/useSession.ts`
- [ ] Modify `services/langflow.ts` to accept sessionId
- [ ] Update `app/api/ask-stock/route.ts`
- [ ] Update `app/api/ask-space/route.ts`
- [ ] Update `app/page.tsx` to use session hook
- [ ] Add session_id to API request bodies
- [ ] Test basic session flow

### Phase 2: Session Reset
- [ ] Connect CLEAR button to resetSession
- [ ] Add console logging for session events
- [ ] Test session reset behavior
- [ ] Verify theme switch creates new session

### Phase 3: Testing
- [ ] Write unit tests for useSession hook
- [ ] Write integration tests for API routes
- [ ] Perform manual testing (checklist above)
- [ ] Test backward compatibility
- [ ] Test error scenarios

### Phase 4: Documentation
- [ ] Update API documentation
- [ ] Add inline code comments
- [ ] Create migration guide (if needed)
- [ ] Update README with session info

### Phase 5: Deployment
- [ ] Code review
- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] Verify in staging environment
- [ ] Deploy to production
- [ ] Monitor for issues

---

## 15. Conclusion

This design provides a comprehensive, production-ready solution for session management in the PixelTicker application. The approach is:

- **Simple:** Minimal code changes, easy to understand
- **Robust:** Handles edge cases, backward compatible
- **Secure:** Follows OWASP standards, no new vulnerabilities
- **Maintainable:** Well-documented, testable, extensible
- **User-Friendly:** Transparent to users, enables natural conversations

The implementation can be completed in phases, with each phase delivering incremental value. The design allows for future enhancements while maintaining a solid foundation.

**Next Steps:**
1. Review and approve this design
2. Begin Phase 1 implementation
3. Test thoroughly
4. Deploy incrementally
5. Monitor and iterate based on user feedback

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-28  
**Author:** IBM Bob (AI Assistant)  
**Status:** Ready for Review