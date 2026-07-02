import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteState {
  itemIds: string[];
  toggleFavorite: (productId: string) => void;
  setFavorites: (productIds: string[]) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set) => ({
      itemIds: [],
      toggleFavorite: (productId) =>
        set((state) => {
          if (state.itemIds.includes(productId)) {
            return {
              itemIds: state.itemIds.filter((id) => id !== productId),
            };
          } else {
            return {
              itemIds: [...state.itemIds, productId],
            };
          }
        }),
      setFavorites: (productIds) => set({ itemIds: productIds }),
      clearFavorites: () => set({ itemIds: [] }),
    }),
    {
      name: "glowup-favorites-storage",
    },
  ),
);
