# react-copy-to-clipboard-lite

Tiny, modern React 19+ clipboard utility with tiered fallback and structured metadata. Zero dependencies, SSR-safe, TypeScript-native, MIT.

## Install

```bash
npm install react-copy-to-clipboard-lite
```

## Entry points

| Import | Use case |
|--------|----------|
| `react-copy-to-clipboard-lite` | Full API (core + React) |
| `react-copy-to-clipboard-lite/core` | Engine only (no React) |
| `react-copy-to-clipboard-lite/react` | React only (hook, component, action) |

## Usage

### Core (engine only)

```ts
import { copyToClipboard } from "react-copy-to-clipboard-lite/core";

const result = await copyToClipboard("Hello");
// result: { success: boolean; method: "clipboard-api" | "exec-command" | "unsupported" | "failed"; code?: CopyErrorCode; error?: unknown }
```

### Hook

```tsx
import { useCopyToClipboard } from "react-copy-to-clipboard-lite";

function CopyButton() {
  const { copy, copied, error, reset } = useCopyToClipboard({ timeout: 2000 });

  return (
    <button onClick={() => copy("Hello")}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
```

### Component

```tsx
import { CopyToClipboard } from "react-copy-to-clipboard-lite";

<CopyToClipboard text="Hello" onSuccess={() => console.log("Copied!")}>
  <button>Copy</button>
</CopyToClipboard>
```

### React 19 Action

```tsx
import { copyToClipboardAction } from "react-copy-to-clipboard-lite";

<form>
  <input name="text" defaultValue="Hello" />
  <button formAction={copyToClipboardAction}>Copy</button>
</form>
```

---

## Migration from react-copy-to-clipboard

If you use [react-copy-to-clipboard](https://www.npmjs.com/package/react-copy-to-clipboard):

| Old (react-copy-to-clipboard) | New (react-copy-to-clipboard-lite) |
|--------------------------------|-------------------------------------|
| `import { CopyToClipboard } from "react-copy-to-clipboard"` | `import { CopyToClipboard } from "react-copy-to-clipboard-lite"` |
| `<CopyToClipboard text={value}><button>Copy</button></CopyToClipboard>` | Same: `<CopyToClipboard text={value}><button>Copy</button></CopyToClipboard>` |
| `onCopy()` callback | Use `onSuccess={(r) => ...}` or `onCopyResult={(r) => ...}`; result is `CopyResult` with `success`, `method`, `code?`, `error?` |
| No hook / imperative API | Use `useCopyToClipboard()` for `{ copy, copied, error, reset }` or `copyToClipboard(text, options)` from core |
| No form actions | Use `copyToClipboardAction` with `formAction` / `useActionState` (React 19) |

**Differences:**

- **Naming:** Component is `CopyToClipboard` (PascalCase); hook is `useCopyToClipboard`; core function is `copyToClipboard`; action is `copyToClipboardAction`.
- **Result shape:** Callbacks receive `CopyResult`: `{ success, method, code?, error? }` instead of a bare success boolean.
- **Child click order:** This library runs the child’s `onClick` first, then performs the copy (so child can update state before copy). If the child calls `e.preventDefault()`, copy is skipped.
- **Subpath imports:** For tree-shaking, use `react-copy-to-clipboard-lite/core` or `react-copy-to-clipboard-lite/react` when you only need that surface.

---

## License

MIT
