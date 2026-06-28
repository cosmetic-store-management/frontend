import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableContentProps {
  children: React.ReactNode;
  maxHeight?: number; // Height in pixels before truncation kicks in
}

export function ExpandableContent({
  children,
  maxHeight = 800,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  useEffect(() => {
    // Check if content exceeds the max height
    if (contentRef.current) {
      if (contentRef.current.scrollHeight > maxHeight) {
        setNeedsExpansion(true);
      }
    }
  }, [children, maxHeight]);

  return (
    <div className="relative w-full">
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out overflow-hidden relative"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : `${maxHeight}px`,
        }}
      >
        {children}

        {/* Fade overlay when collapsed */}
        {!isExpanded && needsExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        )}
      </div>

      {needsExpansion && (
        <div
          className={`flex justify-center w-full ${isExpanded ? "mt-6" : "-mt-6 relative z-10"}`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-surface hover:bg-surface-muted text-brand border border-brand px-6 py-2.5 rounded-sm font-semibold transition-colors "
          >
            {isExpanded ? (
              <>
                Thu gọn nội dung <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Xem thêm nội dung <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
