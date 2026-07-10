import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Store,
  Package,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { PageHeader } from "../components/common/PageHeader";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useToggleBrandStatus,
  useDeleteBrand,
} from "../hooks/useBrand";
import { useSuppliers, useCreateSupplier } from "../hooks/useInventory";
import type { Brand } from "@/admin/services/brand.service";
import { brandSchema, type BrandFormData } from "../schemas/brand.schema";

const EMPTY_FORM: BrandFormData = {
  name: "",
  description: "",
  imageUrl: "",
  country: "",
  isActive: true,
  website: "",
  contactPhone: "",
  contactEmail: "",
  supplierName: "",
  minimumOrderValue: 0,
  leadTimeDays: 7,
  supplierId: "",
};

export function BrandPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Brand | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [viewingDetails, setViewingDetails] = useState<Brand | null>(null);

  // New Supplier Local States
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupAddress, setNewSupAddress] = useState("");
  const [newSupError, setNewSupError] = useState("");

  const clearNewSupplierForm = () => {
    setNewSupName("");
    setNewSupPhone("");
    setNewSupEmail("");
    setNewSupAddress("");
    setNewSupError("");
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BrandFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(brandSchema) as any,
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, countryFilter]);

  // Paginated list (current filter)
  const { data, isLoading } = useBrands({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    country: (countryFilter && countryFilter !== "all_countries") ? countryFilter : undefined,
    page: page,
    limit: 10,
  });
  const brands = data?.brands ?? [];

  // Stat counts — single separate query for all brands (standard in WooCommerce / Magento)
  const { data: allData } = useBrands({ limit: 1000 });
  const allBrands = allData?.brands ?? [];
  const totalCount = allData?.pagination?.total ?? allBrands.length;
  const activeCount = allBrands.filter((b) => b.isActive).length;
  const inactiveCount = allBrands.filter((b) => !b.isActive).length;

  const countriesList = useMemo(() => {
    const countries = allBrands
      .map((b) => b.country?.trim())
      .filter((c): c is string => !!c);
    return Array.from(new Set(countries)).sort();
  }, [allBrands]);

  const { data: suppliers = [] } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const toggleMutation = useToggleBrandStatus();
  const deleteMutation = useDeleteBrand();

  const openCreate = () => {
    setEditing(null);
    setIsNewSupplier(false);
    clearNewSupplierForm();
    reset(EMPTY_FORM);
    setIsFormOpen(true);
  };
  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setIsNewSupplier(false);
    clearNewSupplierForm();
    reset({
      name: brand.name,
      description: brand.description || "",
      imageUrl: brand.imageUrl || "",
      country: brand.country || "",
      isActive: brand.isActive,
      website: brand.website || "",
      contactPhone: brand.contactPhone || "",
      contactEmail: brand.contactEmail || "",
      supplierName: brand.supplierName || "",
      minimumOrderValue: brand.minimumOrderValue || 0,
      leadTimeDays: brand.leadTimeDays || 7,
      supplierId: brand.supplierId || "",
    });
    setIsFormOpen(true);
  };

  // Toggle: inform admin exactly what changes (WooCommerce pattern)
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const next = !currentStatus;
    toast.promise(toggleMutation.mutateAsync({ id, isActive: next }), {
      loading: "Processing...",
      success: next
        ? "Brand is now visible in public filters."
        : "Brand hidden. Products under this brand will still be displayed.",
      error: "Update failed!",
    });
  };

  const onSubmitForm = async (formData: BrandFormData) => {
    let finalSupplierId = formData.supplierId || null;

    if (isNewSupplier) {
      if (!newSupName.trim() || !newSupPhone.trim()) {
        setNewSupError("Supplier Name and Phone are required");
        return;
      }
      setNewSupError("");

      try {
        const newSup = await createSupplierMutation.mutateAsync({
          name: newSupName.trim(),
          phone: newSupPhone.trim(),
          email: newSupEmail.trim(),
          address: newSupAddress.trim(),
        });
        finalSupplierId = newSup.id;
      } catch (err) {
        toast.error("Failed to create supplier");
        return;
      }
    }

    const payload = {
      ...formData,
      supplierId: finalSupplierId,
    };

    if (editing) {
      toast.promise(
        updateMutation
          .mutateAsync({ id: editing.id, data: payload as any })
          .then(() => {
            setIsFormOpen(false);
            setIsNewSupplier(false);
            clearNewSupplierForm();
          }),
        {
          loading: "Saving...",
          success: "Brand updated successfully!",
          error: (e: any) => e.message || "Update error",
        },
      );
    } else {
      toast.promise(
        createMutation
          .mutateAsync(payload as any)
          .then(() => {
            setIsFormOpen(false);
            setIsNewSupplier(false);
            clearNewSupplierForm();
          }),
        {
          loading: "Creating...",
          success: "Brand created successfully!",
          error: (e: any) => e.message || "Creation error",
        },
      );
    }
  };

  // Delete: backend blocks if products exist — show that count in dialog
  const confirmDelete = () => {
    if (!deleteTarget) return;
    toast.promise(
      deleteMutation
        .mutateAsync(deleteTarget.id)
        .then(() => setDeleteTarget(null)),
      {
        loading: "Deleting...",
        success: "Brand deleted!",
        error: (e: any) => e.message || "Delete error",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Brand Management"
        description="Manage your brand portfolio. Active brands will be featured in customer search filters."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-dark transition-all shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" /> Add Brand
          </Button>
        }
        filters={
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand name..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>

            {/* Country Origin Filter */}
            <div className="w-full sm:w-48 text-left">
              <Select value={countryFilter || "all_countries"} onValueChange={setCountryFilter}>
                <SelectTrigger className="h-10 border-border bg-surface text-sm text-ink-muted focus-visible:ring-brand/20">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_countries">All Countries</SelectItem>
                  {countriesList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:w-40 text-left">
              <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
                <SelectTrigger className="h-10 border-border bg-surface text-sm text-ink-muted focus-visible:ring-brand/20">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      {/* ── Stat Cards (WooCommerce / Magento standard) ─ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: <Store className="w-5 h-5 text-brand" />,
            bg: "bg-brand/10",
            label: "Total Brands",
            val: totalCount,
            cls: "text-ink",
          },
          {
            icon: <CheckCircle2 className="w-5 h-5 text-success" />,
            bg: "bg-success/10",
            label: "Active",
            val: activeCount,
            cls: "text-success",
          },
          {
            icon: <XCircle className="w-5 h-5 text-danger" />,
            bg: "bg-danger/10",
            label: "Inactive",
            val: inactiveCount,
            cls: "text-danger",
          },
        ].map(({ icon, bg, label, val, cls }) => (
          <div
            key={label}
            className="border border-border rounded-sm bg-surface shadow-ui-soft hover:shadow-ui-hover hover:-translate-y-1 transition-all duration-300 p-4 flex items-center gap-4 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
            >
              {icon}
            </div>
            <div>
              <p className="text-xs text-ink-muted font-medium mb-0.5">{label}</p>
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${cls}`}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Brand Table ─────────────────────────────────── */}
      <div className="premium-card rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full rounded-sm" />
            ))}
          </div>
        ) : (
          <Table className="min-w-[900px] table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="py-4 px-5 w-60 text-center">
                  Brand
                </TableHead>
                <TableHead className="py-4 px-3 w-28 text-center">
                  Origin
                </TableHead>
                <TableHead className="py-4 px-5 w-60 text-center">
                  Supplier Info
                </TableHead>
                <TableHead className="py-4 px-5 w-48 text-center">
                  Description
                </TableHead>
                <TableHead className="py-4 px-5 w-24 text-center">
                  Products
                </TableHead>
                <TableHead className="py-4 px-5 w-24 text-center">
                  Visibility
                </TableHead>
                <TableHead className="py-4 text-center w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand, i) => (
                <TableRow
                  key={brand.id}
                  className="animate-stagger group"
                >
                  {/* Logo + Name + Slug + Website */}
                  <TableCell className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewingDetails(brand)}
                        className="w-10 h-10 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden hover:border-brand transition-colors focus:outline-none"
                        title="Click to view details"
                      >
                        <img
                          src={
                            brand.imageUrl ||
                            "https://placehold.co/80x80?text=Logo"
                          }
                          alt={brand.name}
                          className="w-full h-full object-contain p-0.5"
                          loading="lazy"
                        />
                      </button>
                      <div className="min-w-0 text-center flex-1">
                        <button
                          type="button"
                          onClick={() => setViewingDetails(brand)}
                          className="block truncate font-semibold text-ink text-sm hover:text-brand hover:underline transition-colors text-center w-full focus:outline-none"
                          title="Click to view details"
                        >
                          {brand.name}
                        </button>
                        <span className="block truncate text-[11px] font-mono text-ink-muted/70">
                          {brand.slug}
                        </span>
                        {brand.website && (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[11px] text-brand hover:underline truncate"
                          >
                            {brand.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Country (badge) */}
                  <TableCell className="py-3.5 px-3 text-center">
                    {brand.country ? (
                      <span className="inline-flex px-2 py-0.5 rounded-[4px] bg-bg text-xs font-medium text-ink-muted border border-border truncate max-w-full">
                        {brand.country}
                      </span>
                    ) : (
                      <span className="text-ink-muted/40 text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Supplier Info */}
                  <TableCell className="py-3.5 px-5 text-center">
                    <div className="text-xs text-ink-muted leading-tight flex flex-col items-center">
                      <span className="block font-semibold text-ink truncate w-full text-center">
                        {brand.supplier?.name || brand.supplierName || "—"}
                      </span>
                      {brand.supplier?.contactPerson && (
                        <span className="block text-[11px] font-medium text-ink-muted truncate w-full text-center mt-0.5" title={brand.supplier.contactPerson}>
                          {brand.supplier.contactPerson} {brand.supplier.contactPosition && `(${brand.supplier.contactPosition})`}
                        </span>
                      )}
                      {(brand.contactPhone || brand.supplier?.phone) && (
                        <span className="block truncate text-ink-muted text-center w-full mt-0.5">
                          📞 {brand.contactPhone || brand.supplier?.phone}
                        </span>
                      )}
                      {(brand.contactEmail || brand.supplier?.email) && (
                        <span className="block truncate text-[11px] text-ink-muted text-center w-full">
                          ✉️ {brand.contactEmail || brand.supplier?.email}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="py-3.5 px-5 text-ink-muted text-center">
                    <span
                      className="block truncate text-sm"
                      title={brand.description || undefined}
                    >
                      {brand.description || (
                        <span className="italic text-ink-muted/40">
                          No description
                        </span>
                      )}
                    </span>
                  </TableCell>

                  {/* Product count */}
                  <TableCell className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${(brand.productCount ?? 0) > 0
                          ? "text-ink"
                          : "text-ink-muted/40"
                        }`}
                    >
                      <Package className="w-3.5 h-3.5 opacity-60" />
                      {brand.productCount ?? 0}
                    </span>
                  </TableCell>

                  {/* Status toggle */}
                  <TableCell className="py-3.5 px-5 text-center">
                    <Switch
                      checked={brand.isActive}
                      onCheckedChange={() =>
                        handleToggleStatus(brand.id, brand.isActive)
                      }
                      title={
                        brand.isActive
                          ? "Visible — click to hide"
                          : "Hidden — click to show"
                      }
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 text-center">
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
                          className="w-36 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                            onClick={() => setViewingDetails(brand)}
                          >
                            <Store className="w-4 h-4 mr-2.5" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/60 my-1" />
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                            onClick={() => openEdit(brand)}
                          >
                            <Edit className="w-4 h-4 mr-2.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                            onClick={() => setDeleteTarget(brand)}
                          >
                            <Trash2 className="w-4 h-4 mr-2.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Empty state */}
        {!isLoading && brands.length === 0 && (
          <div className="py-16 text-center">
            <Store className="w-10 h-10 text-ink-muted/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-ink-muted">
              {debouncedSearch
                ? `No brands found matching "${debouncedSearch}"`
                : statusFilter === "active"
                  ? "No active brands"
                  : statusFilter === "inactive"
                    ? "No inactive brands"
                    : "No brands available"}
            </p>
            {!debouncedSearch && !statusFilter && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-3 text-xs text-brand hover:underline font-medium"
              >
                + Add your first brand
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center p-5 bg-surface border-t border-border">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ────────────────────────── */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => !o && setIsFormOpen(false)}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink">
              {editing ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            {editing && (
              <p className="text-xs text-ink-muted mt-0.5">
                Slug:{" "}
                <code className="font-mono bg-bg px-1 rounded-sm">
                  {editing.slug}
                </code>
                {" · "}
                <span className="text-ink">{editing.productCount}</span> linked
                products
              </p>
            )}
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: main info */}
                <div className="md:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="bName"
                        className="text-sm font-semibold text-ink"
                      >
                        Brand Name <span className="text-brand">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="bName"
                            placeholder="La Roche-Posay"
                            className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                          />
                        )}
                      />
                      {errors.name && (
                        <p className="text-xs text-danger">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="bCountry"
                        className="text-sm font-semibold text-ink"
                      >
                        Country / Origin
                      </Label>
                      <Controller
                        control={control}
                        name="country"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="bCountry"
                            placeholder="France"
                            className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                          />
                        )}
                      />
                      {errors.country && (
                        <p className="text-xs text-danger">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="bDesc"
                      className="text-sm font-semibold text-ink"
                    >
                      Brand Description
                    </Label>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="bDesc"
                          rows={3}
                          placeholder="Short description for the brand..."
                          className="bg-surface border-border focus-visible:ring-brand focus-visible:border-brand resize-none"
                        />
                      )}
                    />
                    {errors.description && (
                      <p className="text-xs text-danger">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Supplier & Contact Information */}
                  <div className="border-t border-border pt-4 mt-4 space-y-4 text-left">
                    <h3 className="text-sm font-bold text-ink">Supplier & Brand Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Brand Website */}
                      <div className="space-y-1.5">
                        <Label htmlFor="bWebsite" className="text-xs font-semibold text-ink">Brand Website</Label>
                        <Controller
                          control={control}
                          name="website"
                          render={({ field }) => (
                            <Input {...field} id="bWebsite" placeholder="https://example.com" className="h-9 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                          )}
                        />
                        {errors.website && <p className="text-[11px] text-danger">{errors.website.message}</p>}
                      </div>

                      {/* Supplier Selection using Shadcn Select */}
                      <div className="space-y-1.5">
                        <Label htmlFor="bSupplierSelect" className="text-xs font-semibold text-ink">Linked Supplier <span className="text-danger">*</span></Label>
                        <Controller
                          control={control}
                          name="supplierId"
                          render={({ field }) => (
                            <Select
                              value={isNewSupplier ? "new" : (field.value || "none")}
                              onValueChange={(val) => {
                                if (val === "new") {
                                  setIsNewSupplier(true);
                                  field.onChange("");
                                } else {
                                  setIsNewSupplier(false);
                                  field.onChange(val === "none" ? "" : val);
                                }
                              }}
                            >
                              <SelectTrigger id="bSupplierSelect" className="w-full h-9 bg-surface border-border text-sm focus:ring-brand focus:border-brand cursor-pointer">
                                <SelectValue placeholder="-- Select Supplier --" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Select Supplier --</SelectItem>
                                {suppliers
                                  .filter((s: any) => s.isActive !== false || s.id === field.value)
                                  .map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                <SelectItem value="new" className="text-brand font-semibold hover:text-brand focus:text-brand">
                                  + Add New Supplier...
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Inline Add Supplier Form */}
                    {isNewSupplier && (
                      <div className="border border-border bg-bg/50 rounded-sm p-3.5 space-y-3.5 animate-scale-in">
                        <p className="text-xs font-bold text-ink">New Supplier Details</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="sNewName" className="text-[11px] font-semibold text-ink-muted">Supplier Name <span className="text-danger">*</span></Label>
                            <Input
                              id="sNewName"
                              placeholder="Abbott Laboratories"
                              value={newSupName}
                              onChange={(e) => setNewSupName(e.target.value)}
                              className="h-8.5 text-xs bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="sNewPhone" className="text-[11px] font-semibold text-ink-muted">Phone Number <span className="text-danger">*</span></Label>
                            <Input
                              id="sNewPhone"
                              placeholder="09xxxxxxxx"
                              value={newSupPhone}
                              onChange={(e) => setNewSupPhone(e.target.value)}
                              className="h-8.5 text-xs bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="sNewEmail" className="text-[11px] font-semibold text-ink-muted">Contact Email</Label>
                            <Input
                              id="sNewEmail"
                              type="email"
                              placeholder="supplier@domain.com"
                              value={newSupEmail}
                              onChange={(e) => setNewSupEmail(e.target.value)}
                              className="h-8.5 text-xs bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="sNewAddress" className="text-[11px] font-semibold text-ink-muted">Warehouse Address</Label>
                            <Input
                              id="sNewAddress"
                              placeholder="456 Industrial Zone, HCMC"
                              value={newSupAddress}
                              onChange={(e) => setNewSupAddress(e.target.value)}
                              className="h-8.5 text-xs bg-surface border-border focus-visible:ring-brand focus-visible:border-brand"
                            />
                          </div>
                        </div>
                        {newSupError && (
                          <p className="text-xs text-danger font-medium mt-1">{newSupError}</p>
                        )}
                      </div>
                    )}
                  </div>


                </div>

                {/* Right: logo + status */}
                <div className="md:col-span-1 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-ink">
                      Brand Logo
                    </Label>
                    <Controller
                      control={control}
                      name="imageUrl"
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={(url) => field.onChange(url)}
                          className="w-full aspect-square"
                        />
                      )}
                    />
                  </div>

                  <div className="p-4 rounded-sm border border-border bg-bg/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="bActive"
                        className="text-sm font-semibold text-ink"
                      >
                        Publicly Visible
                      </Label>
                      <Controller
                        control={control}
                        name="isActive"
                        render={({ field }) => (
                          <Switch
                            id="bActive"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <p className="text-xs text-ink-muted">
                      Hiding a brand removes it from sidebar filters — products
                      are not hidden.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-10 bg-surface"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 bg-brand text-white hover:bg-brand-dark transition-all shadow-ui-soft px-8"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="animate-scale-in max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ink">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
              Delete Brand
            </DialogTitle>
            <DialogDescription className="text-left text-sm text-ink-muted mt-2 space-y-2">
              <span>
                Are you sure you want to delete the brand{" "}
                <strong className="text-ink">{deleteTarget?.name}</strong>?
              </span>
              {deleteTarget && (deleteTarget.productCount ?? 0) > 0 && (
                <span className="flex items-start gap-1.5 mt-2 p-2.5 rounded-sm bg-danger/5 border border-danger/20 text-danger text-xs font-medium">
                  This brand has{" "}
                  <strong>{deleteTarget.productCount} products</strong>. The
                  system will reject this — you must move or delete the products
                  first.
                </span>
              )}
              {deleteTarget && (deleteTarget.productCount ?? 0) === 0 && (
                <span className="block mt-1 text-xs text-ink-muted/70">
                  Brand has no products. This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                deleteMutation.isPending ||
                (deleteTarget?.productCount ?? 0) > 0
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Details Dialog */}
      <Dialog open={!!viewingDetails} onOpenChange={(open) => !open && setViewingDetails(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink pr-6">
              Brand Details
            </DialogTitle>
          </DialogHeader>

          {viewingDetails && (
            <>
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Left Column: Logo Image */}
                {viewingDetails.imageUrl ? (
                  <div className="md:w-[38%] flex items-center justify-center border-r border-border bg-surface-soft/30 p-6 shrink-0">
                    <div className="w-32 h-32 rounded-md border border-border overflow-hidden bg-white flex items-center justify-center shadow-sm">
                      <img src={viewingDetails.imageUrl} alt={viewingDetails.name} className="max-w-full max-h-full object-contain p-2" />
                    </div>
                  </div>
                ) : (
                  <div className="md:w-[38%] flex items-center justify-center border-r border-border bg-surface-soft/30 p-6 shrink-0 text-ink-muted text-sm">
                    No image available
                  </div>
                )}

                {/* Right Column: Details Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold text-ink mb-1">{viewingDetails.name}</h2>
                  <p className="font-mono text-xs text-ink-muted mb-4">{viewingDetails.slug}</p>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Country</p>
                      <p className="mt-1.5 text-sm font-medium text-ink">{viewingDetails.country || "—"}</p>
                    </div>

                    <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Website</p>
                      <p className="mt-1.5 text-sm font-medium text-ink truncate">
                        {viewingDetails.website ? (
                          <a href={viewingDetails.website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                            {viewingDetails.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>

                    {viewingDetails.supplierId && (
                      <>
                        <div className="col-span-2 border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Supplier</p>
                          <p className="mt-1.5 text-sm font-semibold text-ink">
                            {viewingDetails.supplier?.name || viewingDetails.supplierName || "—"}
                          </p>
                        </div>

                        <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Phone</p>
                          <p className="mt-1.5 text-sm font-medium text-ink font-mono">
                            {viewingDetails.supplier?.phone || "—"}
                          </p>
                        </div>

                        <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Email</p>
                          <p className="mt-1.5 text-sm font-medium text-ink truncate" title={viewingDetails.supplier?.email}>
                            {viewingDetails.supplier?.email || "—"}
                          </p>
                        </div>

                        {viewingDetails.supplier?.contactPerson && (
                          <>
                            <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Name</p>
                              <p className="mt-1.5 text-sm font-medium text-ink">
                                {viewingDetails.supplier.contactPerson}
                                {viewingDetails.supplier.contactPosition && (
                                  <span className="block text-[11px] text-ink-muted/80 font-normal mt-0.5">
                                    {viewingDetails.supplier.contactPosition}
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Contact</p>
                              <div className="mt-1.5 text-sm font-medium text-ink space-y-0.5">
                                <span className="block font-mono">
                                  {viewingDetails.contactPhone || viewingDetails.supplier.contactPhone || "—"}
                                </span>
                                {(viewingDetails.contactEmail || viewingDetails.supplier.contactEmail) && (
                                  <span className="block text-xs text-ink-muted break-all">
                                    {viewingDetails.contactEmail || viewingDetails.supplier.contactEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="col-span-2 border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">Description</p>
                      <div className="text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
                        {viewingDetails.description || "No description provided."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end">
                <Button
                  type="button"
                  onClick={() => setViewingDetails(null)}
                  className="rounded-sm shadow-none px-6 h-10 font-medium"
                  variant="outline"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
