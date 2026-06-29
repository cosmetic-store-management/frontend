import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers,
  createStaff,
  updateRole,
  updateStatus,
  resetPassword,
  updateStaffInfo,
  updateStaffNotes,
  deleteStaffAPI,
} from "@/admin/services/user.service";

const KEYS = {
  list: (params: any) => ["admin", "users", params] as const,
};

export function useUsers(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  } = {},
) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getAdminUsers(params),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resetPassword(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      role,
      permissions,
    }: {
      id: string;
      role: "manager" | "staff";
      permissions?: string[];
    }) => updateRole(id, role, permissions),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateStaffInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; phone?: string; email?: string };
    }) => updateStaffInfo(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateStaffNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      internalNotes,
    }: {
      id: string;
      internalNotes: string;
    }) => updateStaffNotes(id, internalNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaffAPI(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
