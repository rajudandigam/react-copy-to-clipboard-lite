# react-copy-to-clipboard-lite — Dev Architecture Context

Single source of truth for scaffolding, implementation, testing, packaging, and release. Reference via `@docs/DEV-ARCHITECTURE.md` in Cursor or use with always-applied rules.

---

## 1. Goal and scope

### One-line goal

Build the smallest React 19+ clipboard micro-library with reliable HTTP fallback, structured CopyResult metadata, Actions support, and a migration-friendly `<Copy>` component — zero dependencies, SSR-safe, TypeScript-native, MIT.

### Must-have features (v1)

- **Core engine**: `copy(text, options)` — modern-first (Async Clipboard API), tiered fallback to execCommand via invisible `<textarea>`, SSR-safe, permission-aware (optional check, no prompting), returns structured `CopyResult`, supports `clearAfter` (clear only, no restore).
- **React Hook**: `useClipboard({ timeout, clearAfter })` — `copy(text)` returning `Promise<CopyResult>`, `copied` boolean with auto-reset via timeout, `error` from last attempt, cleanup timers on unmount.
- **Component**: `<Copy text="...">child</Copy>` — uses `cloneElement` to inject `onClick`, preserves user's existing `onClick`; optional `onCopyResult`, `onSuccess`, `onError`.
- **React 19 Actions**: `copyAction` helper compatible with `formAction` and `useActionState`; developer can use React's pending states without extra local state.
- **Quality**: Vitest unit tests (engine tiers + result metadata), Playwright smoke tests (Chromium/Firefox/WebKit), ESM + CJS + types via tsup, MIT license, clean README, contributor-friendly repo.

### Explicit non-goals (v1)

- No IE11 / clipboardData.
- No `prompt()` fallback.
- No UI (toasts, icons).
- No global state / provider.
- No clipboard-read / restore previous content.

---

## 2. Public API contract

This is the **contract**; implementations and PRs must match. Do not change without updating this spec.

### Core

```ts
export type CopyMethod =
  | 'clipboard-api'
  | 'exec-command'
  | 'unsupported'
  | 'failed';

export type CopyErrorCode =
  | 'SECURITY_ERROR'
  | 'PERMISSION_DENIED'
  | 'INSECURE_CONTEXT'
  | 'NO_BROWSER_SUPPORT'
  | 'UNKNOWN';

export type CopyResult = {
  success: boolean;
  method: CopyMethod;
  code?: CopyErrorCode;
  error?: unknown;
};

export type CopyOptions = {
  clearAfter?: number;   // ms; clear only; best-effort
  permissions?: 'auto' | 'none';  // default 'auto'
};

export async function copy(text: string, options?: CopyOptions): Promise<CopyResult>;
```

### React Hook

```ts
export type UseClipboardOptions = {
  timeout?: number;     // ms for copied=true reset
  clearAfter?: number;  // forwarded to engine
};

export function useClipboard(opts?: UseClipboardOptions): {
  copy: (text: string, options?: CopyOptions) => Promise<CopyResult>;
  copied: boolean;
  error: unknown | null;
  reset: () => void;
};
```

### Component

```ts
export function Copy(props: {
  text: string;
  clearAfter?: number;
  onCopyResult?: (r: CopyResult) => void;
  onSuccess?: (r: CopyResult) => void;
  onError?: (r: CopyResult) => void;
  children: React.ReactElement;
}): JSX.Element;
```

- Uses `cloneElement` to inject `onClick`.
- Preserves user's existing `onClick`.

### React 19 Actions helper

```ts
export async function copyAction(
  prevState: CopyResult | null,
  formData: FormData
): Promise<CopyResult>;
```

**Action usage example:**

```tsx
<form>
  <input name="text" defaultValue="Hello" />
  <button formAction={copyAction}>Copy</button>
</form>
```

---

## 3. Engine design (tiered + metadata)

### Tier rules (bulletproof)

| Tier | Condition | Result |
|------|-----------|--------|
| **Tier 0 (SSR guard)** | `typeof window === 'undefined'` | `{ success: false, method: 'unsupported', code: 'NO_BROWSER_SUPPORT' }` |
| **Tier 1 (Async Clipboard API)** | `navigator.clipboard?.writeText` exists; prefer `window.isSecureContext === true`. Attempt `await navigator.clipboard.writeText(text)`. | Success → `{ success: true, method: 'clipboard-api' }`. On failure: map SecurityError/NotAllowedError → SECURITY_ERROR or PERMISSION_DENIED; insecure context → INSECURE_CONTEXT; then fallback. |
| **Tier 2 (Support check)** | `document.queryCommandSupported?.('copy') === false` | Skip exec fallback; return unsupported. |
| **Tier 3 (execCommand fallback)** | Create off-screen `<textarea>`, set value, select, `document.execCommand('copy')`, cleanup. | Success → `{ success: true, method: 'exec-command' }`; else failed result. |
| **Tier 4 (No support)** | No path succeeded | `{ success: false, method: 'unsupported', code: 'NO_BROWSER_SUPPORT' }` |

**Tier 3 textarea requirements:** `readOnly = true`; `style.position = 'fixed'`, off-screen; `style.whiteSpace = 'pre'`; append to body; select contents; run `execCommand('copy')`; always cleanup selection and DOM node.

### clearAfter (secret mode)

- Only after **successful** copy.
- Schedule `navigator.clipboard.writeText('')` best-effort.
- Clearing failure must **not** flip `success` to false; may attach metadata via error but keep `success: true`.

### Permission awareness (no prompting)

