import { useEffect, type RefObject } from "react";

/**
 * Keep the cursor at the end of an input after value transformations.
 * Works around an iOS Safari bug where setSelectionRange scrolls the page.
 * See: https://bugs.webkit.org/show_bug.cgi?id=224425
 */
export function useCursorAtEnd(
  inputRef: RefObject<HTMLInputElement | null>,
  value: string,
  isFocused: boolean,
): void {
  useEffect(() => {
    const el = inputRef.current;
    if (el && isFocused) {
      const len = value.length;
      const scrollY = window.scrollY;
      el.setSelectionRange(len, len);
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    }
  }, [inputRef, value, isFocused]);
}
