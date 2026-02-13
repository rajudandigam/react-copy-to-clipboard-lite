import { useActionState, useState } from "react";
import { createRoot } from "react-dom/client";
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
        <button type="button" onClick={reset}>
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
