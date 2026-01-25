# Unified Local-First PWA Architecture Plan

## Overview

Convert TeachAssist, PropertyManager, and CC4 to offline-capable PWAs that:
- Run entirely in the browser (no server required for core features)
- Store all sensitive data locally (IndexedDB)
- Can be deployed to Vercel as static/SSR apps
- Work offline at school, on planes, anywhere
- Easy to share: "Here's the URL"

## App Comparison

| Aspect | PropertyManager | TeachAssist | CC4 |
|--------|-----------------|-------------|-----|
| **Current State** | Client-only SPA | Next.js + FastAPI | React + FastAPI |
| **Data Storage** | localStorage | Server files | PostgreSQL |
| **AI Features** | Project generation | Chat + Council | Agent orchestration |
| **PWA Difficulty** | Easy ✅ | Medium ⚠️ | Hard ❌ |
| **Fully Client-Side?** | Yes | Yes (with changes) | Partial only |

## Recommended Approach

### PropertyManager: Pure Client-Side PWA ✅
**Effort: 4-6 hours**

Already client-side. Just add:
1. `manifest.json` + service worker
2. Migrate localStorage → IndexedDB (larger capacity)
3. Add install prompt UI
4. Deploy to Vercel

### TeachAssist: Client-Side PWA with Browser AI ⚠️
**Effort: 2-3 days**

Eliminate backend dependency:
1. Store documents in IndexedDB (not server)
2. Run embeddings in browser (Transformers.js)
3. Call Anthropic directly from browser (user's API key)
4. Personas as static JSON (bundled with app)

### CC4: Hybrid (PWA View + Self-Hosted Server) ❌
**Effort: 1-2 weeks**

Too complex for pure client-side:
- Multi-agent orchestration needs server
- Git/GitHub operations need server
- E2B/Dagger execution needs server

**Recommendation:** Build a PWA "companion app" for mobile view/light editing, keep full functionality on server.

---

## Phase 1: PropertyManager PWA (Easiest First)

### 1.1 Add PWA Infrastructure
```
public/
  manifest.json        # App metadata, icons
  sw.js               # Service worker
  icons/              # App icons (192x192, 512x512)
```

### 1.2 Manifest Configuration
```json
{
  "name": "PropertyManager",
  "short_name": "PropMgr",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0b0d",
  "theme_color": "#0a0b0d",
  "icons": [...]
}
```

### 1.3 Service Worker Strategy
- Cache-first for static assets
- Offline fallback page
- Background sync for future features

### 1.4 Storage Migration
- localStorage (5MB limit) → IndexedDB (unlimited)
- Use Dexie.js for easy IndexedDB API

### 1.5 Deploy to Vercel
```bash
npm install
npm run build
vercel --prod
```

---

## Phase 2: TeachAssist PWA (Core Focus)

### 2.1 Architecture Change: Eliminate Backend

**Current:**
```
Browser → FastAPI Backend → Anthropic
                ↓
         InMemoryVectorStore
```

**New:**
```
Browser → Anthropic (direct)
   ↓
IndexedDB + Transformers.js (local embeddings)
```

### 2.2 Key Changes

#### A. Document Storage (IndexedDB)
```typescript
// New: lib/storage.ts
import Dexie from 'dexie';

const db = new Dexie('TeachAssist');
db.version(1).stores({
  documents: '++id, filename, content, embedding, createdAt',
  chats: '++id, conversationId, messages, createdAt',
  settings: 'key, value'
});
```

#### B. Client-Side Embeddings
```typescript
// New: lib/embeddings.ts
import { pipeline } from '@xenova/transformers';

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

export async function embedText(text: string): Promise<number[]> {
  const result = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}
```

#### C. Direct Anthropic Calls
```typescript
// Updated: lib/api.ts
import Anthropic from '@anthropic-ai/sdk';

export async function chat(message: string, context: string): Promise<string> {
  const apiKey = await getStoredApiKey(); // From IndexedDB
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` }]
  });

  return response.content[0].text;
}
```

#### D. Static Personas
```typescript
// New: data/personas.ts
export const PERSONAS = {
  'pedagogy-coach': {
    name: 'Pedagogy Coach',
    systemPrompt: '...',
    // ... bundled with app
  }
};
```

### 2.3 New File Structure
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
```

