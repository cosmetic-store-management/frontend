import { useEffect, type RefObject } from "react";

/**
 * Hook bắt sự kiện click ra ngoài một Element (VD: Click ra ngoài Menu để đóng Menu)
 *
 * @param ref Tham chiếu (Ref) đến thẻ HTML chứa UI
 * @param handler Hàm sẽ chạy khi user click ra ngoài
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Bỏ qua nếu click vào trong chính Element đó
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
