import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BaseCrudModalProps {
  /** Title of the Modal (e.g. "Create New User") */
  title: string;
  /** Subtitle/Description (e.g. "Enter the details below to create a new user.") */
  description?: string;
  /** Whether the modal is open */
  open: boolean;
  /** Callback for when the modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal width preset */
  size?: "sm" | "md" | "lg" | "xl" | "sm-md";
  /** Content of the form */
  children: React.ReactNode;
  /** Text for the primary action button */
  primaryActionText?: string;
  /** Text for the secondary action button */
  secondaryActionText?: string;
  /** Callback for when the primary action button is clicked */
  onPrimaryAction?: () => void;
  /** Callback for when the secondary action button is clicked */
  onSecondaryAction?: () => void;
  /** Is the primary action currently loading? */
  isLoading?: boolean;
  /** Is the primary action disabled? */
  isDisabled?: boolean;
  /** Danger variant for the primary action (e.g., delete) */
  isDanger?: boolean;
  /** Hide the default footer (if you want to render your own inside children) */
  hideFooter?: boolean;
  /** Hide the default header */
  hideHeader?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-[400px]",
  "sm-md": "sm:max-w-[480px]",
  md: "sm:max-w-[600px]",
  lg: "sm:max-w-[800px]",
  xl: "sm:max-w-[1000px]",
};

export function BaseCrudModal({
  title,
  description,
  open,
  onOpenChange,
  size = "md",
  children,
  primaryActionText = "Save",
  secondaryActionText = "Cancel",
  onPrimaryAction,
  onSecondaryAction,
  isLoading = false,
  isDisabled = false,
  isDanger = false,
  hideFooter = false,
  hideHeader = false,
}: BaseCrudModalProps) {
  const handleSecondary = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden bg-white shadow-2xl border-surface-muted border-t sm:rounded-sm",
          sizeClasses[size],
        )}
      >
        {!hideHeader && (
          <DialogHeader className="px-6 py-5 border-b border-surface-muted bg-white">
            <DialogTitle className="text-xl font-semibold tracking-tight text-ink">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-ink-muted mt-1.5">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[calc(90vh-160px)]">
          {children}
        </div>

        {/* Sticky Footer */}
        {!hideFooter && (
          <DialogFooter className="px-6 py-4 border-t border-surface-muted bg-white sm:justify-end gap-3 flex-row items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleSecondary}
              disabled={isLoading}
              className="flex-1 sm:flex-none border-surface-muted hover:bg-surface-muted transition-colors rounded-sm font-medium px-5"
            >
              {secondaryActionText}
            </Button>
            <Button
              type="button"
              variant={isDanger ? "destructive" : "default"}
              onClick={onPrimaryAction}
              disabled={isLoading || isDisabled}
              className={cn(
                "flex-1 sm:flex-none rounded-sm font-medium px-6 shadow-sm transition-all",
                !isDanger &&
                  "bg-brand hover:bg-brand-dark text-white",
              )}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {primaryActionText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
