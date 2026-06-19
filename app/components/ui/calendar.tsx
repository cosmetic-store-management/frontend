import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// react-day-picker v10 compatible
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // "relative" so nav (rendered outside months) can anchor to root
      className={cn("p-3 relative", className)}
      classNames={{
        // ── Layout ──────────────────────────────────────────────────────────
        months:        "flex flex-col sm:flex-row gap-y-4 sm:gap-x-4",
        month:         "flex flex-col gap-y-4",

        // Caption: centred "Month Year" label
        month_caption: "flex items-center justify-center h-8",
        caption_label: "text-sm font-semibold text-ink",

        // Nav in v10 is a sibling of <months>, so we anchor it to root.
        // top-3 inset-x-3 mirrors the p-3 padding → sits in same row as caption.
        nav:             "absolute top-3 inset-x-3 h-8 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 text-ink-muted opacity-60 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 text-ink-muted opacity-60 hover:opacity-100"
        ),

        // ── Grid ────────────────────────────────────────────────────────────
        month_grid: "w-full border-collapse mt-1",
        weekdays:   "flex",
        weekday:    "w-9 text-center text-[0.75rem] font-medium text-ink-muted pb-1",
        week:       "flex w-full",

        // ── Day wrapper ──────────────────────────────────────────────────────
        day: "relative h-9 w-9 p-0 text-center focus-within:relative focus-within:z-20",

        // ── Day button ───────────────────────────────────────────────────────
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal transition-colors"
        ),

        // ── State classes (applied to day_button in v10) ─────────────────────
        // selected = base: brand bg + white text. No rounding here — let
        // range_start / range_end / single-selection handle rounding.
        selected:     "bg-brand text-white hover:bg-brand hover:text-white",

        // Single-day selections get rounded via [&:not(.rdp-range_start):not(.rdp-range_end)]:rounded-md
        // but in v10 class names we use separate class keys:
        // When range_start === range_end (single click), only range_start is set.
        range_start:  "rounded-l-md! rounded-r-none!",
        range_end:    "rounded-r-md! rounded-l-none!",
        // range_middle: light brand tint, no rounding, no text change
        range_middle: "bg-brand/10! text-ink rounded-none!",

        today:    "bg-surface-muted text-ink font-semibold rounded-md",
        outside:  "text-ink-muted opacity-40",
        disabled: "text-ink-muted opacity-40 pointer-events-none",
        hidden:   "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeft  className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
