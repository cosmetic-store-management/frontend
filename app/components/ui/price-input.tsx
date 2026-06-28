import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  value?: string | number;
  onChange: (val: number | "") => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PriceInput({
  value,
  onChange,
  placeholder = "0",
  className,
  disabled = false,
}: PriceInputProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      const num = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
      {
        /* eslint-disable-next-line  */
      }
      setDisplay(num.toLocaleString("vi-VN"));
    } else {
      setDisplay("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digitsOnly = input.replace(/\D/g, "");

    if (!digitsOnly) {
      setDisplay("");
      onChange("");
      return;
    }

    const num = parseInt(digitsOnly, 10);
    setDisplay(num.toLocaleString("vi-VN"));
    onChange(num);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
