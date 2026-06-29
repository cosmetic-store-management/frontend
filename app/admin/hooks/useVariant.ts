import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "@/admin/services/attribute.service";

export function useVariants() {
  return useQuery({
    queryKey: ["variants"],
    queryFn: getAttributes,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAttribute>[1];
    }) => updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
  });
}
