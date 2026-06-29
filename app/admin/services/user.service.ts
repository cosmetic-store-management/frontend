import { apiClient } from "@/lib/client";
import type { User } from "@/admin/types/user";

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface StaffResponse {
  users: User[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}): Promise<StaffResponse> {
  return apiClient.get<StaffResponse>("/users", params);
}

export function updateStatus(id: string, isActive: boolean): Promise<User> {
  return apiClient
    .patch<{ user: User }>(`/users/${id}/status`, { isActive })
    .then((res) => res.user);
}

export function resetPassword(id: string): Promise<User> {
  return apiClient
    .patch<{ user: User }>(`/users/${id}/reset-password`)
    .then((res) => res.user);
}

export function updateRole(
  id: string,
  role: "manager" | "staff",
  permissions?: string[],
): Promise<User> {
  return apiClient
    .patch<{ user: User }>(`/users/${id}/role`, { role, permissions })
    .then((res) => res.user);
}

export function updateStaffInfo(
  id: string,
  data: { name?: string; phone?: string; email?: string },
): Promise<User> {
  return apiClient
    .patch<{ user: User }>(`/users/${id}`, data)
    .then((res) => res.user);
}

export function updateStaffNotes(
  id: string,
  internalNotes: string,
): Promise<User> {
  return apiClient
    .patch<{ user: User }>(`/users/${id}/staff-notes`, { internalNotes })
    .then((res) => res.user);
}

export function deleteStaffAPI(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/users/${id}`);
}

// ── Customer ──────────────────────────────────────────────────────────────────

export function updateAccount(data: {
  name?: string;
  phone?: string;
  address?: string;
}): Promise<User> {
  return apiClient
    .patch<{ user: User }>("/users/me", data)
    .then((res) => res.user);
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  orderCount: number;
  totalSpent: number;
  points: number;
  internalNotes?: string;
  isActive: boolean;
  hasOnlineAccount?: boolean;
}

export interface CustomersResponse {
  overview: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    churningCustomers: number;
  };
  content: Customer[];
  totalPages: number;
  totalElements: number;
  page: number;
  limit: number;
}

export function getCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  status?: string;
  spending?: string;
  lastPurchase?: string;
  sortBy?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CustomersResponse> {
  return apiClient.get<CustomersResponse>("/users/customers", params);
}

export function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
}): Promise<Customer> {
  return apiClient
    .post<{ customer: Customer }>("/users/customers", data)
    .then((data) => data.customer);
}

export function createStaff(data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
  permissions?: string[];
}): Promise<User> {
  return apiClient
    .post<{ staff: User }>("/users/staff", data)
    .then((data) => data.staff);
}

export function deleteUser(id: string): Promise<void> {
  return apiClient.delete(`/users/${id}`);
}

export function updateCustomer(
  id: string,
  data: Partial<Customer>,
): Promise<Customer> {
  return apiClient
    .patch<{ user: Customer }>(`/users/${id}`, data)
    .then((res) => res.user);
}

export function updateInternalNotes(
  id: string,
  internalNotes: string,
): Promise<Customer> {
  return apiClient
    .patch<{ user: Customer }>(`/users/${id}/internal-notes`, { internalNotes })
    .then((res) => res.user);
}

export function adjustPoints(
  id: string,
  pointsChanged: number,
  reason: string,
): Promise<Customer> {
  return apiClient
    .patch<{ user: Customer }>(`/users/${id}/points`, { pointsChanged, reason })
    .then((res) => res.user);
}
