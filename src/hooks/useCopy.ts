import { useState, useCallback, useRef } from "react";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    let success = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        textArea.readOnly = true;
        document.body.appendChild(textArea);

        try {
          const selection = document.getSelection();
          const range = document.createRange();
          range.selectNodeContents(textArea);
          selection?.removeAllRanges();
          selection?.addRange(range);
          textArea.setSelectionRange(0, textArea.value.length);
          success = document.execCommand("copy");
          selection?.removeAllRanges();
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (e) {
      success = false;
    }

    if (success) {
      setCopied(true);
      timerRef.current = window.setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 1800);
    }

    return success;
  }, []);

  return { copy, copied, setCopied };
}
