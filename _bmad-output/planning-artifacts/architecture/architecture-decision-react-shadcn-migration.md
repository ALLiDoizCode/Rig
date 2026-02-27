# Architecture Decision: React + shadcn Migration

## New Decision (Today)
**Decision:** Rebuild Forgejo frontend using React + TypeScript + shadcn/ui, using Forgejo Vue components as reference material for understanding features and UX patterns.

**Rationale:**
1. **React Ecosystem Maturity** - Larger component ecosystem, better TypeScript support
2. **shadcn/ui Advantages** - Modern, accessible, composable components built on Radix UI + Tailwind
3. **Developer Experience** - Vite (faster than Webpack), better DX tooling
4. **Team Preference** - React is the target framework
5. **Keep What Works** - Tailwind CSS already used in Forgejo, shadcn uses Tailwind

---
