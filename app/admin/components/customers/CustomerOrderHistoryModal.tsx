import React from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Loader2, History } from "lucide-react";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useCustomerOrders } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import type { Order } from "@/admin/types/order";
import { orderStatusMeta } from "../../types/order-meta";
import { cn } from "@/lib/utils";

const getTierInfo = (tierKey: string) => {
  if (tierKey === "diamond")
    return {
      label: "Diamond",
      color: "bg-ink text-white border-ink shadow-sm",
      icon: "💎",
    };
  if (tierKey === "gold")
    return {
      label: "Gold",
      color: "bg-gold/10 text-gold border-gold/20 font-bold",
      icon: "🥇",
    };
  if (tierKey === "silver")
    return {
      label: "Silver",
      color: "bg-surface-muted text-ink border-border font-medium",
      icon: "🥈",
    };
  return {
    label: "Member",
    color: "bg-surface text-ink-muted border-border font-medium",
    icon: "🥉",
  };
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface CustomerOrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerOrderHistoryModal({
  open,
  onClose,
  customer,
}: CustomerOrderHistoryModalProps) {
  const { data: customerOrdersData, isLoading: loadingOrders } =
    useCustomerOrders(customer?.id || "");

  const customerOrders = customerOrdersData?.orders || [];
  const tier = customer ? getTierInfo(customer.tier) : null;

  if (!customer) return null;

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Order History"
      size="lg"
      hideFooter={true}
    >
      <div className="flex flex-col gap-4 mt-2">
        {/* Product Info Summary Card (Inventory Style Compliance) */}
        <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-full bg-surface-soft text-ink flex items-center justify-center border border-border font-bold text-sm tracking-wider">
              {getInitials(customer.name)}
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-semibold text-sm text-ink truncate max-w-[400px]" title={customer.name}>
                {customer.name}
              </h4>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Contact: <span className="font-mono text-ink font-medium">{customer.phone || customer.email || "—"}</span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 text-xs space-y-1.5 pr-2">
            <div>
              <span className="text-ink-muted font-medium">Tier:</span>{" "}
              {tier && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] font-bold text-[10px] uppercase tracking-wide border ml-1",
                  tier.color
                )}>
                  <span className="mr-0.5">{tier.icon}</span> {tier.label}
                </span>
              )}
            </div>
            <div>
              <span className="text-ink-muted font-medium">Points:</span>{" "}
              <span className="font-semibold text-ink ml-1">{customer.points.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-ink-muted border-b border-border pb-2">
            Order List
          </h4>

            <div className="border border-border rounded-sm bg-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                    <TableHead className="py-2.5 px-4 w-[25%] text-center">Order ID</TableHead>
                    <TableHead className="py-2.5 px-4 w-[15%] text-center">Channel</TableHead>
                    <TableHead className="py-2.5 px-4 w-[22%] text-center">Total Amount</TableHead>
                    <TableHead className="py-2.5 px-4 w-[20%] text-center">Status</TableHead>
                    <TableHead className="py-2.5 px-4 w-[18%] text-center">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingOrders ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                        Loading order history...
                      </TableCell>
                    </TableRow>
                  ) : customerOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <EmptyState
                          icon={History}
                          title="No order history"
                          description="This customer hasn't placed any orders yet."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerOrders.map((o: Order) => {
                      const statusMeta = orderStatusMeta[o.orderStatus] ?? orderStatusMeta.pending;
                    const StatusIcon = statusMeta.icon;
                    return (
                      <TableRow key={o.id} className="hover:bg-surface-soft/30 transition-colors border-b border-border last:border-0">
                        <TableCell className="py-3 px-4 text-center">
                          <Link
                            to={`/admin/orders?search=${o.code}`}
                            className="text-ink hover:text-brand hover:underline transition-colors text-xs font-mono"
                          >
                            {o.code}
                          </Link>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <span className={cn(
                              "inline-flex items-center text-xs px-2.5 py-1 rounded-[6px] font-bold border uppercase tracking-wide",
                              o.channel === "pos" 
                                ? "bg-brand/10 text-brand border-brand/20" 
                                : "bg-info/10 text-info border-info/20"
                            )}>
                              {o.channel === "pos" ? "POS" : "Online"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center text-ink tabular-nums">
                          {o.totalAmount.toLocaleString("vi-VN")} ₫
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border rounded-[6px] uppercase tracking-wide",
                              statusMeta.badgeClass
                            )}>
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              {statusMeta.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center text-xs text-ink-muted">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString("en-US")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </div>
        </div>
      </div>
    </BaseCrudModal>
  );
}
