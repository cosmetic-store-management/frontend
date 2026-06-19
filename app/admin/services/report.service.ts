import { apiClient } from "@/lib/client";

export interface DashboardStats {
  stats: {
    totalRevenue: number;
    revenueChange?: number;
    ordersCount: number;
    ordersChange?: number;
    soldProducts: number;
    newCustomers: number;
    customersChange?: number;
    profit: number;
    averageOrderValue: number;
  };
  recentOrders: {
    id: string;
    customer: string;
    items: string;
    total: string;
    status: string;
    date: string;
  }[];
  topProducts: {
    name: string;
    category: string;
    sold: number;
    stock: number;
    percentage: number;
  }[];
  lowStockItems: {
    productName: string;
    variantName: string;
    sku: string;
    stock: number;
    minStock: number;
  }[];
}

export function getDashboardData(startDate?: string, endDate?: string): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<DashboardStats>(`/reports/dashboard${qs}`);
}

export interface CompletionRates {
  total: number;
  completed: number;
  cancelled: number;
  processing: number;
  completedRate: number;
  cancelledRate: number;
}

export function getCompletionRates(startDate?: string, endDate?: string): Promise<CompletionRates> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<CompletionRates>(`/reports/completion-rates${qs}`);
}

export interface VoucherStats {
  code: string;
  usedCount: number;
  usageLimit: number;
  usageRate: number;
  isActive: boolean;
}

export function getVoucherStats(startDate?: string, endDate?: string): Promise<VoucherStats[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<VoucherStats[]>(`/reports/vouchers${qs}`);
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export function getRevenueChart(startDate?: string, endDate?: string): Promise<RevenueChartData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<RevenueChartData[]>(`/reports/revenue-chart${qs}`);
}

export interface CategoryPerformanceData {
  category: string;
  revenue: number;
  sold: number;
}

export function getCategoryPerformance(startDate?: string, endDate?: string): Promise<CategoryPerformanceData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<CategoryPerformanceData[]>(`/reports/category-performance${qs}`);
}

export interface PaymentMethodsData {
  method: string;
  count: number;
  revenue: number;
}

export function getPaymentMethodsStats(startDate?: string, endDate?: string): Promise<PaymentMethodsData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<PaymentMethodsData[]>(`/reports/payment-methods${qs}`);
}
