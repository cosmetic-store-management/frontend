import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Trash2,
  Mail,
  Phone,
  ShoppingBag,
  Loader2,
  History,
  X,
  MoreVertical,
  Edit2,
  Users,
  UserPlus,
  Repeat,
  ArrowUpDown,
  AlertCircle,
  StickyNote,
  Coins,
  Lock,
  Unlock,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { PageHeader } from "../components/PageHeader";
import {
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  useUpdateCustomer,
  useUpdateInternalNotes,
  useAdjustPoints,
} from "../hooks/useCustomer";
import { fetchOrders } from "../services/order.service";
import type { Order } from "@/admin/types/order";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@/admin/services/user.service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/ui/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  updateCustomerSchema,
  updateNotesSchema,
  adjustPointsSchema,
  type UpdateCustomerFormData,
  type UpdateNotesFormData,
  type AdjustPointsFormData,
} from "../schemas/customer.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getTierInfo = (points: number) => {
  if (points >= 10000)
    return {
      label: "Diamond",
      color: "bg-ink text-white border-ink shadow-sm",
      icon: "💎",
    };
  if (points >= 5000)
    return {
      label: "Gold",
      color: "bg-gold/10 text-gold border-gold/20 font-bold",
      icon: "🥇",
    };
  if (points >= 1000)
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

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  shipping: "Shipping",
  completed: "Completed",
  cancelled: "Cancelled",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "secondary",
  shipping: "default",
  completed: "outline",
  cancelled: "destructive",
};

