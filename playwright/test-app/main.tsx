import React, { useActionState, useState } from "react";
import { createRoot } from "react-dom/client";
import { copyToClipboard } from "react-copy-to-clipboard-lite";
import {
  useCopyToClipboard,
  CopyToClipboard,
  copyToClipboardAction,
} from "react-copy-to-clipboard-lite/react";

const MULTILINE_TEXT = "line one\nline two\nline three";

function HookExamples() {
  const { copy, copied, error, reset } = useCopyToClipboard({
    clearAfter: 1000,
  });
  const [url, setUrl] = useState("https://example.com/share");
  const [lastHookResult, setLastHookResult] = useState<{
    success: boolean;
    method: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    method: string;
  } | null>(null);

  return (
    <section
      aria-labelledby="hook-heading"
      style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h2 id="hook-heading">1. Hook examples</h2>

      <h3>A. Simple imperative copy</h3>
      <button
        type="button"
        data-testid="hook-copy"
        onClick={() =>
          copy("hook-text").then((r) =>
            setLastHookResult({ success: r.success, method: r.method })
          )
        }
      >
        Copy hook-text
      </button>
      <span
        data-testid="copied-state"
        aria-live="polite"
        aria-atomic="true"
      >
        {String(copied)}
      </span>
      {lastHookResult != null && (
        <span data-testid="hook-method">{lastHookResult.method}</span>
      )}
      <button type="button" data-testid="reset-btn" onClick={reset}>
        Reset
      </button>

      <h3>B. Copy from input field</h3>
      <input
        type="text"
        data-testid="input-copy-field"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="URL to copy"
      />
      <button
        type="button"
        data-testid="input-copy-btn"
        onClick={() => copy(url)}
      >
        Copy URL
      </button>

      <h3>C. Multiline copy</h3>
      <pre data-testid="multiline-text">{MULTILINE_TEXT}</pre>
      <button
        type="button"
        data-testid="multiline-copy"
        onClick={() => copy(MULTILINE_TEXT)}
      >
        Copy multiline
      </button>

      <h3>D. Temporary success UI (copied state)</h3>
      <button
        type="button"
        data-testid="success-toggle-copy"
        onClick={() => copy("toggled")}
        disabled={copied}
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <h3>E. clearAfter demo (clears in 1s)</h3>
      <button
        type="button"
        data-testid="clear-after-copy"
        onClick={() => copy("secret-api-key")}
      >
        Copy API key (clears in 1s)
      </button>
      {copied && (
        <span data-testid="clear-after-indicator">
          Copied — clipboard will clear in 1s
        </span>
      )}

      <h3>Programmatic copy (root import)</h3>
      <button
        type="button"
        data-testid="index-copy"
        onClick={() =>
          copyToClipboard("from-index").then((r) => {
            setLastResult({ success: r.success, method: r.method });
          })
        }
      >
        Copy via index
      </button>
      {lastResult !== null && (
        <>
          <span data-testid="index-copy-result">{String(lastResult.success)}</span>
          <span data-testid="index-copy-method">{lastResult.method}</span>
        </>
      )}

      {error != null && (
        <div data-testid="error-state" role="alert">
          Error: {String(error)}
        </div>
      )}
    </section>
  );
}

function MyFancyButton({
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-testid="custom-component-button"
      onClick={onClick}
      style={{ fontWeight: "bold" }}
      {...props}
    >
      {children}
    </button>
  );
}

function ComponentExamples() {
  const [componentClicked, setComponentClicked] = useState(false);

  return (
    <section
      aria-labelledby="component-heading"
      style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h2 id="component-heading">2. Component wrapper examples</h2>

      <h3>A. Button</h3>
      <CopyToClipboard text="component-text">
        <button
          type="button"
          data-testid="component-copy"
          onClick={() => setComponentClicked(true)}
        >
          Copy component-text
        </button>
      </CopyToClipboard>
      {componentClicked && (
        <span data-testid="component-onclick-fired">yes</span>
      )}

      <h3>B. Span (clickable text)</h3>
      <CopyToClipboard text="span-copy-text">
        <span
          data-testid="component-span"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          Click to copy span text
        </span>
      </CopyToClipboard>

      <h3>C. Custom component</h3>
      <CopyToClipboard text="custom-component-text">
        <MyFancyButton>Copy with custom button</MyFancyButton>
      </CopyToClipboard>

      <h3>D. preventDefault demo</h3>
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
  );
}

function ActionExamples() {
  const [actionResult, formAction] = useActionState(copyToClipboardAction, null);

  return (
    <section
      aria-labelledby="action-heading"
      style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h2 id="action-heading">3. React 19 action</h2>
      <form action={formAction}>
        <input
          type="text"
          name="text"
          defaultValue="action-text"
          data-testid="action-input"
          aria-label="Text to copy"
        />
        <button type="submit" data-testid="action-copy">
          Copy via action
        </button>
      </form>
      {actionResult && (
        <div data-testid="action-metadata">
          <span data-testid="action-result">{String(actionResult.success)}</span>
          <span data-testid="action-method">{actionResult.method}</span>
        </div>
      )}
    </section>
  );
}

function ErrorDemoSection() {
  const { copy, error } = useCopyToClipboard();
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    method: string;
    code?: string;
  } | null>(null);

  return (
    <section
      aria-labelledby="error-heading"
      style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h2 id="error-heading">4. Error / metadata</h2>
      <p>
        When copy fails (e.g. insecure context, denied), error and method are
        available.
      </p>
      <button
        type="button"
        data-testid="error-demo-copy"
        onClick={() =>
          copy("will-fail-in-insecure").then((r) =>
            setLastResult({
              success: r.success,
              method: r.method,
              code: r.code,
            })
          )
        }
      >
        Copy (shows error if unsupported)
      </button>
      {(error != null || lastResult != null) && (
        <div data-testid="error-demo-state" role="alert">
          {error != null && <div>Error: {String(error)}</div>}
          {lastResult != null && (
            <div>
              Success: {String(lastResult.success)}, Method: {lastResult.method}
              {lastResult.code != null && `, Code: ${lastResult.code}`}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function App() {
  return (
    <main>
      <h1>react-copy-to-clipboard-lite</h1>

      <HookExamples />
      <ComponentExamples />
      <ActionExamples />
      <ErrorDemoSection />
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
