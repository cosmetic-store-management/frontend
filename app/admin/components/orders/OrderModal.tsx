import { useEffect, useMemo, useState } from "react";
import {
  User,
  Package,
  Calendar,
  CreditCard,
  Truck,
  Info,
  Hash,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, OrderStatus } from "@/admin/types/order";
import { allowedStatusTransitions, orderStatusMeta, paymentMethodLabel } from "../../types/order-meta";
import { toast } from "@/lib/toast";

export type OrderFormValues = {
  orderStatus: OrderStatus;
  receiverName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  note?: string;
};

type OrderModalProps = {
  open: boolean;
  loading?: boolean;
  submitError?: string | null;
  order: Order | null;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
};

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-US").format(value) + " VND";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function OrderModal({
  open,
  loading = false,
  submitError = null,
  order,
  onClose,
  onSubmit,
}: OrderModalProps) {
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<OrderStatus>("pending");

  useEffect(() => {
    if (order && open) {
      setReceiverName(order.receiverName || "");
      setPhone(order.phone || "");
      setProvince(order.province || "");
      setDistrict(order.district || "");
      setWard(order.ward || "");
      setStreet(order.street || "");
      setNote(order.note || "");
      setNextStatus(order.orderStatus);
    }
  }, [order, open]);

  const isReadOnly = useMemo(() => {
    if (!order) return true;
    return order.orderStatus === "completed" || order.orderStatus === "cancelled";
  }, [order]);

  const selectableStatuses = useMemo(() => {
    if (!order) return [];
    const base = allowedStatusTransitions[order.orderStatus] ?? [];
    const list = [order.orderStatus, ...base];
    return Array.from(new Set(list));
  }, [order]);

  const hasChanges = useMemo(() => {
    if (!order) return false;
    return (
      receiverName !== order.receiverName ||
      phone !== order.phone ||
      province !== order.province ||
      district !== order.district ||
      ward !== order.ward ||
      street !== order.street ||
      note !== order.note ||
      nextStatus !== order.orderStatus
    );
  }, [order, receiverName, phone, province, district, ward, street, note, nextStatus]);

  const handleSubmit = async () => {
    if (!order || isReadOnly) return;

    if (!receiverName.trim()) {
      toast.error("Recipient name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!province.trim()) {
      toast.error("Province/City is required");
      return;
    }
    if (!district.trim()) {
      toast.error("District is required");
      return;
    }
    if (!ward.trim()) {
      toast.error("Ward is required");
      return;
    }
    if (!street.trim()) {
      toast.error("Street address is required");
      return;
    }

    const values: OrderFormValues = {
      orderStatus: nextStatus,
      receiverName,
      phone,
      province,
      district,
      ward,
      street,
      note,
    };

    await onSubmit(values);
  };

  if (!order) return null;

  const currentMeta = orderStatusMeta[order.orderStatus];

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={isReadOnly ? "Order Details" : "Edit Order"}
      size="lg"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit}
      onSecondaryAction={onClose}
      isLoading={loading}
      isDisabled={!hasChanges || isReadOnly}
    >
      <div className="space-y-6 pt-2 pb-4 text-ink" id="order-modal-content">
        {/* Top Order Quick Info Summary Card with Order Code integrated */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <div className="bg-surface p-4 border border-border rounded-sm space-y-1.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
              <Hash className="w-3.5 h-3.5 text-ink-muted/60" /> Order Code
            </p>
            <p className="font-bold text-ink text-xs font-mono truncate">
              #{order.code}
            </p>
          </div>
          <div className="bg-surface p-4 border border-border rounded-sm space-y-1.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
              <Calendar className="w-3.5 h-3.5 text-ink-muted/60" /> Order Date
            </p>
            <p className="font-semibold text-ink text-xs truncate">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="bg-surface p-4 border border-border rounded-sm space-y-1.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
              <CreditCard className="w-3.5 h-3.5 text-ink-muted/60" /> Payment
            </p>
            <p className="font-semibold text-ink text-xs truncate">
              {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
            </p>
          </div>
          <div className="bg-surface p-4 border border-border rounded-sm space-y-1.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted/80">
              <Package className="w-3.5 h-3.5 text-ink-muted/60" /> Total Amount
            </p>
            <p className="font-bold text-ink text-xs truncate">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Section 1: Fulfillment & Status */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4" /> Fulfillment & Status
          </h4>

          {isReadOnly ? (
            <div className={`border rounded-sm p-4 flex items-start gap-2.5 ${
              order.orderStatus === "completed"
                ? "bg-success/5 border-success/20 text-success"
                : "bg-danger/5 border-danger/20 text-danger"
            }`}>
              {order.orderStatus === "completed" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <p className="text-xs leading-relaxed font-medium">
                {order.orderStatus === "completed"
                  ? "This order has been completed. No further modifications can be made."
                  : "This order has been cancelled. No further modifications can be made."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-ink-muted">Current Status</Label>
                <div className="bg-surface border border-border rounded-sm px-3 h-9 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Active</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold border rounded-[4px] ${currentMeta.badgeClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentMeta.dotClass}`}
                    />
                    {currentMeta.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nextStatus" className="text-xs font-semibold text-ink">Update Status</Label>
                <Select
                  onValueChange={(val) => setNextStatus(val as OrderStatus)}
                  value={nextStatus}
                >
                  <SelectTrigger id="nextStatus" className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {selectableStatuses.map((status) => {
                      const meta = orderStatusMeta[status];
                      return (
                        <SelectItem key={status} value={status} className="text-xs">
                          {meta?.label || status}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Recipient Details */}
        <div className="border-t border-border pt-5 space-y-4">
          <h4 className="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Recipient Details
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="receiverName" className="text-xs font-semibold text-ink">
                  Recipient Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="receiverName"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. John Doe"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-ink">
                  Phone Number <span className="text-danger">*</span>
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. 0912345678"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="province" className="text-xs font-semibold text-ink">
                  Province / City <span className="text-danger">*</span>
                </Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Province"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs font-semibold text-ink">
                  District <span className="text-danger">*</span>
                </Label>
                <Input
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="District"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ward" className="text-xs font-semibold text-ink">
                  Ward <span className="text-danger">*</span>
                </Label>
                <Input
                  id="ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Ward"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs font-semibold text-ink">
                  Street Address <span className="text-danger">*</span>
                </Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Street"
                  className="h-9 text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-semibold text-ink">Shipping Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Deliver during office hours"
                className="min-h-[80px] resize-none text-xs font-medium text-ink bg-surface border-input focus:ring-brand"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger rounded-sm font-medium">
            {submitError}
          </div>
        )}
      </div>
    </BaseCrudModal>
  );
}
