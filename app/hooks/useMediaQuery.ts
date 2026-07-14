import { useState, useEffect } from "react";

/**
 * Hook kiểm tra xem kích thước màn hình hiện tại có khớp với một Media Query hay không.
 * Rất hữu ích khi muốn thay đổi logic hiển thị dựa trên thiết bị (Mobile, Tablet, PC).
 *
 * @param query Chuỗi Media Query (Ví dụ: "(max-width: 768px)")
 * @returns boolean: true nếu khớp, false nếu không
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      {
         
      }
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // Sử dụng addEventListener cho các trình duyệt hiện đại
    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}
