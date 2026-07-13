import React from "react";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  StickyNote,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Supplier } from "../../services/inventory.service";

interface SupplierDetailModalProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export function SupplierDetailModal({
  open,
  onClose,
  supplier,
}: SupplierDetailModalProps) {
  if (!supplier) return null;

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Supplier Detail"
      size="lg"
      hideFooter={true}
    >
      <div className="space-y-6 text-left mt-2">
        {/* Main Info Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-soft/50 border border-surface-muted rounded-sm p-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-sm bg-brand/10 text-brand flex items-center justify-center shrink-0 shadow-sm border border-brand/5">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink leading-snug">
                {supplier.name}
              </h3>
              {supplier.taxCode && (
                <p className="text-xs text-ink-muted mt-1 font-mono">
                  Tax Code: <span className="font-semibold">{supplier.taxCode}</span>
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1 w-fit ${
                supplier.isActive !== false
                  ? "text-success border-success/30 bg-success/10"
                  : "text-danger border-danger/30 bg-danger/10"
              }`}
            >
              {supplier.isActive !== false ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Inactive
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Company Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted border-b border-surface-muted pb-2">
              Company Details
            </h4>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-ink-muted">Hotline</span>
                  <span className="text-sm font-mono font-medium text-ink mt-0.5 block">
                    {supplier.phone || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-ink-muted">Email</span>
                  <span className="text-sm font-medium text-ink mt-0.5 block truncate" title={supplier.email}>
                    {supplier.email || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-ink-muted">Warehouse Address</span>
                  <span className="text-sm font-medium text-ink mt-0.5 block leading-relaxed">
                    {supplier.address || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Representative Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted border-b border-surface-muted pb-2">
              Representative Contact
            </h4>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-ink-muted">Full Name</span>
                  <span className="text-sm font-semibold text-ink mt-0.5 block">
                    {supplier.contactPerson || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-ink-muted">Job Position</span>
                  <span className="text-sm font-medium text-ink mt-0.5 block">
                    {supplier.contactPosition || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-ink-muted">Personal Phone</span>
                  <span className="text-sm font-mono font-medium text-ink mt-0.5 block">
                    {supplier.contactPhone || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-ink-muted/80 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-ink-muted">Personal Email</span>
                  <span className="text-sm font-medium text-ink mt-0.5 block truncate" title={supplier.contactEmail}>
                    {supplier.contactEmail || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {supplier.notes && (
          <div className="space-y-2 border-t border-surface-muted pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </h4>
            <p className="text-sm text-ink-muted leading-relaxed bg-surface-muted/50 rounded-sm p-3.5 border border-surface-muted/20">
              {supplier.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-muted mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-surface-muted hover:bg-surface-muted transition-colors rounded-sm font-medium px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </BaseCrudModal>
  );
}