- If `navigator.permissions?.query` exists and option `permissions: 'auto'`: try `query` for `'clipboard-write'` (best-effort; some browsers may throw).
- If state is `'denied'`, skip Tier 1 and go to exec fallback.
- Never request clipboard-read. Never call permissions.request or prompt the user.

---

## 4. Repo and file layout

```
react-copy-to-clipboard-lite/
├── src/
│   ├── core/
│   │   ├── types.ts      # CopyMethod, CopyErrorCode, CopyResult, CopyOptions
│   │   ├── permissions.ts
│   │   ├── fallback.ts   # Tier 3 textarea execCommand
│   │   └── copy.ts       # copy() engine
│   ├── react/
│   │   ├── useClipboard.ts
│   │   ├── Copy.tsx
│   │   └── actions.ts
│   ├── index.ts          # main entry (re-exports)
│   ├── core.ts           # core-only entry
│   └── react.ts          # react-only entry
├── tests/
│   ├── core.copy.test.ts
│   ├── react.useClipboard.test.tsx
│   └── playwright/
│       ├── copy.spec.ts
│       └── fixtures/
├── docs/
│   └── DEV-ARCHITECTURE.md
├── .cursorrules
├── package.json
├── tsup.config.ts
├── tsconfig.json
├── README.md
├── LICENSE
└── .github/workflows/ci.yml
```

- **src/core/** — types, permissions, fallback, copy engine (no React).
- **src/react/** — hook, `<Copy>`, actions.
- **src/index.ts, core.ts, react.ts** — packaging exports for main, core-only, react-only.
- **tests/** — Vitest unit tests; Playwright smoke and fixtures.

---

## 5. Build order (implementation sequence)

1. Core types (`src/core/types.ts`)
2. Permission helper (`src/core/permissions.ts`)
3. Fallback (`src/core/fallback.ts`)
4. Engine (`src/core/copy.ts`)
5. Hook (`src/react/useClipboard.ts`)
6. Component (`src/react/Copy.tsx`)
7. Actions (`src/react/actions.ts`)
8. Packaging exports (`src/index.ts`, `src/core.ts`, `src/react.ts`)
9. Tests (Vitest then Playwright)
10. Docs and release (README, changesets)

---

## 6. Testing plan

### Vitest (unit)

- **Tier selection**: secure context + clipboard available → Tier 1; clipboard throws SecurityError → fallback to Tier 3; `queryCommandSupported('copy') === false` → unsupported.
- **Metadata**: `method` and `code` values correct for common errors.
- **clearAfter**: runs only after success; clear failure does not flip `success`.

### Playwright (smoke)

- Chromium, Firefox, WebKit: clicking `<Copy>` triggers success.
- Optional: stub clipboard API failure to exercise fallback path.
- Minimal page fixture for deterministic checks.

---

## 7. Packaging and release

### Packaging

- **tsup**: `dist/index.mjs` + `dist/index.cjs`, `dist/core.mjs`/`dist/core.cjs`, `dist/react.mjs`/`dist/react.cjs`, plus `.d.ts`.
- **package.json**: `sideEffects: false`, proper `exports` map, `type: "module"` with CJS outputs.
- **Entry points**: `react-copy-to-clipboard-lite` (full), `react-copy-to-clipboard-lite/core` (core only), `react-copy-to-clipboard-lite/react` (React only).

### React 19 / RSC compatibility

- All browser-touching logic inside functions invoked at runtime, not module top-level.
- React entry (hook, `<Copy>`, actions) documented as client-only for Next.js etc.

### Release

- MIT license; changesets for versioning; GitHub Actions for CI and publish.

---

## 8. Cursor workflow (fast execution)

### A) .cursorrules first (guardrails)

- Strict TypeScript; no extra dependencies.
- Never use `prompt()`; never use clipboard-read.
- Exec fallback must be `<textarea>`-based only.
- Always return `CopyResult`.
- SSR-safe guards (no `window` at module top-level).

### B) Build order

- Follow section 5 when implementing or scaffolding.

### C) Prompt templates (copy-paste for Cursor)

**Engine:**  
Implement `copy(text, options)` with tiered clipboard writeText + execCommand fallback using textarea, SSR-safe, permission-aware (no prompts), and return CopyResult metadata.

**Hook:**  
Implement `useClipboard({ timeout, clearAfter })` returning `{ copy, copied, error, reset }`. Must cleanup timers and expose CopyResult from engine.

**Component:**  
Implement `<Copy text clearAfter onCopyResult onSuccess onError>{child}</Copy>` using cloneElement to inject onClick while preserving existing handlers.

**Actions:**  
Implement `copyAction(prevState, formData)` compatible with formAction/useActionState; reads text from FormData and returns CopyResult.

---

## 9. Execution checklist (definition of done)

- [ ] `copy()` works in modern browsers; fallback works in Safari/WebKit.
- [ ] Returns `CopyResult` with `method` and `code`.
- [ ] `clearAfter` clears only (best effort) without clipboard-read.
- [ ] `useClipboard` stable with cleanup; no timer leaks.
- [ ] `<Copy>` works with any clickable child and preserves handlers.
- [ ] `copyAction` works with React 19 formAction/useActionState.
- [ ] Vitest and Playwright (x3) tests passing.
- [ ] ESM + CJS + types published under MIT.
- [ ] README includes migration guide and Actions examples.

---

## 10. v1.1+ roadmap (brief)

- `copyRich({ text, html })` via ClipboardItem (separate export).
- size-limit CI gate (keep bundle tiny).
- More detailed error codes (e.g. Safari quirks).
- Doc recipes for Next.js, Remix, Vite.
