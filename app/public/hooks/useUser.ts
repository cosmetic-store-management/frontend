import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getMyProfile, updateMyProfile, updateMyAvatar, addMyAddress, updateMyAddress, deleteMyAddress, getMyTierInfo, type UpdateProfilePayload, type AddressPayload,
  getFavorites, toggleFavorite, getRecentlyViewed, recordRecentlyViewed, clearRecentlyViewed, removeRecentlyViewed
} from "../services/user.service";
import { usePublicAuthStore } from "@/store";
import { QK } from "@/lib/queryKeys";
import { toast } from "@/lib/toast";

export function useMyProfile() {
  return useQuery({
    queryKey: QK.myProfile(),
    queryFn: () => getMyProfile(),
    staleTime: 2 * 60 * 1000, // 2 phút
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuth      = usePublicAuthStore((s) => s.setAuth);
  const token        = usePublicAuthStore((s) => s.token);
  const refreshToken = usePublicAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMyProfile(payload),
    onSuccess: (data) => {
      // Cập nhật user trong store, giữ nguyên tokens
      if (token && refreshToken && data.user) {
        setAuth(data.user, token, refreshToken);
      }
      queryClient.invalidateQueries({ queryKey: QK.myProfile() });
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  const setAuth      = usePublicAuthStore((s) => s.setAuth);
  const token        = usePublicAuthStore((s) => s.token);
  const refreshToken = usePublicAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (payload: AddressPayload) => addMyAddress(payload),
    onSuccess: (data) => {
      if (token && refreshToken && data.user) setAuth(data.user, token, refreshToken);
      queryClient.invalidateQueries({ queryKey: QK.myProfile() });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const setAuth      = usePublicAuthStore((s) => s.setAuth);
  const token        = usePublicAuthStore((s) => s.token);
  const refreshToken = usePublicAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddressPayload }) => updateMyAddress(id, payload),
    onSuccess: (data) => {
      if (token && refreshToken && data.user) setAuth(data.user, token, refreshToken);
      queryClient.invalidateQueries({ queryKey: QK.myProfile() });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const setAuth      = usePublicAuthStore((s) => s.setAuth);
  const token        = usePublicAuthStore((s) => s.token);
  const refreshToken = usePublicAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (id: string) => deleteMyAddress(id),
    onSuccess: (data) => {
      if (token && refreshToken && data.user) setAuth(data.user, token, refreshToken);
      queryClient.invalidateQueries({ queryKey: QK.myProfile() });
    },
  });
}

export function useUpdateAvatar() {
  const setAuth      = usePublicAuthStore((s) => s.setAuth);
  const token        = usePublicAuthStore((s) => s.token);
  const refreshToken = usePublicAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (avatarDataUrl: string) => updateMyAvatar(avatarDataUrl),
    onSuccess: (data) => {
      if (token && refreshToken && data.user) setAuth(data.user, token, refreshToken);
    },
  });
}

export function useMyTierInfo() {
  return useQuery({
    queryKey: QK.tier(),
    queryFn: () => getMyTierInfo(),
    staleTime: 5 * 60 * 1000,
    select: (data) => data,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: QK.favorites(),
    queryFn: () => getFavorites().then(res => res.products),
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => toggleFavorite(productId),

    // Flip ngay trước khi API trả về
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: QK.favorites() });
      const previous = queryClient.getQueryData<any[]>(QK.favorites());

      queryClient.setQueryData<any[]>(QK.favorites(), (old = []) => {
        const isIn = old.some((p: any) => p.id === productId);
        if (isIn) {
          return old.filter((p: any) => p.id !== productId);
        }
        // Thêm placeholder — sẽ được ghi đè sau invalidate
        return [...old, { id: productId }];
      });

      return { previous };
    },

    onSuccess: (res) => {
      toast.success(res.action === "added" ? "Đã thêm vào yêu thích ❤️" : "Đã xóa khỏi yêu thích");
    },

    onError: (_err, _id, context: any) => {
      // Rollback về trạng thái cũ
      if (context?.previous !== undefined) {
        queryClient.setQueryData(QK.favorites(), context.previous);
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
    },

    // Luôn sync lại với server sau khi xong
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QK.favorites() });
    },
  });
}

// ── Recently Viewed ──────────────────────────────────────────────────────────

export function useRecentlyViewed(page = 1, limit = 12, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.recentlyViewed(page),
    queryFn: () => getRecentlyViewed(page, limit),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useRecordViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => recordRecentlyViewed(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.recentlyViewed(1) });
    }
  });
}

export function useClearViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearRecentlyViewed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentlyViewed"] });
      toast.success("Đã xóa toàn bộ lịch sử xem");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
    }
  });
}

export function useRemoveViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeRecentlyViewed(productId),
    onMutate: async (productId: string) => {
      // Optimistic update — xóa ngay trên cache
      await queryClient.cancelQueries({ queryKey: ["recentlyViewed"] });
      const previous = queryClient.getQueriesData({ queryKey: ["recentlyViewed"] });
      queryClient.setQueriesData({ queryKey: ["recentlyViewed"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products?.filter((p: any) => p.id !== productId),
          total: Math.max(0, (old.total ?? 0) - 1),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      // Rollback nếu lỗi
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentlyViewed"] });
      toast.success("Đã xóa sản phẩm khỏi lịch sử");
    }
  });
}