export function CustomerPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter] = useState<string>("all");
  const [spendingFilter, setSpendingFilter] = useState("all");
  const [lastPurchaseFilter, setLastPurchaseFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("new_customer");

  useEffect(() => {
    setPage(1);
  }, [
    tierFilter,
    statusFilter,
    spendingFilter,
    lastPurchaseFilter,
    sourceFilter,
    sortBy,
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [lockTarget, setLockTarget] = useState<{
    id: string;
    isActive: boolean;
  } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [notesTarget, setNotesTarget] = useState<Customer | null>(null);
  const [pointsTarget, setPointsTarget] = useState<Customer | null>(null);

  const {
    control: customerControl,
    handleSubmit: handleCustomerSubmit,
    reset: resetCustomerForm,
    formState: { errors: customerErrors },
  } = useForm<UpdateCustomerFormData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
    },
  });

  const {
    control: notesControl,
    handleSubmit: handleNotesSubmit,
    reset: resetNotesForm,
    formState: { errors: notesErrors },
  } = useForm<UpdateNotesFormData>({
    resolver: zodResolver(updateNotesSchema),
    defaultValues: { internalNotes: "" },
  });

  const {
    control: pointsControl,
    handleSubmit: handlePointsSubmit,
    reset: resetPointsForm,
    formState: { errors: pointsErrors },
  } = useForm<AdjustPointsFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adjustPointsSchema) as any,
    defaultValues: { pointsChanged: 0, reason: "" },
  });

  const { data, isLoading } = useCustomers({
    page,
    limit,
    search: debouncedSearch,
    tier: tierFilter,
    status: statusFilter,
    spending: spendingFilter,
    lastPurchase: lastPurchaseFilter,
    source: sourceFilter,
    sortBy: sortBy,
  });
  const customers = data?.content ?? [];
  const overview = data?.overview ?? {
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    churningCustomers: 0,
  };
  // Pagination — backend returns { totalPages, page, totalDocs }
  const totalPages = (data as any)?.totalPages ?? 1;
  const metaPage = (data as any)?.page ?? page;
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const updateStatusMutation = useUpdateCustomerStatus();
  const updateNotesMutation = useUpdateInternalNotes();
  const adjustPointsMutation = useAdjustPoints();

  // Fetch orders for the selected customer
  const { data: orderData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["customer-orders", selectedCustomer?.id],
    queryFn: () =>
      fetchOrders({ userId: selectedCustomer?.id || "", limit: 100 } as any),
    enabled: !!selectedCustomer?.id,
  });
  const customerOrders = orderData?.orders ?? [];

  const filteredCustomers = customers;

  // Removing openCreate since adding customers manually is disabled.

  const openEdit = (cust: Customer) => {
    setEditingId(cust.id);
    resetCustomerForm({
      name: cust.name,
      email: cust.email,
      phone: cust.phone || "",
      province: cust.province || "",
      district: cust.district || "",
      ward: cust.ward || "",
      street: cust.street || "",
    });
    setIsFormOpen(true);
  };

  const onSubmitCustomerForm = async (data: UpdateCustomerFormData) => {
    try {
      if (editingId) {
        await updateCustomerMutation.mutateAsync({
          id: editingId,
          data,
        });
        toast.success("Customer information updated successfully!");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error saving customer information!");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCustomerMutation.mutateAsync(deleteTargetId);
      toast.success("Customer deleted!");
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(err.message || "Could not delete customer!");
    }
  };

  const confirmToggleStatus = async () => {
    if (!lockTarget) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: lockTarget.id,
        isActive: !lockTarget.isActive,
      });
      toast.success(
        lockTarget.isActive
          ? "Customer account locked"
          : "Customer account unlocked",
      );
      setLockTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Error updating status");
    }
  };

  const onSubmitNotesForm = async (data: UpdateNotesFormData) => {
    if (!notesTarget) return;
    try {
      await updateNotesMutation.mutateAsync({
        id: notesTarget.id,
        internalNotes: data.internalNotes || "",
      });
      toast.success("Notes updated successfully!");
      setNotesTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Error updating notes!");
    }
  };

  const onSubmitPointsForm = async (data: AdjustPointsFormData) => {
    if (!pointsTarget) return;
    try {
      await adjustPointsMutation.mutateAsync({
        id: pointsTarget.id,
        pointsChanged: Number(data.pointsChanged),
        reason: data.reason,
      });
      toast.success("Points updated successfully!");
      setPointsTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Error updating points!");
    }
  };

  return (
    <section className="space-y-4 animate-page-enter text-left pb-12">
      <PageHeader
        title="Customer Management"
        description="Monitor and care for GlowUp members, manage contact information and purchase history."
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="web">Online</SelectItem>
                  <SelectItem value="pos">Offline (POS)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Spending" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All spending</SelectItem>
                  <SelectItem value="0">No purchase (0₫)</SelectItem>
                  <SelectItem value="under_1m">Under 1M</SelectItem>
                  <SelectItem value="1m_to_5m">1M – 5M</SelectItem>
                  <SelectItem value="over_5m">Over 5M</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={lastPurchaseFilter}
                onValueChange={setLastPurchaseFilter}
              >
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Last purchase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="30_days">Within 30 days</SelectItem>
                  <SelectItem value="90_days">30 – 90 days</SelectItem>
                  <SelectItem value="180_days">3 – 6 months</SelectItem>
                  <SelectItem value="365_days">6 – 12 months</SelectItem>
                  <SelectItem value="over_365_days">Over 1 year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="diamond">💎 Diamond</SelectItem>
                  <SelectItem value="gold">🥇 Gold</SelectItem>
                  <SelectItem value="silver">🥈 Silver</SelectItem>
                  <SelectItem value="member">🥉 Member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_customer">Newest</SelectItem>
                  <SelectItem value="spent_desc">Highest spending</SelectItem>
                  <SelectItem value="last_purchase_desc">Recent purchase</SelectItem>
                  <SelectItem value="last_purchase_asc">Inactive longest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm flex shrink-0 items-center justify-center" style={{ background: "hsl(352, 72%, 52%, 0.1)", color: "hsl(352, 72%, 52%)" }}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Total customers</p>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {overview.totalCustomers || 0}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm flex shrink-0 items-center justify-center" style={{ background: "hsl(142, 60%, 52%, 0.1)", color: "hsl(142, 60%, 42%)" }}>
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">New (30 days)</p>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {overview.newCustomers || 0}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm flex shrink-0 items-center justify-center" style={{ background: "hsl(43, 90%, 50%, 0.1)", color: "hsl(43, 90%, 42%)" }}>
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Returning</p>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {overview.returningCustomers || 0}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-sm shadow-ui-soft card-hover flex items-center gap-5">
          <div className="w-14 h-14 rounded-sm bg-orange-500/10 text-orange-600 flex shrink-0 items-center justify-center">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-ink-muted font-medium mb-1">
              Churning Customers
            </p>
            <div className="text-3xl font-bold text-ink tracking-tight">
              {overview.churningCustomers || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-250 table-fixed">
              <TableHeader>
                <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                  <TableHead className="px-5 w-[25%] text-left">Customer</TableHead>
                  <TableHead className="px-5 w-[25%] text-center">Contact</TableHead>
                  <TableHead className="px-5 text-center w-[15%]">
                    Tier
                  </TableHead>
                  <TableHead className="px-5 text-center w-[15%]">
                    Spent
                  </TableHead>
                  <TableHead className="px-5 text-center w-[10%] whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="px-5 text-center w-[10%]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-ink-muted"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-ink-muted"
                    >
                      No matching customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((cust, i) => {
                    const tier = getTierInfo(cust.points);
                    return (
                      <TableRow
                        key={cust.id}
                        className="transition-colors hover:bg-bg/40"
                        style={{ "--i": i } as React.CSSProperties}
                      >
                        <TableCell className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm bg-gradient-to-tr from-brand/20 to-brand/5 border border-brand/10 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-brand font-bold">
                                {cust.name
                                  ? cust.name.charAt(0).toUpperCase()
                                  : "K"}
                              </span>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-semibold text-ink text-base leading-tight">
                                {cust.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`mt-1 text-xs px-2 py-0.5 font-medium ${cust.hasOnlineAccount ? "bg-brand/5 text-brand border-brand/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}
                              >
                                {cust.hasOnlineAccount ? "Online" : "Offline"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-middle text-center">
                          <div className="flex flex-col w-fit mx-auto gap-2 text-sm">
                            <div className="flex items-center gap-2.5 text-ink-muted">
                              <Mail className="w-4 h-4 opacity-70" />
                              <span className="truncate max-w-45 font-medium">
                                {cust.email || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-ink-muted">
                              <Phone className="w-4 h-4 opacity-70" />
                              <span className="font-medium">
                                {cust.phone || "—"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-middle text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`font-semibold border text-xs px-2.5 py-0.5 uppercase ${tier.color}`}
                            >
                              <span className="mr-1">{tier.icon}</span>{" "}
                              {tier.label}
                            </Badge>
                            <span className="text-xs font-mono text-ink-muted font-medium">
                              {cust.points.toLocaleString()} points
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-middle text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`text-base font-bold ${!cust.totalSpent ? "text-ink-muted/50" : "text-ink"}`}
                            >
                              {(cust.totalSpent || 0).toLocaleString("vi-VN")}₫
                            </span>
                            <span
                              className={`text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-sm w-fit ${!cust.orderCount ? "bg-surface-muted text-ink-muted/50" : "bg-brand/5 text-brand"}`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />{" "}
                              {cust.orderCount || 0} orders
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-middle text-center">
                          <div className="flex justify-center whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2.5 py-0.5 font-medium whitespace-nowrap shrink-0 min-w-max ${cust.isActive ? "text-success border-success/30 bg-success/10" : "text-danger border-danger/30 bg-danger/10"}`}
                            >
                              {cust.isActive ? "Active" : "Locked"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-middle text-center">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => openEdit(cust)}
                                >
                                  <Edit2 className="w-4 h-4 mr-2.5" />
                                  Edit Info
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => setSelectedCustomer(cust)}
                                >
                                  <History className="w-4 h-4 mr-2.5" />
                                  Order History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => {
                                    setNotesTarget(cust);
                                    resetNotesForm({
                                      internalNotes: cust.internalNotes || "",
                                    });
                                  }}
                                >
                                  <StickyNote className="w-4 h-4 mr-2.5" />
                                  Internal Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => {
                                    setPointsTarget(cust);
                                    resetPointsForm({
                                      pointsChanged: 0,
                                      reason: "",
                                    });
                                  }}
                                >
                                  <Coins className="w-4 h-4 mr-2.5" />
                                  Adjust Points
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() =>
                                    setLockTarget({
                                      id: cust.id,
                                      isActive: cust.isActive,
                                    })
                                  }
                                >
                                  {cust.isActive !== false ? (
                                    <>
                                      <Lock className="w-4 h-4 mr-2.5" /> Lock Account
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-4 h-4 mr-2.5" /> Unlock Account
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTargetId(cust.id)}
                                  className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-2.5" />
                                  Delete Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 bg-surface border-t border-border">
              <div className="text-sm text-ink-muted font-medium">
                Page {metaPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => !o && setIsFormOpen(false)}
      >
        <DialogContent className="sm:max-w-150">
          <DialogHeader className="pr-6">
            <DialogTitle>
              {editingId ? "Update Information" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              Enter the customer's personal and contact information.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCustomerSubmit(onSubmitCustomerForm)}
            className="space-y-6 mt-2"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cName">
                  Customer Name <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={customerControl}
                  name="name"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cName"
                      placeholder="E.g., Jane Doe"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
                {customerErrors.name && (
                  <p className="text-xs text-danger">
                    {customerErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cEmail">
                  Contact Email <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={customerControl}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      id="cEmail"
                      placeholder="E.g., jane@example.com"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
                {customerErrors.email && (
                  <p className="text-xs text-danger">
                    {customerErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cPhone">
                  Phone Number <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={customerControl}
                  name="phone"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cPhone"
                      placeholder="E.g., 0901234567"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
                {customerErrors.phone && (
                  <p className="text-xs text-danger">
                    {customerErrors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cProvince">Province/City</Label>
                  <Controller
                    control={customerControl}
                    name="province"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cProvince"
                        placeholder="E.g., Hanoi"
                        className="focus-visible:ring-brand"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cDistrict">District</Label>
                  <Controller
                    control={customerControl}
                    name="district"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cDistrict"
                        placeholder="E.g., Cau Giay"
                        className="focus-visible:ring-brand"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cWard">Ward</Label>
                  <Controller
                    control={customerControl}
                    name="ward"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cWard"
                        placeholder="E.g., Dich Vong"
                        className="focus-visible:ring-brand"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cStreet">Street Address</Label>
                  <Controller
                    control={customerControl}
                    name="street"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cStreet"
                        placeholder="E.g., 123 Xuan Thuy"
                        className="focus-visible:ring-brand"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending ? (
                  <>
                    Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={(o) => !o && setSelectedCustomer(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="pr-6">
            <DialogTitle>
              Order History:{" "}
              <span className="text-brand">{selectedCustomer?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Phone:{" "}
              <span className="font-medium text-ink">
                {selectedCustomer?.phone}
              </span>{" "}
              | Email:{" "}
              <span className="font-medium text-ink">
                {selectedCustomer?.email || "N/A"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {isOrdersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                <span className="text-sm text-ink-muted">
                  Loading order history...
                </span>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <History className="w-12 h-12 text-ink-muted/30" />
                <p className="text-center text-sm text-ink-muted">
                  No order history.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-sm bg-surface overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-bg/50 border-b border-border">
                      <TableHead className="px-4 w-[25%]">Order ID</TableHead>
                      <TableHead className="px-4 w-[15%]">Channel</TableHead>
                      <TableHead className="px-4 text-center w-[20%]">
                        Total Amount
                      </TableHead>
                      <TableHead className="px-4 text-center w-[20%]">
                        Status
                      </TableHead>
                      <TableHead className="px-4 w-[20%]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((o: Order) => (
                      <TableRow key={o.id} className="hover:bg-bg/40">
                        <TableCell className="py-3 px-4 font-mono text-ink font-semibold">
                          {o.code}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {o.channel === "pos" ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-brand/10 text-brand px-2 py-0 hover:bg-brand/20"
                            >
                              POS
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-warning border-warning/50 px-2 py-0 bg-warning/5"
                            >
                              Online
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center font-bold text-brand">
                          {o.totalAmount.toLocaleString("vi-VN")}₫
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              STATUS_VARIANTS[o.orderStatus] ?? "outline"
                            }
                            className="text-[10px] px-2 py-0"
                          >
                            {STATUS_LABELS[o.orderStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-ink-muted text-xs">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedCustomer(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={!!deleteTargetId}
        loading={deleteCustomerMutation.isPending}
        title="Confirm Delete"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
      {/* Lock/Unlock Confirmation Modal */}
      <Dialog
        open={!!lockTarget}
        onOpenChange={(o) => !o && setLockTarget(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader className="pr-6">
            <DialogTitle>
              Confirm {lockTarget?.isActive ? "Lock" : "Unlock"} Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {lockTarget?.isActive ? "lock" : "unlock"}{" "}
              this account?
            </DialogDescription>
          </DialogHeader>

          {lockTarget?.isActive && (
            <div className="bg-danger/10 text-danger text-sm border border-danger/20 p-3 rounded-sm">
              Customer will not be able to login or purchase after being locked.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLockTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={lockTarget?.isActive ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Notes Modal */}
      <Dialog
        open={!!notesTarget}
        onOpenChange={(o) => !o && setNotesTarget(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader className="pr-6">
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Notes about customer preferences, shopping habits, or issues.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleNotesSubmit(onSubmitNotesForm)}
            className="space-y-4"
          >
            <Label htmlFor="internalNotes" className="sr-only">
              Note Content
            </Label>
            <Controller
              control={notesControl}
              name="internalNotes"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="internalNotes"
                  placeholder="E.g. Prefers red lipstick, complained about shipping..."
                  rows={5}
                  className="resize-none focus-visible:ring-brand"
                />
              )}
            />
            {notesErrors.internalNotes && (
              <p className="text-xs text-danger">
                {notesErrors.internalNotes.message}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNotesTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateNotesMutation.isPending}>
                {updateNotesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Point Adjustment Modal */}
      <Dialog
        open={!!pointsTarget}
        onOpenChange={(o) => !o && setPointsTarget(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader className="pr-6">
            <DialogTitle>Adjust Points</DialogTitle>
            <DialogDescription>
              Add or deduct points for{" "}
              <strong className="text-brand">{pointsTarget?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handlePointsSubmit(onSubmitPointsForm as any)}
            className="space-y-4"
          >
            <div className="bg-brand/5 text-brand text-sm border border-brand/20 p-3 rounded-sm flex justify-between items-center">
              <span>Current Points:</span>
              <span className="font-bold text-lg">{pointsTarget?.points}</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="pointsChanged">
                  Points (+/-) <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={pointsControl}
                  name="pointsChanged"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="pointsChanged"
                      type="number"
                      placeholder="E.g. -500"
                      className="focus-visible:ring-brand"
                    />
                  )}
                />
                {pointsErrors.pointsChanged && (
                  <p className="text-xs text-danger">
                    {pointsErrors.pointsChanged.message}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="pointsReason">
                  Reason <span className="text-danger">*</span>
                </Label>
                <Controller
                  control={pointsControl}
                  name="reason"
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="pointsReason"
                      placeholder="E.g. Returned order #12345"
                      className="resize-none focus-visible:ring-brand"
                    />
                  )}
                />
                {pointsErrors.reason && (
                  <p className="text-xs text-danger">
                    {pointsErrors.reason.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPointsTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjustPointsMutation.isPending}>
                {adjustPointsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
