# Starter Template Evaluation

## Primary Technology Domain

**Decentralized Web Frontend** - Static React application with P2P data layer (Nostr + Arweave)

**Requirements:**
- React 18+ with TypeScript for type safety
- shadcn/ui (Radix UI + Tailwind CSS) for accessible components
- Vite for fast build tooling and HMR
- Static deployment capability (CDN, IPFS)
- Clean integration points for nostr-tools + ar.io SDKs

---

## Starter Options Considered

### **Option 1: Official Vite + Manual shadcn/ui Setup** ⭐ **SELECTED**

**Approach:** Start with official Vite React-TypeScript template, then add shadcn/ui manually

**Pros:**
- Official, well-maintained foundation (Vite v7, React 19)
- Clean, minimal setup - no unnecessary dependencies
- Full control over configuration
- Easy to integrate custom SDKs (nostr-tools, ar.io)
- Official shadcn/ui documentation for Vite integration
- Latest tooling (Vite 7, React 19, Tailwind 4)

**Cons:**
- Requires manual setup steps (though well-documented)
- Need to configure linting/formatting separately

---

### **Option 2: vite-react-ts-shadcn-ui Boilerplate**

Pre-configured template with React 19, TypeScript, Shadcn/ui, TailwindCSS 4, Vite 7, SWC, ESLint 9, Husky

**Pros:** Everything pre-configured, faster initial setup
**Cons:** May include unnecessary dependencies, less flexibility for Rig's specific needs

---

### **Option 3: shadcn-create CLI Tool**

Official scaffolding from shadcn/ui team

**Pros:** Automated setup, official tooling
**Cons:** Newer tool, may include features we don't need

---

## Selected Starter: Vite + React-TypeScript + shadcn/ui (Manual Setup)

**Rationale for Selection:**

1. **Clean Foundation:** Official Vite template provides minimal, well-tested base
2. **Custom Integration:** Easier to add nostr-tools, ar.io SDKs, TanStack Query without conflicts
3. **Learning & Control:** Team understands every piece of the stack
4. **Maintainability:** Following official docs = easier long-term maintenance
5. **Latest Versions:** Vite 7, React 19, Tailwind 4, shadcn/ui latest
6. **No Bloat:** Only includes what we need for decentralized architecture

---

## Initialization Commands

**Step 1: Create Vite Project**
```bash
npm create vite@latest rig-frontend -- --template react-ts
cd rig-frontend
npm install
```

**Step 2: Add Tailwind CSS**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure TypeScript Paths**

Edit `tsconfig.json` and `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4: Configure Vite for Path Aliases**

Edit `vite.config.ts`:
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Step 5: Initialize shadcn/ui**
```bash
npx shadcn@latest init
```

Configuration selections:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components location: @/components
- Utils location: @/lib/utils
- React Server Components: No
- Write tsconfig paths: Yes

**Step 6: Install Core SDKs**
```bash