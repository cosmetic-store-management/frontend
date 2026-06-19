import React, { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PriceInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

function parseRaw(val: string): number {
  return parseInt(val.replace(/[.,\s]/g, "").replace(/\D/g, ""), 10) || 0;
}

function formatDisplay(num: number): string {
  if (num === 0) return "";
  return num.toLocaleString("vi-VN");
}

export function PriceInput({
  value,
  onChange,
  placeholder = "0",
  min = 0,
  step = 5000,
  className = "",
  disabled = false,
}: PriceInputProps) {
  const numericVal = parseRaw(value);
  const [display, setDisplay] = useState(formatDisplay(numericVal));

  useEffect(() => {
    setDisplay(formatDisplay(parseRaw(value)));
  }, [value]);

  const commit = useCallback((n: number) => {
    const safe = Math.max(min, n);
    onChange(String(safe));
    setDisplay(formatDisplay(safe));
  }, [min, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digitsOnly = input.replace(/[.,\s]/g, "").replace(/\D/g, "");
    setDisplay(input.replace(/[^\d.,]/g, ""));
    onChange(digitsOnly || "0");
  };

  const handleBlur = () => commit(numericVal);

  const adjust = (delta: number) => commit(Math.max(min, numericVal + delta));

  return (
    <div
      className={`flex items-stretch rounded-sm border border-border bg-surface overflow-hidden
        focus-within:ring-1 focus-within:ring-brand focus-within:border-brand
        transition-colors ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
    >
      {/* Ô nhập */}
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-9 px-2.5 text-sm bg-transparent font-mono text-right outline-none text-ink placeholder:text-ink-muted/40 min-w-0"
      />

      {/* Đơn vị ₫ */}
      <span className="flex items-center px-2 text-xs text-ink-muted border-l border-border select-none bg-surface-soft">
        ₫
      </span>

      {/* Spinner dọc ▲▼ */}
      <div className="flex flex-col border-l border-border w-6 shrink-0">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => adjust(step)}
          className="flex-1 flex items-center justify-center text-ink-muted hover:text-brand hover:bg-brand/5 transition-colors border-b border-border"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => adjust(-step)}
          className="flex-1 flex items-center justify-center text-ink-muted hover:text-brand hover:bg-brand/5 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
