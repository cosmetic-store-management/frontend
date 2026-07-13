import React from "react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/admin/services/user.service";
import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Coins,
  ShieldAlert,
  ShieldCheck,
  StickyNote,
} from "lucide-react";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

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

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
}: CustomerDetailModalProps) {
  if (!customer) return null;

  const tier = getTierInfo(customer.tier);

  return (
    <BaseCrudModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Customer Details"
      size="md"
      hideFooter
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* Header / Basic Info */}
        <div className="flex items-start justify-between bg-surface-soft p-4 rounded-sm border border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-muted border border-border flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-xl font-bold text-ink">
                {customer.name ? customer.name.charAt(0).toUpperCase() : "K"}
              </span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-ink">{customer.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`font-semibold text-[10px] px-2 py-0.5 uppercase ${tier.color}`}
                >
                  <span className="mr-1">{tier.icon}</span> {tier.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0.5 font-medium ${
                    customer.isActive
                      ? "text-success border-success/30 bg-success/10"
                      : "text-danger border-danger/30 bg-danger/10"
                  }`}
                >
                  {customer.isActive ? (
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Locked
                    </div>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-1 font-semibold ${
                customer.hasOnlineAccount
                  ? "bg-brand/10 text-brand border-brand/20"
                  : "bg-orange-500/10 text-orange-600 border-orange-500/20"
              }`}
            >
              {customer.hasOnlineAccount ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Contact Info */}
          <div className="flex flex-col gap-3 p-4 border border-border rounded-sm bg-surface">
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Contact Information
            </h4>
            <div className="flex items-center gap-2.5 text-sm">
              <Mail className="w-4 h-4 text-ink-muted shrink-0" />
              <span className="text-ink font-medium break-all">
                {customer.email || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="w-4 h-4 text-ink-muted shrink-0" />
              <span className="text-ink font-medium">
                {customer.phone || "—"}
              </span>
            </div>
          </div>

          {/* Shopping Stats */}
          <div className="flex flex-col gap-3 p-4 border border-border rounded-sm bg-surface">
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Shopping Statistics
            </h4>
            <div className="flex items-center gap-2.5 text-sm">
              <ShoppingBag className="w-4 h-4 text-ink-muted shrink-0" />
              <span className="text-ink font-medium">
                {customer.orderCount || 0} completed orders
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-ink-muted font-semibold w-4 text-center">
                ₫
              </span>
              <span className="text-ink font-medium">
                {(customer.totalSpent || 0).toLocaleString("vi-VN")} spent
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Coins className="w-4 h-4 text-ink-muted shrink-0" />
              <span className="text-ink font-medium">
                {customer.points.toLocaleString()} points
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-3 p-4 border border-border rounded-sm bg-surface col-span-2">
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Shipping Address
            </h4>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
              <span className="text-ink font-medium leading-relaxed">
                {customer.province ||
                customer.district ||
                customer.ward ||
                customer.street
                  ? [
                      customer.street,
                      customer.ward,
                      customer.district,
                      customer.province,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "No address recorded."}
              </span>
            </div>
          </div>

          {/* Internal Notes */}
          {customer.internalNotes && (
            <div className="flex flex-col gap-3 p-4 border border-brand/30 bg-brand/5 rounded-sm col-span-2">
              <h4 className="text-xs font-semibold text-brand uppercase tracking-wider flex items-center gap-2">
                <StickyNote className="w-4 h-4" /> Internal Notes
              </h4>
              <p className="text-sm text-ink font-medium whitespace-pre-wrap">
                {customer.internalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Custom Footer */}
        <div className="flex justify-end pt-2 border-t border-surface-muted mt-2">
          <Button type="button" onClick={onClose} variant="outline" className="rounded-sm font-medium px-6">
            Close
          </Button>
        </div>
      </div>
    </BaseCrudModal>
  );
}
