# react-copy-to-clipboard-lite

> Tiny, dependency-free clipboard utility for React 18+. SSR-safe. Permission-aware. MIT.

**~1.1 kB** (core & React entry, brotli). Size-gated in CI.

[![CI](https://github.com/rajudandigam/react-copy-to-clipboard-lite/actions/workflows/ci.yml/badge.svg)](https://github.com/rajudandigam/react-copy-to-clipboard-lite/actions)
[![Size](https://img.shields.io/bundlephobia/minzip/react-copy-to-clipboard-lite)](https://bundlephobia.com/package/react-copy-to-clipboard-lite)
[![License](https://img.shields.io/npm/l/react-copy-to-clipboard-lite)](LICENSE)

---

## Why this library?

- Zero runtime dependencies, tiered fallback (Clipboard API → execCommand)
- Structured `CopyResult`, never throws
- Permission-aware (no `prompt()`), SSR-safe
- React 19 `formAction` / `useActionState` support
- TypeScript strict, size-gated in CI

---

## Install

```bash
npm install react-copy-to-clipboard-lite
# or: pnpm add / yarn add
```

Peer: `react >= 18`

---

## Demo

**[Live demo](https://react-copy-to-clipboard-lite.vercel.app/)** · Run locally: `npm run dev:demo`

![Demo preview](https://raw.githubusercontent.com/rajudandigam/react-copy-to-clipboard-lite/main/docs/demo-preview.png)

---

## Core (framework-agnostic)

```ts
import { copyToClipboard } from "react-copy-to-clipboard-lite";

const result = await copyToClipboard("Hello world");
if (result.success) console.log("Copied via:", result.method);
else console.log("Failed:", result.code);
```

---

## Hook

```tsx
import { useCopyToClipboard } from "react-copy-to-clipboard-lite/react";

function Example() {
  const { copy, copied, error } = useCopyToClipboard({ timeout: 1500, clearAfter: 1000 });
  return (
    <button onClick={() => copy("Secret API Key")}>{copied ? "Copied!" : "Copy"}</button>
  );
}
```

`copy(text)` → `Promise<CopyResult>` · `copied` / `error` / `reset()`

---

## Component

```tsx
import { CopyToClipboard } from "react-copy-to-clipboard-lite/react";

<CopyToClipboard text="Copy this" onSuccess={() => {}} onError={(r) => console.log(r.code)}>
  <button>Copy</button>
</CopyToClipboard>
```

Preserves your `onClick`; works with buttons, spans, links.

---

## React 19 Action

```tsx
import { copyToClipboardAction } from "react-copy-to-clipboard-lite/react";

<form>
  <input name="text" defaultValue="Hello" />
  <button formAction={copyToClipboardAction}>Copy</button>
</form>
```

Works with `useActionState` and Server Components (client boundary).

---

## CopyResult

```ts
type CopyResult = {
  success: boolean;
  method: "clipboard-api" | "exec-command" | "unsupported" | "failed";
  code?: "SECURITY_ERROR" | "PERMISSION_DENIED" | "INSECURE_CONTEXT" | "NO_BROWSER_SUPPORT" | "UNKNOWN";
  error?: unknown;
};
```

---

## clearAfter (e.g. passwords)

```ts
copyToClipboard("my-password", { clearAfter: 3000 });
```

Clears clipboard after X ms (best-effort). Never reads clipboard.

---

## Behaviour

- **Permission-aware:** uses `navigator.permissions.query()` when available; never prompts.
- **SSR-safe:** browser APIs used only inside functions. Works in Next.js, Remix, Vite SSR, Astro, RSC.
- **Size:** CI enforces &lt; 2 KB (index), &lt; 3 KB (react); brotli.

---

## Browser support

| Clipboard API | execCommand fallback | IE11 |
|---------------|----------------------|------|
| Modern        | Safari / legacy      | No   |

No `prompt()` fallback; no clipboard-read.

---

## Comparison

| Feature           | This lib | Typical |
|-------------------|----------|---------|
| Zero deps         | Yes      | No      |
| SSR safe          | Yes      | Often   |
| Structured result | Yes      | No      |
| React 19 Actions  | Yes      | No      |
| Permission-aware  | Yes      | No      |

---

## Migration from react-copy-to-clipboard

```diff
- import { CopyToClipboard } from "react-copy-to-clipboard"
+ import { CopyToClipboard } from "react-copy-to-clipboard-lite/react"
```

---

## Contributing

PRs welcome. Before submitting: `npm run test:all` (typecheck, unit, Playwright, size).

---

## License

MIT © Raju Dandigam
