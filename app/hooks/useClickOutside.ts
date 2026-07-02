import { useEffect, type RefObject } from "react";

/**
 * Hook for detecting clicks outside an element (for example, clicking outside a menu to close it).
 *
 * @param ref Reference to the HTML element that contains the UI
 * @param handler Function called when the user clicks outside
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Ignore clicks that happen inside the element itself
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
