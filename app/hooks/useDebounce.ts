/**
 * useDebounce — debounce một value sau delay ms.
 *
 * Dùng:
 *   const debouncedSearch = useDebounce(searchText, 300)
 */

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
