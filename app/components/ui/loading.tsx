import type { CSSProperties } from "react";

import { cn } from "../../lib/utils";

type LoadingProps = {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const sizeMap: Record<NonNullable<LoadingProps["size"]>, string> = {
  sm: "16px",
  md: "20px",
  lg: "24px",
};

export default function Loading({
  fullScreen = true,
  size = "lg",
  className,
  label = "Dang tai...",
}: LoadingProps) {
  const loaderStyle = {
    "--cell-size": sizeMap[size],
  } as CSSProperties;

  return (
    <div
      className={cn(
        fullScreen
          ? "flex h-screen w-full items-center justify-center"
          : "inline-flex items-center justify-center",
        className
      )}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <div className="loader" style={loaderStyle}>
        <div className="cell d-0"></div>
        <div className="cell d-1"></div>
        <div className="cell d-2"></div>

        <div className="cell d-1"></div>
        <div className="cell d-2"></div>

        <div className="cell d-2"></div>
        <div className="cell d-3"></div>

        <div className="cell d-3"></div>
        <div className="cell d-4"></div>
      </div>
    </div>
  );
}
