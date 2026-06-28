import { describe, it, expect, vi } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("should allow safe HTML tags and attributes", () => {
    const input =
      "<h1>Title</h1><p>This is a <strong>strong</strong> paragraph with a <a href='https://example.com' target='_blank'>link</a>.</p>";
    const output = sanitizeHtml(input);
    expect(output).toContain("<h1>Title</h1>");
    expect(output).toContain("<p>This is a ");
    expect(output).toContain("<strong>strong</strong>");
    expect(output).toContain(
      '<a href="https://example.com" target="_blank">link</a>',
    );
  });

  it("should strip unsafe tags and attributes", () => {
    const input =
      "<script>alert('hack')</script><iframe src='unsafe'></iframe><p onclick='steal()'>Safe text</p>";
    const output = sanitizeHtml(input);
    expect(output).not.toContain("<script>");
    expect(output).not.toContain("<iframe>");
    expect(output).not.toContain("onclick");
    expect(output).toContain("<p>Safe text</p>");
  });

  it("should handle SSR fallback if window is undefined", () => {
    // Save original window
    const originalWindow = globalThis.window;

    // Temporarily delete window
    // @ts-expect-error - overriding global window for testing
    delete globalThis.window;

    const input = "<p>Text with <b>tags</b></p>";
    const output = sanitizeHtml(input);

    // Server-side fallback strips all HTML tags using regex
    expect(output).toBe("Text with tags");

    // Restore window
    globalThis.window = originalWindow;
  });
});
