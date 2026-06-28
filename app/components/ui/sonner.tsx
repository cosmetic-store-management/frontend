import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster — mount một lần duy nhất trong root.tsx.
 * Styled theo Warm Luxury brand (đỏ rượu + ngà).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      richColors
      closeButton
      duration={3500}
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group border border-border bg-surface text-ink  rounded-sm text-sm font-medium",
          description: "text-ink-muted text-xs",
          success: "!text-success !border-success",
          error: "!text-danger !border-border",
          warning: "!text-warning !border-warning",
          actionButton: "bg-brand text-white rounded-sm text-xs px-3 py-1",
          cancelButton:
            "bg-surface-muted text-ink-muted rounded-sm text-xs px-3 py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
