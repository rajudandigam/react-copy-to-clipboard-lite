import React, { useActionState, useState } from "react";
import { createRoot } from "react-dom/client";
import { copyToClipboard } from "react-copy-to-clipboard-lite";
import {
  useCopyToClipboard,
  CopyToClipboard,
  copyToClipboardAction,
} from "react-copy-to-clipboard-lite/react";

const MULTILINE_TEXT = "line one\nline two\nline three";

type HookCopySource = "simple" | "input" | "multiline" | "clearAfter" | null;

function App() {
  const { copy, copied, error, reset } = useCopyToClipboard({
    clearAfter: 1000,
  });

  const [url] = useState("https://example.com/share");
  const [lastCopiedSource, setLastCopiedSource] =
    useState<HookCopySource>(null);
  const [lastHookResult, setLastHookResult] = useState<{
    success: boolean;
    method: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    method: string;
  } | null>(null);
  const [componentClicked, setComponentClicked] = useState(false);
  const [spanCopied, setSpanCopied] = useState(false);
  const [customCopied, setCustomCopied] = useState(false);
  const [actionResult, formAction] = useActionState(copyToClipboardAction, null);

  const showCopiedFeedback = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <main>
      <header className="hero">
        <h1>react-copy-to-clipboard-lite</h1>
        <p className="muted">
          Modern, dependency-free clipboard utility for React 18+ and React 19
          Actions.
        </p>
        <div className="code-block">
          npm i react-copy-to-clipboard-lite
        </div>
      </header>

      {/* Hook Examples */}
      <section>
        <h2>Hook Examples</h2>

        <h3>Simple imperative copy</h3>
        <div className="example-row">
          <button
            type="button"
            data-testid="hook-copy"
            onClick={() => {
              setLastCopiedSource("simple");
              copy("hook-text").then((r) =>
                setLastHookResult({ success: r.success, method: r.method })
              );
            }}
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
        </div>

        <h3>Copy from input field</h3>
        <input
          type="text"
          data-testid="input-copy-field"
          value={url}
          readOnly
          aria-label="URL to copy"
        />
        <div className="example-row">
          <button
            type="button"
            data-testid="input-copy-btn"
            onClick={() => {
              setLastCopiedSource("input");
              copy(url);
            }}
          >
            Copy URL
          </button>
          {lastCopiedSource === "input" && copied && (
            <span className="success-badge">Copied</span>
          )}
        </div>

        <h3>Multiline copy</h3>
        <pre data-testid="multiline-text">{MULTILINE_TEXT}</pre>
        <div className="example-row">
          <button
            type="button"
            data-testid="multiline-copy"
            onClick={() => {
              setLastCopiedSource("multiline");
              copy(MULTILINE_TEXT);
            }}
          >
            Copy multiline
          </button>
          {lastCopiedSource === "multiline" && copied && (
            <span className="success-badge">Copied</span>
          )}
        </div>

        <h3>clearAfter demo (clears in 1s)</h3>
        <div className="example-row">
          <button
            type="button"
            data-testid="clear-after-copy"
            onClick={() => {
              setLastCopiedSource("clearAfter");
              copy("secret-api-key");
            }}
          >
            Copy API key (clears in 1s)
          </button>
          {lastCopiedSource === "clearAfter" && copied && (
            <span data-testid="clear-after-indicator">
              Copied — clipboard will clear in 1s
            </span>
          )}
        </div>

        <h3>Programmatic copy (root import)</h3>
        <button
          type="button"
          data-testid="index-copy"
          onClick={() =>
            copyToClipboard("from-index").then((r) =>
              setLastResult({ success: r.success, method: r.method })
            )
          }
        >
          Copy via index
        </button>
        {lastResult && (
          <div>
            <span data-testid="index-copy-result">
              {String(lastResult.success)}
            </span>{" "}
            —
            <span data-testid="index-copy-method">{lastResult.method}</span>
          </div>
        )}

        {error != null ? (
          <div data-testid="error-state" role="alert">
            {String(error)}
          </div>
        ) : null}
      </section>

      {/* Component Examples */}
      <section>
        <h2>Component Wrapper</h2>

        <div className="example-block">
          <h3>Button</h3>
          <div className="example-row">
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
          </div>
        </div>

        <div className="example-block">
          <h3>Span (clickable text)</h3>
          <div className="example-row">
            <CopyToClipboard
              text="span-copy-text"
              onSuccess={() => showCopiedFeedback(setSpanCopied)}
            >
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
            {spanCopied && <span className="success-badge">Copied</span>}
          </div>
        </div>

        <div className="example-block">
          <h3>Custom button</h3>
          <div className="example-row">
            <CopyToClipboard
              text="custom-component-text"
              onSuccess={() => showCopiedFeedback(setCustomCopied)}
            >
              <button type="button" data-testid="custom-component-button">
                Custom button copy
              </button>
            </CopyToClipboard>
            {customCopied && <span className="success-badge">Copied</span>}
          </div>
        </div>

        <div className="example-block">
          <h3>preventDefault demo</h3>
          <CopyToClipboard text="blocked">
            <button
              type="button"
              data-testid="prevent-copy"
              onClick={(e) => e.preventDefault()}
            >
              Prevent Copy
            </button>
          </CopyToClipboard>
        </div>
      </section>

      {/* Action */}
      <section>
        <h2>React 19 Action</h2>
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
            <span data-testid="action-result">
              {String(actionResult.success)}
            </span>{" "}
            —
            <span data-testid="action-method">{actionResult.method}</span>
          </div>
        )}
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
