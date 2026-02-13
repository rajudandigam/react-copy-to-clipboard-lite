import type { ReactElement } from "react";
import { cloneElement } from "react";
import { copyToClipboard } from "../core/copy.js";
import type { CopyResult } from "../core/types.js";

export type CopyToClipboardProps = {
  text: string;
  clearAfter?: number;
  onCopyResult?: (r: CopyResult) => void;
  onSuccess?: (r: CopyResult) => void;
  onError?: (r: CopyResult) => void;
  children: ReactElement<{ onClick?: React.MouseEventHandler }>;
};

export function CopyToClipboard({
  text,
  clearAfter,
  onCopyResult,
  onSuccess,
  onError,
  children,
}: CopyToClipboardProps): ReactElement {
  const handleClick = async (e: React.MouseEvent) => {
    const childOnClick = (children.props as { onClick?: (ev: React.MouseEvent) => void })?.onClick;
    childOnClick?.(e);

    if (e.defaultPrevented) return;

    const result = await copyToClipboard(text, { clearAfter });

    onCopyResult?.(result);
    if (result.success) onSuccess?.(result);
    else onError?.(result);
  };

  return cloneElement(children, { onClick: handleClick });
}
