import { create } from "zustand";

interface UIState {
  // Trạng thái hiển thị Sidebar (rất hữu ích cho Mobile hoặc khi có nút Collapse)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Trạng thái Theme (Nền tảng nếu sau này muốn mở rộng Dark Mode)
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  // Trạng thái Loading Toàn cục (Ví dụ: Chuyển trang, Gọi API rất nặng)
  isGlobalLoading: boolean;
  setGlobalLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false, // Thường ẩn trên mobile
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  theme: "light",
  setTheme: (theme) => set({ theme }),

  isGlobalLoading: false,
  setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),
}));
