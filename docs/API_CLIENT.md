# API Client Architecture

This document explains the API client architecture for TeachAssist frontend, including how to use the API, manage state with Zustand stores, and handle errors.

## Overview

The TeachAssist frontend communicates with the FastAPI backend via a centralized API client (`lib/api.ts`). All API calls return a consistent response format with error handling built-in.

## API Client Structure

### File: `lib/api.ts`

The API client is organized into namespaces:

```typescript
import api from '@/lib/api'

// Sources (Knowledge Base)
api.sources.upload(file, title?)
api.sources.list()
api.sources.delete(sourceId)
api.sources.stats()

// Chat (Grounded Q&A)
api.chat.ask(query, options?)

// Council (Inner Council Advisors)
api.council.consult(persona, context, question)
api.council.listPersonas()

// Health Check
api.health()
```

### Response Format

All API methods return a consistent response:

```typescript
interface ApiResponse<T> {
  data?: T
  error?: string
}
```

**Usage pattern:**

```typescript
const result = await api.sources.list()

if (result.error) {
  // Handle error
  console.error(result.error)
  return
}

// Use data
const sources = result.data
```

## Zustand Stores

State management uses Zustand with persistence. Each major feature has its own store.

### Sources Store (`stores/sourcesStore.ts`)

Manages knowledge base sources (uploaded documents).

```typescript
import { useSourcesStore } from '@/stores/sourcesStore'

function MyComponent() {
  const { sources, isUploading, uploadSource, fetchSources, deleteSource } = useSourcesStore()

  useEffect(() => {
    fetchSources()
  }, [])

  const handleUpload = async (file: File) => {
    const result = await uploadSource(file, 'My Document')
    if (result.success) {
      console.log('Upload complete:', result.data)
    } else {
      console.error('Upload failed:', result.error)
    }
  }

  return (
    <div>
      {sources.map(source => (
        <div key={source.id}>{source.title}</div>
      ))}
    </div>
  )
}
```

**State:**
- `sources: Source[]` - List of uploaded documents
- `isLoading: boolean` - Loading state for fetch/delete
- `isUploading: boolean` - Upload in progress
- `error: string | null` - Last error message
- `stats: StatsResponse | null` - KB statistics

**Actions:**
- `fetchSources()` - Refresh sources list
- `uploadSource(file, title?)` - Upload a new document
- `deleteSource(sourceId)` - Delete a document
- `fetchStats()` - Get KB statistics
- `clearError()` - Clear error state

**Helpers:**
```typescript
const hasSources = useHasSources() // boolean
const sourceCount = useSourceCount() // number
```

### Council Store (`stores/councilStore.ts`)

Manages Inner Council attention items (notifications).

```typescript
import { useCouncilStore } from '@/stores/councilStore'

function MyComponent() {
  const { attentionItems, addAttentionItem, markAsRead } = useCouncilStore()

  const handleConsultation = async () => {
    // ... consult council
    addAttentionItem({
      id: crypto.randomUUID(),
      type: 'council_response',
      title: 'New advice from Standards Guardian',
      entityId: 'standards-guardian',
      entityType: 'council',
    })
  }
}
```

**State:**
- `attentionItems: AttentionItem[]` - Unread notifications
- `feedOpen: boolean` - Feed UI state

**Actions:**
- `addAttentionItem(item)` - Add notification
- `markAsRead(id)` - Mark as read
- `markAllAsRead()` - Clear all unread
- `toggleFeed()` - Toggle feed UI

**Helpers:**
```typescript
const hasUnread = useHasUnreadAttention() // boolean
const unreadCount = useUnreadAttentionCount() // number
```

### AI Assistant Store (`stores/aiAssistantStore.ts`)

Manages AI Assistant sidebar state and suggestions.

```typescript
import { useAIAssistantStore } from '@/stores/aiAssistantStore'

function MyComponent() {
  const { isOpen, toggleAssistant, updateContext } = useAIAssistantStore()

  useEffect(() => {
    // Update context when page changes
    updateContext('/sources', { hasSources: true })
  }, [])
}
```

### Help Store (`stores/helpStore.ts`)

Manages Help Center state and search.

```typescript
import { useHelpStore } from '@/stores/helpStore'

function MyComponent() {
  const { isOpen, toggleHelp, searchQuery, setSearchQuery } = useHelpStore()
}
```

## Error Handling

### Pattern 1: Component-level errors

Display errors directly in the UI:

```typescript
const [error, setError] = useState<string | null>(null)

const handleAction = async () => {
  setError(null)
  const result = await api.sources.upload(file)

  if (result.error) {
    setError(result.error)
    return
  }

  // Success
}

return (
  <div>
    {error && (
      <div className="text-red-600">{error}</div>
    )}
  </div>
)
```

### Pattern 2: Store-level errors

Let the store manage errors:

```typescript
const { error, clearError } = useSourcesStore()

useEffect(() => {
  if (error) {
    // Show toast or banner
    setTimeout(clearError, 5000)
  }
}, [error])
```

### Pattern 3: Try-catch for unexpected errors

```typescript
try {
  const result = await api.chat.ask(query)
  // ... handle result
} catch (err) {
  console.error('Unexpected error:', err)
  setError(err instanceof Error ? err.message : 'Unknown error')
}
```

## Adding New Endpoints

### 1. Add types to `lib/api.ts`

```typescript
interface NewFeatureRequest {
  field1: string
  field2: number
}

interface NewFeatureResponse {
  result: string
}
```

### 2. Add API method

