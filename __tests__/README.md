# PixelTicker Testing Infrastructure

This document describes the complete testing setup for the PixelTicker project.

## Overview

The testing infrastructure is built using:
- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **jest-canvas-mock** - Mock Canvas API for Chart.js testing
- **MSW (Mock Service Worker)** - API mocking (handlers created, setup pending ESM resolution)

## Directory Structure

```
__tests__/
├── services/          # Tests for service layer (Langflow, EverArt, etc.)
├── hooks/             # Tests for React hooks
├── api/               # Tests for API routes
├── utils/             # Tests for utility functions
├── components/        # Tests for React components
│   └── dynamic/       # Tests for dynamic UI components
└── mocks/             # Mock handlers and server setup
    ├── handlers.ts    # MSW request handlers
    └── server.ts      # MSW server configuration
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

## Configuration Files

### jest.config.js
Main Jest configuration with:
- Next.js integration via `next/jest`
- TypeScript support via `ts-jest`
- Path alias mapping (`@/` → project root)
- Coverage thresholds (70% for all metrics)
- Module transformation rules
- MSW module resolution

### jest.setup.js
Global test setup including:
- jest-dom matchers
- Canvas API mocking for Chart.js
- Web Audio API mocking
- Web Speech API mocking
- HTMLMediaElement mocking
- IntersectionObserver mocking
- ResizeObserver mocking
- matchMedia mocking

## Writing Tests

### Basic Test Structure

```typescript
import { functionToTest } from '@/path/to/module'

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      const result = functionToTest(input)
      expect(result).toBe(expected)
    })
  })
})
```

### Testing React Components

```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from '@/hooks/useCustomHook'

describe('useCustomHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.value).toBe(expected)
  })
})
```

### Testing API Routes

```typescript
import { POST } from '@/app/api/route-name/route'
import { NextRequest } from 'next/server'

describe('API Route', () => {
  it('should handle valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/route-name', {
      method: 'POST',
      body: JSON.stringify({ data: 'value' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('expectedField')
  })
})
```

## API Mocking with MSW

MSW handlers are defined in `__tests__/mocks/handlers.ts` for:
- `/api/ask-stock` - Stock query endpoint
- `/api/ask-space` - Space query endpoint
- `/api/music/[theme]` - Music file listing
- EverArt image generation API

### Known Limitation: MSW ESM Issues

MSW v2 has compatibility issues with Jest's CommonJS module system. The handlers are created but not automatically loaded in `jest.setup.js`. 

**Workarounds:**
1. Import MSW directly in test files that need API mocking
2. Use manual mocks in `__mocks__` directories
3. Mock fetch/axios directly in tests
4. Consider migrating to Vitest (better ESM support)

Example of per-test MSW setup:
```typescript
import { setupServer } from 'msw/node'
import { handlers } from '@/__tests__/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Coverage Thresholds

The project maintains the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **One Assertion Per Test**: Keep tests focused on a single behavior
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include tests for error conditions and boundary values
6. **Keep Tests Fast**: Avoid unnecessary delays or complex setup
7. **Use TypeScript**: Leverage type safety in tests

## Example Test File

See `__tests__/utils/celestial-coordinates.test.ts` for a comprehensive example that includes:
- Unit tests for individual functions
- Edge case testing
- Error handling tests
- Integration tests
- Proper TypeScript typing

## Troubleshooting

### Tests Not Running
- Ensure all dependencies are installed: `npm install`
- Check Jest configuration in `jest.config.js`
- Verify test file naming matches patterns in `testMatch`

### Module Resolution Errors
- Check path aliases in `jest.config.js` match `tsconfig.json`
- Ensure `moduleNameMapper` includes all necessary mappings

### TypeScript Errors
- Verify `@types/jest` is installed
- Check `tsconfig.json` includes test files
- Ensure Jest transform configuration includes TypeScript files

### Canvas/Audio API Errors
- Mocks are configured in `jest.setup.js`
- If issues persist, check that setup file is loaded in Jest config

## Future Improvements

1. **MSW Integration**: Resolve ESM compatibility issues for automatic API mocking
2. **E2E Tests**: Add Playwright or Cypress for end-to-end testing
3. **Visual Regression**: Consider adding visual regression testing for UI components
4. **Performance Tests**: Add performance benchmarks for critical paths
5. **Accessibility Tests**: Integrate automated accessibility testing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)