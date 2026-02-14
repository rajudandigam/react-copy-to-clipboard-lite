import React, { useActionState, useState } from "react";
import { createRoot } from "react-dom/client";
import { copyToClipboard } from "react-copy-to-clipboard-lite";
import {
  useCopyToClipboard,
  CopyToClipboard,
  copyToClipboardAction,
} from "react-copy-to-clipboard-lite/react";

function App() {
  const { copy, copied, reset } = useCopyToClipboard({
    clearAfter: 1000,
  });
  const [actionResult, formAction] = useActionState(copyToClipboardAction, null);
  const [componentClicked, setComponentClicked] = useState(false);
  const [indexCopyOk, setIndexCopyOk] = useState<boolean | null>(null);

  return (
    <main>
      <h1>Copy smoke test</h1>

      <section>
        <h2>Hook</h2>
        <button
          type="button"
          data-testid="hook-copy"
          onClick={() => copy("hook-text")}
        >
          Copy hook-text
        </button>
        <span data-testid="copied-state">{String(copied)}</span>
        <button type="button" data-testid="reset-btn" onClick={reset}>
          Reset
        </button>
      </section>

      <section>
        <h2>Component</h2>
        <CopyToClipboard text="component-text">
          <button
            type="button"
            data-testid="component-copy"
            onClick={() => setComponentClicked(true)}
          >
            Copy component-text
          </button>
        </CopyToClipboard>
        {componentClicked && <span data-testid="component-onclick-fired">yes</span>}
        <CopyToClipboard text="blocked">
          <button
            type="button"
            data-testid="prevent-copy"
            onClick={(e) => e.preventDefault()}
          >
            Prevent Copy
          </button>
        </CopyToClipboard>
      </section>

      <section>
        <h2>Root import (index)</h2>
        <button
          type="button"
          data-testid="index-copy"
          onClick={() =>
            copyToClipboard("from-index").then((r) =>
              setIndexCopyOk(r.success)
            )
          }
        >
          Copy via index
        </button>
        {indexCopyOk !== null && (
          <span data-testid="index-copy-result">{String(indexCopyOk)}</span>
        )}
      </section>

      <section>
        <h2>Action (form)</h2>
        <form action={formAction}>
          <input
            type="text"
            name="text"
            defaultValue="action-text"
            data-testid="action-input"
          />
          <button type="submit" data-testid="action-copy">
            Copy via action
          </button>
        </form>
        {actionResult && (
          <span data-testid="action-result">{String(actionResult?.success)}</span>
        )}
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