```typescript
export const api = {
  // ... existing namespaces
  newFeature: {
    async doSomething(data: NewFeatureRequest): Promise<ApiResponse<NewFeatureResponse>> {
      try {
        const response = await fetch(`${API_BASE}/api/v1/newfeature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          return { error: errorData.detail || 'Request failed' }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Request failed' }
      }
    },
  },
}
```

### 3. Create Zustand store (if needed)

```typescript
// stores/newFeatureStore.ts
import { create } from 'zustand'
import api from '@/lib/api'

interface NewFeatureState {
  data: any[]
  isLoading: boolean
  error: string | null

  fetchData: () => Promise<void>
}

export const useNewFeatureStore = create<NewFeatureState>((set) => ({
  data: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null })
    const result = await api.newFeature.doSomething({ field1: 'test', field2: 123 })

    if (result.error) {
      set({ error: result.error, isLoading: false })
      return
    }

    set({ data: [result.data], isLoading: false })
  },
}))
```

### 4. Use in components

```typescript
'use client'

import { useNewFeatureStore } from '@/stores/newFeatureStore'

export default function NewFeaturePage() {
  const { data, isLoading, fetchData } = useNewFeatureStore()

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) return <div>Loading...</div>

  return <div>{/* Render data */}</div>
}
```

## Environment Variables

API URL is configured via environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8002
```

**Important:** `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

## Keyboard Shortcuts

Global keyboard shortcuts are managed in `components/GlobalLayout.tsx`:

```typescript
useKeyboardShortcuts([
  {
    key: '.',
    metaKey: true,
    handler: toggleAssistant,
    description: 'Toggle AI Assistant',
  },
  {
    key: '/',
    metaKey: true,
    handler: toggleHelp,
    description: 'Toggle Help Center',
  },
  {
    key: 'u',
    metaKey: true,
    handler: () => router.push('/sources'),
    description: 'Go to Upload Sources',
  },
  {
    key: 'j',
    metaKey: true,
    handler: () => router.push('/chat'),
    description: 'Go to Chat',
  },
  {
    key: 'c',
    metaKey: true,
    shiftKey: true,
    handler: () => router.push('/council'),
    description: 'Go to Inner Council',
  },
])
```

**Available modifiers:**
- `metaKey: true` - Cmd (Mac) / Windows key
- `ctrlKey: true` - Ctrl
- `shiftKey: true` - Shift

## Testing API Connections

### Manual Testing (Browser DevTools)

1. Open browser console
2. Test API directly:

```javascript
// Test health
fetch('http://localhost:8002/health').then(r => r.json()).then(console.log)

// Test sources list
fetch('http://localhost:8002/api/v1/sources').then(r => r.json()).then(console.log)

// Test chat
fetch('http://localhost:8002/api/v1/chat/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'What is the main topic?' })
}).then(r => r.json()).then(console.log)
```

### Component Testing

Use React hooks and state to test:

```typescript
const TestAPIComponent = () => {
  const [result, setResult] = useState(null)

  const testAPI = async () => {
    const res = await api.health()
    setResult(res)
  }

  return (
    <div>
      <button onClick={testAPI}>Test API</button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
```

## Common Patterns

### Loading States

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleAction = async () => {
  setIsLoading(true)
  try {
    const result = await api.sources.list()
    // ... handle result
  } finally {
    setIsLoading(false) // Always reset loading state
  }
}
```

### Optimistic Updates

```typescript
const deleteSource = async (id: string) => {
  // Optimistically remove from UI
  setSources(sources.filter(s => s.id !== id))

  const result = await api.sources.delete(id)

  if (result.error) {
    // Rollback on error
    fetchSources() // Re-fetch from server
    setError(result.error)
  }
}
```

### Polling / Auto-refresh

```typescript
useEffect(() => {
  fetchSources()

  const interval = setInterval(fetchSources, 30000) // Refresh every 30s
  return () => clearInterval(interval)
}, [])
```

## Best Practices

1. **Always check for errors first:**
   ```typescript
   if (result.error) {
     // Handle error
     return
   }
   // Use result.data
   ```

2. **Use stores for shared state:**
   - If multiple components need the same data, use a Zustand store
   - If data is local to one component, use `useState`

3. **Persist important data:**
   - Zustand stores can persist to localStorage
   - Use `persist` middleware for data that should survive page reloads

4. **Clear errors appropriately:**
   - Auto-clear errors after a timeout
   - Clear errors when starting new actions
   - Provide manual "dismiss" for user-triggered clears

5. **Loading states for better UX:**
   - Show loading spinners during API calls
   - Disable buttons during loading
   - Prevent duplicate requests

6. **Type safety:**
   - Define TypeScript interfaces for all API request/response types
   - Use type assertions carefully, prefer type guards

## Troubleshooting

### CORS Errors

If you see CORS errors, check:
1. Backend CORS configuration (`backend/api/config.py`)
2. Frontend API URL matches backend (`NEXT_PUBLIC_API_URL`)

### 404 Errors

- Check API endpoint paths match backend routes
- Verify backend is running on correct port (8002)

### Type Errors

- Ensure TypeScript interfaces match backend response format
- Use browser DevTools to inspect actual API responses

### State Not Updating

- Check if Zustand store actions are actually called
- Verify `set()` calls use correct state updates
- Use React DevTools to inspect component state

## Related Files

- `lib/api.ts` - Main API client
- `stores/sourcesStore.ts` - Sources state management
- `stores/councilStore.ts` - Council state management
- `stores/aiAssistantStore.ts` - AI Assistant state
- `stores/helpStore.ts` - Help Center state
- `components/GlobalLayout.tsx` - Keyboard shortcuts
- `hooks/useKeyboardShortcuts.ts` - Keyboard shortcut hook
