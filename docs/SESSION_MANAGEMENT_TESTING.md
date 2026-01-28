t# Session Management Testing Guide

## Overview

This guide provides comprehensive testing procedures for the session management system in PixelTicker. The session management ensures that conversations maintain context across multiple questions while properly resetting when needed.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Manual Testing Scenarios](#manual-testing-scenarios)
3. [Browser Console Testing](#browser-console-testing)
4. [Expected Behaviors](#expected-behaviors)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Test Checklist](#test-checklist)

---

## System Architecture

### Key Components

The session management system spans 5 files:

1. **`hooks/useSession.ts`** - Client-side session ID generation and management
2. **`services/langflow.ts`** - Server-side Langflow API integration with session support
3. **`app/api/ask-stock/route.ts`** - Stock/ticker API endpoint with session validation
4. **`app/api/ask-space/route.ts`** - Space/astronomy API endpoint with session validation
5. **`app/page.tsx`** - Main UI component that uses session management

### Session ID Generation

- **Method**: `crypto.randomUUID()` (client-side)
- **Format**: Standard UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Fallback**: Timestamp-based UUID if `crypto.randomUUID()` is unavailable

### Session Reset Triggers

Sessions are reset (new UUID generated) on:
1. **Initial page load** - Fresh session when app starts
2. **Theme/app mode switch** - New session when switching between Ticker ↔ Space
3. **CLEAR button click** - Manual reset to start new conversation
4. **Page refresh** - Browser refresh creates new session

---

## Manual Testing Scenarios

### Test 1: Session Persistence Across Multiple Questions

**Objective**: Verify that multiple questions in the same conversation use the same session ID.

**Steps**:
1. Open the application in your browser
2. Open Browser DevTools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Ask your first question (e.g., "What is AAPL?")
5. Look for the console log: `[Home] Using session ID: <UUID>`
6. Note the session ID value
7. Ask a follow-up question (e.g., "What was its price yesterday?")
8. Look for the console log again: `[Home] Using session ID: <UUID>`
9. Compare the two session IDs

**Expected Result**:
- ✅ Both questions should use the **same session ID**
- ✅ Console logs should show: `[Session] Initial session created: <UUID>` only once
- ✅ No new session creation logs between questions

**Visual Indicator**:
```
[Session] Initial session created: 550e8400-e29b-41d4-a716-446655440000
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000  ← Same ID
```

---

### Test 2: Theme Switch Creates New Session

**Objective**: Verify that switching between Ticker and Space themes creates a new session.

**Steps**:
1. Open the application
2. Open Browser DevTools Console
3. Ask a question in the current theme (e.g., "What is TSLA?")
4. Note the session ID from console: `[Home] Using session ID: <UUID-1>`
5. Click the theme switcher to change from Ticker to Space (or vice versa)
6. Look for console log: `[Session] New session for theme: <theme> - Session ID: <UUID-2>`
7. Ask a question in the new theme (e.g., "Tell me about Mars")
8. Note the new session ID: `[Home] Using session ID: <UUID-2>`
9. Compare UUID-1 and UUID-2

**Expected Result**:
- ✅ Session ID should be **different** after theme switch
- ✅ Console should show: `[Session] New session for theme: space - Session ID: <new-UUID>`
- ✅ Conversation history should be cleared
- ✅ New questions use the new session ID

**Visual Indicator**:
```
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000
[Session] New session for theme: space - Session ID: 7c9e6679-7425-40de-944b-e07fc1f90ae7
[Home] Using session ID: 7c9e6679-7425-40de-944b-e07fc1f90ae7  ← Different ID
```

---

### Test 3: CLEAR Button Creates New Session

**Objective**: Verify that clicking the CLEAR button resets the session.

**Steps**:
1. Open the application
2. Open Browser DevTools Console
3. Ask 2-3 questions to build conversation history
4. Note the current session ID from console logs
5. Click the **CLEAR** button (usually in the header or input area)
6. Look for console log: `[Session] Session manually reset: <new-UUID>`
7. Ask a new question
8. Note the session ID used for the new question
9. Compare with the original session ID

**Expected Result**:
- ✅ Session ID should be **different** after clicking CLEAR
- ✅ Console should show: `[Session] Session manually reset: <new-UUID>`
- ✅ Conversation history should be cleared from UI
- ✅ New questions use the new session ID

**Visual Indicator**:
```
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000
[Session] Session manually reset: a1b2c3d4-e5f6-7890-abcd-ef1234567890
[Home] Using session ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890  ← Different ID
```

---

### Test 4: Page Refresh Creates New Session

**Objective**: Verify that refreshing the page creates a new session.

**Steps**:
1. Open the application
2. Open Browser DevTools Console
3. Ask a question and note the session ID
4. Press **F5** or click the browser refresh button
5. Wait for page to reload
6. Look for console log: `[Session] Initial session created: <new-UUID>`
7. Ask a question
8. Note the session ID used
9. Compare with the pre-refresh session ID

**Expected Result**:
- ✅ Session ID should be **different** after page refresh
- ✅ Console should show new: `[Session] Initial session created: <new-UUID>`
- ✅ Conversation history should be cleared (fresh start)
- ✅ New questions use the new session ID

**Visual Indicator**:
```
Before refresh:
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000

After refresh:
[Session] Initial session created: 9f8e7d6c-5b4a-3210-fedc-ba9876543210
[Home] Using session ID: 9f8e7d6c-5b4a-3210-fedc-ba9876543210  ← Different ID
```

---

### Test 5: Conversation Context Maintenance

**Objective**: Verify that follow-up questions maintain context from previous questions in the same session.

**Steps**:
1. Open the application
2. Ask an initial question (e.g., "What is Apple's stock symbol?")
3. Wait for response
4. Ask a follow-up question that requires context (e.g., "What was its closing price?")
5. Verify the AI understands "its" refers to Apple from the previous question
6. Ask another follow-up (e.g., "How has it performed this year?")
7. Verify context is maintained across all questions

**Expected Result**:
- ✅ All questions in the conversation use the **same session ID**
- ✅ AI responses demonstrate understanding of previous context
- ✅ Follow-up questions don't require re-stating the subject
- ✅ Langflow receives session_id in all requests

**Note**: This test verifies the technical session persistence. The actual context understanding depends on Langflow's conversation memory implementation.

---

## Browser Console Testing

### Using Network Tab to Inspect Session IDs

**Steps**:
1. Open Browser DevTools (F12)
2. Go to the **Network** tab
3. Clear existing network logs (trash icon)
4. Ask a question in the application
5. Look for the API request:
   - For Ticker theme: `ask-stock`
   - For Space theme: `ask-space`
6. Click on the request to view details
7. Go to the **Payload** or **Request** tab
8. Look for the `session_id` field in the JSON payload

**What to Look For**:

```json
{
  "question": "What is AAPL?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Verification**:
- ✅ `session_id` field is present in the request
- ✅ `session_id` is a valid UUID format
- ✅ Multiple requests in same conversation have same `session_id`
- ✅ Requests after reset have different `session_id`

---

### Using Console Logs for Debugging

The application provides detailed console logging for session management:

#### Client-Side Logs (from `useSession.ts`):

```javascript
// Initial session creation
[Session] Initial session created: 550e8400-e29b-41d4-a716-446655440000

// Theme change
[Session] New session for theme: space - Session ID: 7c9e6679-7425-40de-944b-e07fc1f90ae7

// Manual reset (CLEAR button)
[Session] Session manually reset: a1b2c3d4-e5f6-7890-abcd-ef1234567890

// Fallback warning (rare)
[Session] crypto.randomUUID not available, using fallback
```

#### Client-Side Logs (from `page.tsx`):

```javascript
// Before API request
[Home] Sending request to: /api/ask-stock
[Home] Using session ID: 550e8400-e29b-41d4-a716-446655440000
```

#### Server-Side Logs (from `langflow.ts`):

```javascript
// Session info in Langflow service
[Langflow] Using session_id: 550e8400-e29b-41d4-a716-446655440000
[Langflow] Session provided by client: true
```

---

### Using React DevTools

**Steps**:
1. Install React DevTools browser extension
2. Open DevTools and go to **Components** tab
3. Find the `Home` component in the component tree
4. Look for the `useSession` hook in the hooks section
5. Expand to see `sessionId` value

**What to Look For**:
- Hook: `Session`
- State: `sessionId: "550e8400-e29b-41d4-a716-446655440000"`

**Verification**:
- ✅ `sessionId` state exists and has a UUID value
- ✅ Value changes when session is reset
- ✅ Value persists across multiple questions

---

## Expected Behaviors

### Session ID Patterns

#### Valid Session ID Format:
```
550e8400-e29b-41d4-a716-446655440000
```
- 36 characters total
- 5 groups separated by hyphens
- Hexadecimal characters (0-9, a-f)
- Pattern: `8-4-4-4-12` characters

#### Fallback Format (rare):
```
1706457600000-abc123def456
```
- Timestamp followed by random string
- Only appears if `crypto.randomUUID()` is unavailable

---

### Session Reuse vs. New Session

#### ✅ Session Should Be REUSED When:
- Asking multiple questions in same conversation
- Navigating within the same theme
- Typing and submitting questions consecutively
- Receiving responses and asking follow-ups

#### 🔄 Session Should Be RESET (New UUID) When:
- Page loads for the first time
- User switches theme (Ticker ↔ Space)
- User clicks CLEAR button
- User refreshes the browser (F5)
- Browser tab is closed and reopened

---

### Debug Log Message Reference

| Log Message | Meaning | When It Appears |
|------------|---------|-----------------|
| `[Session] Initial session created: <UUID>` | New session on mount | Page load |
| `[Session] New session for theme: <theme> - Session ID: <UUID>` | Session reset due to theme change | Theme switch |
| `[Session] Session manually reset: <UUID>` | User triggered reset | CLEAR button |
| `[Session] crypto.randomUUID not available, using fallback` | Browser compatibility issue | Rare/old browsers |
| `[Home] Using session ID: <UUID>` | Session ID being sent to API | Every question |
| `[Langflow] Using session_id: <UUID>` | Server received session ID | Server-side processing |
| `[Langflow] Session provided by client: true` | Client sent session ID | Server-side validation |

---

## Troubleshooting Guide

### Issue 1: Sessions Not Persisting

**Symptoms**:
- Every question gets a new session ID
- Console shows multiple "Initial session created" logs
- Follow-up questions don't maintain context

**Possible Causes & Solutions**:

1. **Component Re-mounting**
   - Check if parent components are re-rendering unnecessarily
   - Look for key prop changes that force remounts
   - Verify `useSession` hook is called at stable component level

2. **State Management Issue**
   - Check React DevTools to see if `sessionId` state is changing
   - Verify no other code is calling `resetSession()` unintentionally
   - Look for useEffect dependencies that might trigger resets

3. **Browser Issues**
   - Clear browser cache and cookies
   - Try in incognito/private mode
   - Test in different browser

**Debugging Steps**:
```javascript
// Add this to page.tsx to track session changes
useEffect(() => {
  console.log('[DEBUG] Session ID changed to:', sessionId);
}, [sessionId]);
```

---

### Issue 2: Sessions Not Resetting

**Symptoms**:
- Theme switch doesn't create new session
- CLEAR button doesn't reset session
- Same session ID persists after refresh

**Possible Causes & Solutions**:

1. **Theme Change Not Detected**
   - Verify `appMode` is actually changing in ThemeContext
   - Check if useEffect dependency array includes `appMode`
   - Look for console log: `[Session] New session for theme:`

2. **Reset Function Not Called**
   - Verify `handleClearConversation` calls `resetSession()`
   - Check if CLEAR button onClick is properly wired
   - Add debug log in `resetSession` function

3. **Caching Issue**
   - Session ID might be cached in closure
   - Verify state updates are triggering re-renders
   - Check if `sessionId` is being read from stale closure

**Debugging Steps**:
```javascript
// Add to useSession.ts resetSession function
const resetSession = () => {
  console.log('[DEBUG] resetSession called');
  const newSessionId = generateSessionId();
  console.log('[DEBUG] New session ID:', newSessionId);
  setSessionId(newSessionId);
};
```

---

### Issue 3: Session ID Not Sent to API

**Symptoms**:
- Network tab shows `session_id: undefined` or missing
- Server logs show: `[Langflow] Session provided by client: false`
- Langflow generates fallback UUID

**Possible Causes & Solutions**:

1. **Timing Issue**
   - `sessionId` might be empty string on first render
   - API call happens before session is initialized
   - Add check: `if (!sessionId) return;` before API call

2. **Prop Not Passed**
   - Verify `sessionId` is destructured from `useSession()`
   - Check API call includes `session_id: sessionId` in payload
   - Look for typos in property name

3. **Request Payload Issue**
   - Inspect Network tab payload carefully
   - Verify JSON serialization is correct
   - Check for axios interceptors that might modify payload

**Debugging Steps**:
```javascript
// Add before API call in page.tsx
console.log('[DEBUG] About to send request with session:', {
  sessionId,
  hasSessionId: !!sessionId,
  sessionIdLength: sessionId?.length
});
```

---

### Issue 4: Invalid Session ID Format

**Symptoms**:
- Session ID doesn't match UUID format
- Fallback format appears frequently
- Console shows: `crypto.randomUUID not available`

**Possible Causes & Solutions**:

1. **Browser Compatibility**
   - `crypto.randomUUID()` requires modern browser
   - Check browser version (Chrome 92+, Firefox 95+, Safari 15.4+)
   - Fallback is working as designed for older browsers

2. **Secure Context Required**
   - `crypto.randomUUID()` requires HTTPS or localhost
   - If deployed, ensure site uses HTTPS
   - HTTP sites will use fallback

3. **Not Actually an Issue**
   - Fallback format is valid and functional
   - Only aesthetic difference from standard UUID
   - Session management still works correctly

**Verification**:
```javascript
// Test in browser console
console.log('crypto.randomUUID available:', typeof crypto?.randomUUID === 'function');
console.log('Test UUID:', crypto.randomUUID());
```

---

### Issue 5: Context Not Maintained in Conversation

**Symptoms**:
- Follow-up questions don't understand previous context
- AI asks for information already provided
- Session ID is correct but context is lost

**Important Note**: This is likely a **Langflow configuration issue**, not a session management bug.

**Verification Steps**:

1. **Confirm Session ID is Correct**
   - Check Network tab: same `session_id` in all requests ✅
   - Check console logs: same session ID used ✅
   - If session IDs match, the client is working correctly

2. **Check Langflow Configuration**
   - Verify Langflow flow has conversation memory enabled
   - Check if session_id is properly mapped in flow
   - Test Langflow directly with same session_id

3. **Server-Side Logs**
   - Look for: `[Langflow] Using session_id: <UUID>`
   - Verify: `[Langflow] Session provided by client: true`
   - If both present, session is reaching Langflow correctly

**Not a Client Issue If**:
- ✅ Same session ID in all requests
- ✅ Server logs show session received
- ✅ No session reset between questions

**Likely Langflow Issue If**:
- Langflow flow doesn't have memory component
- Session ID not connected to memory node
- Memory component not configured correctly

---

## Test Checklist

Use this checklist to verify all session management functionality:

### Initial Setup
- [ ] Application loads without errors
- [ ] Browser DevTools Console is open
- [ ] Network tab is ready to capture requests
- [ ] React DevTools installed (optional but helpful)

### Session Creation Tests
- [ ] **Test 1.1**: Initial page load creates session
  - [ ] Console shows: `[Session] Initial session created: <UUID>`
  - [ ] Session ID is valid UUID format
  - [ ] Session ID appears in React DevTools

### Session Persistence Tests
- [ ] **Test 2.1**: First question uses session ID
  - [ ] Console shows: `[Home] Using session ID: <UUID>`
  - [ ] Network tab shows `session_id` in request payload
  - [ ] Server logs show: `[Langflow] Session provided by client: true`

- [ ] **Test 2.2**: Second question reuses same session
  - [ ] Same session ID in console log
  - [ ] Same session ID in Network tab
  - [ ] No new session creation logs

- [ ] **Test 2.3**: Third question still uses same session
  - [ ] Session ID unchanged
  - [ ] Conversation history visible in UI
  - [ ] Context maintained (if Langflow configured)

### Session Reset Tests
- [ ] **Test 3.1**: Theme switch resets session
  - [ ] Switch from Ticker to Space (or vice versa)
  - [ ] Console shows: `[Session] New session for theme: <theme>`
  - [ ] New session ID is different from previous
  - [ ] Conversation history cleared

- [ ] **Test 3.2**: CLEAR button resets session
  - [ ] Click CLEAR button
  - [ ] Console shows: `[Session] Session manually reset: <UUID>`
  - [ ] New session ID is different
  - [ ] Conversation history cleared

- [ ] **Test 3.3**: Page refresh resets session
  - [ ] Press F5 or refresh button
  - [ ] Console shows: `[Session] Initial session created: <UUID>`
  - [ ] New session ID is different
  - [ ] Fresh start with no history

### Edge Cases
- [ ] **Test 4.1**: Rapid consecutive questions
  - [ ] Submit 3-4 questions quickly
  - [ ] All use same session ID
  - [ ] No race conditions or duplicate sessions

- [ ] **Test 4.2**: Switch theme multiple times
  - [ ] Switch Ticker → Space → Ticker
  - [ ] Each switch creates new session
  - [ ] Session IDs are all different

- [ ] **Test 4.3**: Clear and continue
  - [ ] Ask question, click CLEAR, ask another question
  - [ ] Two different session IDs used
  - [ ] No errors or warnings

### Browser Compatibility
- [ ] **Test 5.1**: Chrome/Edge
  - [ ] Session management works
  - [ ] Uses `crypto.randomUUID()`
  - [ ] No fallback warnings

- [ ] **Test 5.2**: Firefox
  - [ ] Session management works
  - [ ] Uses `crypto.randomUUID()`
  - [ ] No fallback warnings

- [ ] **Test 5.3**: Safari
  - [ ] Session management works
  - [ ] Uses `crypto.randomUUID()`
  - [ ] No fallback warnings

### Integration Tests
- [ ] **Test 6.1**: Ticker theme end-to-end
  - [ ] Ask stock question
  - [ ] Session ID sent to `/api/ask-stock`
  - [ ] Response received successfully
  - [ ] Follow-up question uses same session

- [ ] **Test 6.2**: Space theme end-to-end
  - [ ] Ask space question
  - [ ] Session ID sent to `/api/ask-space`
  - [ ] Response received successfully
  - [ ] Follow-up question uses same session

### Final Verification
- [ ] No console errors related to session management
- [ ] No network errors in API requests
- [ ] Session IDs are always valid UUIDs (or fallback format)
- [ ] All reset triggers work as expected
- [ ] Session persistence works across multiple questions

---

## Testing Best Practices

### 1. Always Test in Clean State
- Clear browser cache before testing
- Use incognito/private mode for isolated tests
- Close and reopen DevTools between test runs

### 2. Document Your Findings
- Take screenshots of console logs
- Copy session IDs for comparison
- Note any unexpected behaviors

### 3. Test Across Browsers
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on macOS)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 4. Test Different Scenarios
- Fast consecutive questions
- Slow deliberate questions
- Long conversations (10+ questions)
- Theme switching mid-conversation

### 5. Verify Both Client and Server
- Check client console logs
- Check Network tab payloads
- Check server logs (if accessible)
- Verify Langflow receives session_id

---

## Quick Reference: Console Commands

### Check if crypto.randomUUID is available:
```javascript
typeof crypto?.randomUUID === 'function'
```

### Generate test UUID:
```javascript
crypto.randomUUID()
```

### Monitor session changes (add to page.tsx):
```javascript
useEffect(() => {
  console.log('🔍 Session changed:', sessionId);
}, [sessionId]);
```

### Check current session in React DevTools:
1. Open React DevTools
2. Select `Home` component
3. Look for `Session` hook
4. Check `sessionId` value

---

## Success Criteria

Your session management implementation is working correctly if:

✅ **Session Persistence**
- Multiple questions in same conversation use identical session ID
- Session ID remains constant until reset trigger

✅ **Session Reset**
- Theme switch creates new session ID
- CLEAR button creates new session ID
- Page refresh creates new session ID

✅ **API Integration**
- Session ID appears in all API request payloads
- Server logs confirm session ID received
- No undefined or null session IDs

✅ **UUID Format**
- Session IDs are valid UUIDs (or fallback format)
- No empty strings or invalid values
- Consistent format throughout session

✅ **No Errors**
- No console errors related to session management
- No network errors in API requests
- No React warnings about state updates

---

## Additional Resources

- **Session Management Design**: See `docs/SESSION_MANAGEMENT_DESIGN.md`
- **Langflow Integration**: See `docs/LANGFLOW_RESPONSE_FORMAT.md`
- **Theme Development**: See `docs/THEME_DEVELOPMENT_GUIDE.md`

---

## Support

If you encounter issues not covered in this guide:

1. Check console logs for error messages
2. Verify all files are up to date
3. Review the implementation files listed in System Architecture
4. Test in different browser/environment
5. Check Langflow configuration if context issues persist

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-28  
**Tested With**: Chrome 120+, Firefox 121+, Safari 17+
