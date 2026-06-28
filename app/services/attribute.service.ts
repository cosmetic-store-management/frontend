import { apiClient } from "@/lib/client";

export interface AttributeOption {
  id: string;
  name: string;
  code: string;
  values: string[];
}

export function getAttributes() {
  return apiClient.get<AttributeOption[]>("/attributes");
}

export function createAttribute(payload: {
  name: string;
  code: string;
  values: string[];
}) {
  return apiClient.post<AttributeOption>("/attributes", payload);
}

export function updateAttribute(
  id: string,
  payload: { name?: string; values?: string[] },
) {
  return apiClient.patch<AttributeOption>(`/attributes/${id}`, payload);
}

export function deleteAttribute(id: string) {
  return apiClient.delete(`/attributes/${id}`);
}