### 2.4 API Key Management
```typescript
// User enters API key once, stored encrypted in IndexedDB
// Never sent to any server
// Clear option in settings
```

### 2.5 Offline Capabilities

**Works Offline:**
- ✅ Browse all uploaded documents
- ✅ Search within documents (local embeddings)
- ✅ View chat history
- ✅ View saved council advice
- ✅ Take notes, organize

**Needs Connection:**
- ❌ New AI chat (requires Anthropic API)
- ❌ New council consultation (requires Anthropic API)
- ❌ Document embedding (first upload only)

**Teacher at School Scenario:**
1. At home: Upload curriculum, chat with AI, get council advice
2. At school (offline): Review everything she prepared, search docs, read advice
3. Perfect for "prep at home, use at school"

---

## Phase 3: CC4 Companion PWA (Lower Priority)

### 3.1 Limited Scope
Mobile PWA provides:
- View projects and tasks
- Read chat history
- Light editing of notes
- Push notifications (future)

Full functionality requires desktop + server.

### 3.2 Implementation
- Share Zustand stores design with TeachAssist
- Read-only API for mobile
- Background sync for changes

---

## Shared Infrastructure

### Common PWA Package
Create `@performancesuite/pwa-utils`:
```typescript
// Shared across all three apps
export { registerServiceWorker } from './sw';
export { openDB, getDB } from './indexeddb';
export { encryptApiKey, decryptApiKey } from './crypto';
export { checkOnlineStatus, useOnlineStatus } from './network';
```

### Shared UI Components
```typescript
// Offline indicator
export { OfflineBanner } from './components/OfflineBanner';
// API key setup
export { ApiKeySetup } from './components/ApiKeySetup';
// Install prompt
export { InstallPrompt } from './components/InstallPrompt';
```

---

## Implementation Order

1. **PropertyManager** (4-6 hours)
   - Simplest, proves the pattern
   - Already client-side

2. **TeachAssist** (2-3 days)
   - Core teacher use case
   - Requires backend elimination

3. **CC4 Companion** (1-2 weeks)
   - Most complex
   - Hybrid approach

---

## Verification Steps

### PropertyManager
1. `npm run build && npm run preview`
2. Open Chrome DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. App should still load and function
5. Deploy to Vercel, test on mobile

### TeachAssist
1. Remove backend dependency completely
2. Test document upload → stored in IndexedDB
3. Test search → embeddings work in browser
4. Test chat → calls Anthropic directly
5. Test offline → can browse, can't chat
6. Deploy to Vercel

### CC4
1. Build companion PWA
2. Test read-only project view
3. Test light editing with sync
4. Test offline viewing

---

## Security Considerations

| Concern | Solution |
|---------|----------|
| API key storage | Encrypt in IndexedDB, never log |
| Data privacy | All data local, never sent to our servers |
| CORS | Anthropic allows browser calls with `dangerouslyAllowBrowser` |
| School network | Works offline, no network = no filtering |

---

## Files to Modify

### PropertyManager
- `vite.config.ts` - Add PWA plugin
- `index.html` - Add manifest link
- `public/manifest.json` - NEW
- `public/sw.js` - NEW
- `src/lib/storage.ts` - Migrate to IndexedDB

### TeachAssist
- `next.config.ts` - Add PWA config
- `app/layout.tsx` - Register SW
- `lib/api.ts` - Direct Anthropic calls
- `lib/storage.ts` - NEW IndexedDB
- `lib/embeddings.ts` - NEW browser embeddings
- `app/settings/page.tsx` - NEW API key config
- `public/manifest.json` - NEW
- `public/sw.js` - NEW
- DELETE: `backend/` (no longer needed)
