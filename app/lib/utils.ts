import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, xử lý conflict tự động */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Xuất mảng object ra file CSV */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  filename: string,
) {
  if (!data || data.length === 0) return;

  // Thêm BOM để Excel đọc đúng tiếng Việt (UTF-8)
  const BOM = "\uFEFF";

  const headerRow = headers.map((h) => `"${h.label}"`).join(",");

  const rows = data.map((item) => {
    return headers
      .map((header) => {
        let cellData = item[header.key];
        // Xử lý chuỗi có chứa dấu phẩy hoặc ngoặc kép
        if (typeof cellData === "string") {
          cellData = cellData.replace(/"/g, '""'); // Escape double quotes
          return `"${cellData}"`;
        }
        return `"${cellData !== null && cellData !== undefined ? cellData : ""}"`;
      })
      .join(",");
  });

  const csvContent = BOM + [headerRow, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(value?: number) {
  if (value === undefined || value === null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN");
}
