import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date?: Date) => void;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dateValue = typeof value === "string" ? new Date(value) : value;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-surface h-9 border-border hover:bg-surface-soft px-3",
            !dateValue && "text-ink-muted",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {dateValue && !isNaN(dateValue.getTime()) ? (
            format(dateValue, "dd/MM/yyyy", { locale: vi })
          ) : (
            <span className="text-ink-muted">dd/mm/yyyy</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border bg-surface shadow-ui-card">
        <Calendar
          mode="single"
          locale={vi}
          selected={
            dateValue && !isNaN(dateValue.getTime()) ? dateValue : undefined
          }
          onSelect={(date) => {
            onChange?.(date);
            // Delay closing to prevent Radix UI Dialog from falsely detecting an outside click when the popover unmounts
            setTimeout(() => setOpen(false), 10);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
