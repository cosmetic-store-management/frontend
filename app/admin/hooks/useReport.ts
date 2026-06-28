import { useQuery } from "@tanstack/react-query";
import {
  getDashboardData,
  getCompletionRates,
  getVoucherStats,
  getRevenueChart,
  getCategoryPerformance,
  getPaymentMethodsStats,
} from "@/admin/services/report.service";

export function useDashboardData(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["dashboard-data", startDate, endDate],
    queryFn: () => getDashboardData(startDate, endDate),
    refetchInterval: 30000, // refresh stats every 30 seconds
  });
}

export function useCompletionRates(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["completion-rates", startDate, endDate],
    queryFn: () => getCompletionRates(startDate, endDate),
    refetchInterval: 60000, // refresh every minute
  });
}

export function useVoucherStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["voucher-stats", startDate, endDate],
    queryFn: () => getVoucherStats(startDate, endDate),
    refetchInterval: 60000,
  });
}

export function useRevenueChart(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["revenue-chart", startDate, endDate],
    queryFn: () => getRevenueChart(startDate, endDate),
    refetchInterval: 60000,
  });
}

export function useCategoryPerformance(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["category-performance", startDate, endDate],
    queryFn: () => getCategoryPerformance(startDate, endDate),
    refetchInterval: 60000,
  });
}

export function usePaymentMethodsStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["payment-methods", startDate, endDate],
    queryFn: () => getPaymentMethodsStats(startDate, endDate),
    refetchInterval: 60000,
  });
}
