# TeachAssist PWA Plan

## Overview

Convert TeachAssist to a client-side PWA with browser-based AI that:
- Runs entirely in the browser (no server required for core features)
- Stores all sensitive data locally (IndexedDB)
- Can be deployed to Vercel as a static/SSR app
- Works offline at school, on planes, anywhere
- Easy to share: "Here's the URL"

**Current State:** Next.js + FastAPI backend
**PWA Difficulty:** Medium
**Effort:** 2-3 days

---

## Architecture Change: Eliminate Backend

### Current Architecture
```
Browser → FastAPI Backend → Anthropic
                ↓
         InMemoryVectorStore
```

### New Architecture
```
Browser → Anthropic (direct)
   ↓
IndexedDB + Transformers.js (local embeddings)
```

---

## Key Changes

### A. Document Storage (IndexedDB)

```bash
npm install dexie
```

```typescript
// lib/storage.ts
import Dexie from 'dexie';

const db = new Dexie('TeachAssist');
db.version(1).stores({
  documents: '++id, filename, content, embedding, createdAt',
  chats: '++id, conversationId, messages, createdAt',
  settings: 'key, value'
});

export { db };
```

### B. Client-Side Embeddings (Transformers.js)

```bash
npm install @xenova/transformers
```

```typescript
// lib/embeddings.ts
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

export async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await initEmbedder();
  const result = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}
```

### C. Direct Anthropic Calls

```typescript
// lib/api.ts
import Anthropic from '@anthropic-ai/sdk';
import { db } from './storage';

export async function chat(message: string, context: string): Promise<string> {
  const apiKey = await getStoredApiKey();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` }]
  });

  return response.content[0].text;
}

async function getStoredApiKey(): Promise<string> {
  const setting = await db.settings.get('anthropic_api_key');
  if (!setting) throw new Error('API key not configured');
  return setting.value;
}
```

### D. Static Personas

```typescript
// data/personas.ts
export const PERSONAS = {
  'pedagogy-coach': {
    name: 'Pedagogy Coach',
    systemPrompt: `You are an experienced instructional coach...`,
    icon: 'graduation-cap'
  },
  'standards-guardian': {
    name: 'Standards Guardian',
    systemPrompt: `You are an expert in educational standards...`,
    icon: 'shield-check'
  },
  'equity-advocate': {
    name: 'Equity Advocate',
    systemPrompt: `You champion inclusive education...`,
    icon: 'heart'
  },
  'devils-advocate': {
    name: "Devil's Advocate",
    systemPrompt: `You challenge assumptions constructively...`,
    icon: 'scale'
  }
};
```

---

## New File Structure

```
app/
  page.tsx              # Welcome (unchanged)
  sources/page.tsx      # Upload to IndexedDB
  chat/page.tsx         # Direct Anthropic calls
  council/page.tsx      # Local personas
  settings/page.tsx     # NEW: API key config
lib/
  storage.ts            # NEW: IndexedDB wrapper
  embeddings.ts         # NEW: Browser embeddings
  api.ts                # UPDATED: Direct Anthropic
  search.ts             # NEW: Local vector search
data/
  personas.ts           # NEW: Bundled personas
public/
  manifest.json         # NEW: PWA manifest
  sw.js                 # NEW: Service worker
  icons/                # NEW: App icons
```

---

## API Key Management

```typescript
// User enters API key once, stored in IndexedDB
// Never sent to any server
// Clear option in settings

// app/settings/page.tsx
export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');

  const saveApiKey = async () => {
    await db.settings.put({ key: 'anthropic_api_key', value: apiKey });
  };

  const clearApiKey = async () => {
    await db.settings.delete('anthropic_api_key');
    setApiKey('');
  };

  // ... UI
}
```

---

## Offline Capabilities

### Works Offline
- Browse all uploaded documents
- Search within documents (local embeddings)
- View chat history
- View saved council advice
- Take notes, organize

### Needs Connection
- New AI chat (requires Anthropic API)
- New council consultation (requires Anthropic API)
- Document embedding (first upload only)

### Teacher at School Scenario
1. **At home:** Upload curriculum, chat with AI, get council advice
2. **At school (offline):** Review everything prepared, search docs, read advice
3. Perfect for "prep at home, use at school"

---

## PWA Infrastructure

### Manifest Configuration
```json
{
  "name": "TeachAssist",
  "short_name": "TeachAssist",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Strategy
- Cache-first for static assets
- Offline fallback for API calls (show cached data)
- Background sync for uploads when back online

---

## Files to Modify

| File | Action |
|------|--------|
| `next.config.ts` | Add PWA config |
| `app/layout.tsx` | Register service worker |
| `lib/api.ts` | UPDATED: Direct Anthropic calls |
| `lib/storage.ts` | NEW: IndexedDB wrapper |
| `lib/embeddings.ts` | NEW: Browser embeddings |
| `lib/search.ts` | NEW: Local vector search |
| `data/personas.ts` | NEW: Bundled personas |
| `app/settings/page.tsx` | NEW: API key config |
| `public/manifest.json` | NEW: PWA manifest |
| `public/sw.js` | NEW: Service worker |
| `public/icons/` | NEW: App icons |
| `backend/` | DELETE: No longer needed |

---

## Security Considerations

| Concern | Solution |
|---------|----------|
| API key storage | Store in IndexedDB, never log |
| Data privacy | All data local, never sent to our servers |
| CORS | Anthropic allows browser calls with `dangerouslyAllowBrowser` |
| School network | Works offline, no network = no filtering issues |

---

## Verification Steps

1. Remove backend dependency completely
2. Test document upload → stored in IndexedDB
3. Test search → embeddings work in browser
4. Test chat → calls Anthropic directly
5. Test offline mode:
   - Enable "Offline" in DevTools
   - Can browse documents
   - Can search (local)
   - Cannot start new chat (shows offline message)
6. Deploy to Vercel
7. Test install prompt on mobile
8. Test full workflow on iPad/phone
