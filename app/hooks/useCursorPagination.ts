import { useState, useCallback } from "react";

export function useCursorPagination() {
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;

  const handleNext = useCallback((nextCursor: string | null | undefined) => {
    if (nextCursor) {
      setCursors((prev) => [...prev, nextCursor]);
    }
  }, []);

  const handlePrev = useCallback(() => {
    setCursors((prev) => prev.slice(0, -1));
  }, []);

  const resetCursors = useCallback(() => {
    setCursors([]);
  }, []);

  return {
    cursors,
    currentCursor,
    handleNext,
    handlePrev,
    resetCursors,
  };
}
