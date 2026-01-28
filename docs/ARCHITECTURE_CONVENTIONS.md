# Architecture Conventions

This document establishes the architectural patterns and conventions for the PixelTicker codebase. Following these conventions ensures consistency, maintainability, and scalability.

## Table of Contents

1. [Component Organization](#component-organization)
2. [File Naming Conventions](#file-naming-conventions)
3. [Export Patterns](#export-patterns)
4. [State Management](#state-management)
5. [Component Structure](#component-structure)
6. [TypeScript Conventions](#typescript-conventions)
7. [Testing Conventions](#testing-conventions)

---

## Component Organization

### Directory Structure

Components are organized by feature and responsibility:

```
components/
├── shared/           # Reusable UI components (PixelCard, ChangeIndicator, etc.)
├── dynamic/          # Dynamic UI components from Langflow responses
├── conversation/     # Conversation-related components
├── audio/           # Audio control components
├── layout/          # Layout and structural components
└── [feature]/       # Feature-specific components
```

### When to Create New Directories

Create a new directory when:
- You have 3+ related components for a specific feature
- Components share types, utilities, or state
- The feature is conceptually distinct from existing directories

Use flat structure (no directory) when:
- Component is truly standalone
- Component is used across multiple features
- Component is a one-off utility

### Barrel Exports

Each component directory should have an `index.ts` for clean imports:

```typescript
// components/shared/index.ts
export { PixelCard } from './PixelCard';
export { ChangeIndicator } from './ChangeIndicator';
export { PixelTable } from './PixelTable';
```

Usage:
```typescript
import { PixelCard, ChangeIndicator } from '@/components/shared';
```

---

## File Naming Conventions

### Components
- **Format**: `PascalCase.tsx`
- **Examples**: `PixelCard.tsx`, `AudioControlPanel.tsx`, `ConversationContainer.tsx`

### Hooks
- **Format**: `camelCase.ts` with `use` prefix
- **Examples**: `useConversation.ts`, `useAudioControls.ts`, `useSession.ts`

### Utilities
- **Format**: `kebab-case.ts`
- **Examples**: `chart-config.ts`, `formatters.ts`, `celestial-coordinates.ts`

### Constants
- **Format**: `kebab-case.ts` or `UPPER_SNAKE_CASE.ts`
- **Examples**: `theme.ts`, `styles.ts`, `theme-registry.ts`

### Types
- **Format**: `kebab-case.ts`
- **Examples**: `index.ts`, `ui-spec.ts`

### Tests
- **Format**: Match source file with `.test.tsx` or `.test.ts` suffix
- **Examples**: `PixelCard.test.tsx`, `useConversation.test.ts`, `formatters.test.ts`

---

## Export Patterns

### Named Exports (Preferred)

Use named exports for components, hooks, and utilities:

```typescript
// ✅ Good
export function PixelCard({ title, children }: PixelCardProps) {
  // ...
}

export function useConversation(sessionId: string) {
  // ...
}
```

**Benefits**:
- Better IDE autocomplete
- Easier refactoring
- Clearer imports
- Prevents naming conflicts

### Default Exports (Limited Use)

Use default exports only for:
- Next.js pages (`app/page.tsx`, `app/layout.tsx`)
- Next.js API routes (`app/api/*/route.ts`)
- Legacy components being migrated

```typescript
// ✅ Acceptable for Next.js pages
export default function Home() {
  // ...
}
```

### Avoid Mixed Exports

Don't mix default and named exports in the same file:

```typescript
// ❌ Bad
export default function MyComponent() {}
export const helper = () => {};

// ✅ Good
export function MyComponent() {}
export function helper() {}
```

---

## State Management

### Local State

Use `useState` for component-specific state:

```typescript
function AudioControlPanel() {
  const [volume, setVolume] = useState(50);
  // ...
}
```

### Custom Hooks

Extract complex state logic into custom hooks when:
- State logic is reusable across components
- State management exceeds ~50 lines
- Multiple related state variables exist
- Side effects are complex

```typescript
// hooks/useConversation.ts
export function useConversation(sessionId: string, appMode: string) {
  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submitQuestion = async (question: string) => {
    // Complex logic here
  };
  
  return {
    conversationGroups,
    isLoading,
    error,
    submitQuestion,
  };
}
```

### Context API

Use Context for:
- Global application state (theme, user preferences)
- State needed by many components at different nesting levels
- Avoiding prop drilling beyond 2 levels

```typescript
// contexts/ThemeContext.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Prop Drilling Limits

**Maximum 2 levels of prop drilling**. If you need to pass props through more than 2 components, consider:
1. Using Context API
2. Extracting a custom hook
3. Component composition (children props)

```typescript
// ❌ Bad: 3+ levels of prop drilling
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />
    </GrandChild>
  </Child>
</Parent>

// ✅ Good: Use Context or composition
<DataProvider data={data}>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild />
      </GrandChild>
    </Child>
  </Parent>
</DataProvider>
```

---

## Component Structure

### Standard Component Template

```typescript
'use client'; // Only if needed (client-side hooks, events)

import { useState } from 'react';
import { SomeType } from '@/types';

// 1. Interfaces/Types (at top)
interface MyComponentProps {
  title: string;
  onAction: () => void;
  optional?: boolean;
}

// 2. Component Definition
export function MyComponent({ title, onAction, optional = false }: MyComponentProps) {
  // 2a. Hooks (in order: context, state, refs, effects)
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  // 2b. Event Handlers
  const handleClick = () => {
    setIsActive(true);
    onAction();
  };
  
  // 2c. Render Logic
  return (
    <div ref={ref} onClick={handleClick}>
      <h2>{title}</h2>
      {optional && <span>Optional content</span>}
    </div>
  );
}

// 3. Helper Functions (below component)
function formatTitle(title: string): string {
  return title.toUpperCase();
}

// 4. Constants (if component-specific)
const DEFAULT_TIMEOUT = 3000;
```

### Component Size Guidelines

- **Small components**: < 100 lines (ideal)
- **Medium components**: 100-200 lines (acceptable)
- **Large components**: 200-300 lines (refactor candidate)
- **God components**: > 300 lines (must refactor)

When a component exceeds 200 lines, consider:
1. Extracting custom hooks
2. Breaking into smaller sub-components
3. Moving helper functions to utilities

---

## TypeScript Conventions

### Interface vs Type

**Use `interface` for:**
- Component props
- Object shapes
- Extendable contracts

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}

interface ExtendedButtonProps extends ButtonProps {
  variant: 'primary' | 'secondary';
}
```

**Use `type` for:**
- Union types
- Intersection types
- Mapped types
- Function signatures

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';
type Callback = (value: string) => void;
type PartialUser = Partial<User>;
```

### Prop Types

Always define explicit prop types:

```typescript
// ✅ Good
interface CardProps {
  title: string;
  description?: string;
  onClose: () => void;
}

export function Card({ title, description, onClose }: CardProps) {
  // ...
}

// ❌ Bad
export function Card(props: any) {
  // ...
}
```

### Generic Types

Use generics for reusable components:

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick: (row: T) => void;
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // ...
}
```

---

## Testing Conventions

### Test File Location

Tests live in `__tests__/` directory, mirroring source structure:

```
__tests__/
├── components/
│   ├── shared/
│   │   └── PixelCard.test.tsx
│   └── dynamic/
│       └── DataTable.test.tsx
├── hooks/
│   └── useConversation.test.ts
└── utils/
    └── formatters.test.ts
```

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { PixelCard } from '@/components/shared/PixelCard';

describe('PixelCard', () => {
  it('renders title correctly', () => {
    render(<PixelCard title="Test Title">Content</PixelCard>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <PixelCard title="Test" className="custom-class">
        Content
      </PixelCard>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

### Test Coverage Goals

- **Critical paths**: 100% coverage (authentication, payments, data mutations)
- **UI components**: 80%+ coverage (render, interactions, edge cases)
- **Utilities**: 90%+ coverage (pure functions, formatters)
- **Hooks**: 80%+ coverage (state changes, side effects)

---

## Best Practices Summary

### DO ✅

- Use named exports for components and utilities
- Extract complex logic into custom hooks
- Keep components under 200 lines
- Define explicit TypeScript interfaces
- Use feature-based directory structure
- Write tests for all new components
- Follow consistent naming conventions
- Use Context for global state
- Document complex logic with comments

### DON'T ❌

- Use default exports (except Next.js pages/routes)
- Prop drill beyond 2 levels
- Create "God components" (>300 lines)
- Mix business logic with UI logic
- Use `any` type
- Skip TypeScript interfaces
- Nest components deeply (>4 levels)
- Ignore test coverage
- Create circular dependencies

---

## Migration Guide

When refactoring existing code to follow these conventions:

1. **Start with high-impact files** (page.tsx, large components)
2. **Extract hooks first** (easier to test in isolation)
3. **Break down components** (one feature at a time)
4. **Update imports** (after moving files)
5. **Run tests** (after each change)
6. **Commit frequently** (small, focused commits)

---

## Questions or Suggestions?

These conventions are living documents. If you have suggestions for improvements or questions about specific patterns, please:

1. Open a discussion in the team channel
2. Propose changes via pull request
3. Update this document with team consensus

Last updated: 2026-01-28