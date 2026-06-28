import * as React from "react";
import { format, parseISO } from "date-fns";
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
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? parseISO(value) : undefined,
  );
  const [time, setTime] = React.useState<string>(
    value ? format(parseISO(value), "HH:mm") : "00:00",
  );

  React.useEffect(() => {
    if (value) {
      const parsed = parseISO(value);
      if (!isNaN(parsed.getTime())) {
        {
          /* eslint-disable-next-line  */
        }
        setDate(parsed);
        setTime(format(parsed, "HH:mm"));
      }
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && onChange) {
      const newDateTime = new Date(selectedDate);
      const [hours, minutes] = time.split(":").map(Number);
      newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      onChange(newDateTime.toISOString());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, "");

    // Auto insert colon
    if (
      val.length === 2 &&
      !val.includes(":") &&
      e.target.value.length > time.length
    ) {
      val += ":";
    }

    if (val.length > 5) return;
    setTime(val);

    if (val.length === 5 && val.includes(":") && date && onChange) {
      const [hours, minutes] = val.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const newDateTime = new Date(date);
        newDateTime.setHours(hours, minutes, 0, 0);
        onChange(newDateTime.toISOString());
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-surface h-10 border-border hover:bg-surface-soft",
            !date && "text-ink-muted",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: vi }) + " " + time
          ) : (
            <span>Chọn ngày giờ</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border bg-surface shadow-ui-card">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
        <div className="p-3 border-t border-border flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink">Thời gian</span>
          <Input
            type="text"
            placeholder="00:00"
            value={time}
            onChange={handleTimeChange}
            className="w-[80px] h-8 text-sm bg-surface border-border text-center"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
