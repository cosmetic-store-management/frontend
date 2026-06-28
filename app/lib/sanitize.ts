import DOMPurify from "dompurify";

/**
 * Sanitize HTML từ rich text editor (react-quill, tiptap, v.v.)
 * Dùng DOMPurify — library tiêu chuẩn ngành, chống XSS đáng tin cậy hơn regex.
 *
 * Chạy chỉ trên client-side (browser). SSR fallback: strip toàn bộ tag.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // SSR guard: DOMPurify cần window/document
  if (typeof window === "undefined") {
    // Fallback đơn giản cho SSR — strip toàn bộ HTML tag
    return html.replace(/<[^>]*>/g, "");
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "hr",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "class",
      "colspan",
      "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    // Force external links safe
    FORCE_BODY: false,
    ADD_ATTR: ["target"],
  });
}
