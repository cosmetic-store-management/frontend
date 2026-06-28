import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  getInitials,
  formatRelativeTime,
  truncateText,
} from "./format";

describe("formatFileSize", () => {
  it("should format bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1500)).toBe("1.46 KB");
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe("1.5 MB");
  });
});

describe("getInitials", () => {
  it("should extract initials correctly", () => {
    expect(getInitials("Nguyễn Văn A")).toBe("NV");
    expect(getInitials("Glow Up")).toBe("GU");
    expect(getInitials("Single")).toBe("S");
  });
});

describe("formatRelativeTime", () => {
  it("should format relative times correctly", () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("Just now");

    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    expect(formatRelativeTime(twoMinutesAgo.toISOString())).toBe("2m ago");

    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe("3h ago");

    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveDaysAgo.toISOString())).toBe("5d ago");
  });
});

describe("truncateText", () => {
  it("should truncate text with ellipsis if length exceeds limit", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
    expect(truncateText("Hello", 10)).toBe("Hello");
    expect(truncateText("Short", 5)).toBe("Short");
  });
});
