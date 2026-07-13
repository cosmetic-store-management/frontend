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
  Truck,
  AlertTriangle,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "../components/common/PageHeader";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import DeleteModal from "@/components/ui/delete-modal";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "@/lib/toast";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "../hooks/useInventory";
import { supplierSchema, type SupplierFormData } from "../schemas/supplier.schema";
import type { Supplier } from "../services/inventory.service";
import { SupplierDetailModal } from "../components/suppliers/SupplierDetailModal";

const EMPTY_FORM: SupplierFormData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  taxCode: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  contactPosition: "",
  isActive: true,
  notes: "",
};

export function SupplierPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: suppliers = [], isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  useEffect(() => {
    setPage(1);
  }, [search]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: EMPTY_FORM,
  });

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.taxCode?.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const totalPages = Math.ceil(filteredSuppliers.length / PAGE_SIZE);

  const paginatedSuppliers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSuppliers.slice(start, start + PAGE_SIZE);
  }, [filteredSuppliers, page]);

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    reset({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      taxCode: supplier.taxCode || "",
      contactPerson: supplier.contactPerson || "",
      contactPhone: supplier.contactPhone || "",
      contactEmail: supplier.contactEmail || "",
      contactPosition: supplier.contactPosition || "",
      isActive: supplier.isActive ?? true,
      notes: supplier.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleToggleStatus = (supplier: Supplier) => {
    const nextStatus = !supplier.isActive;
    toast.promise(
      updateMutation.mutateAsync({
        id: supplier.id,
        data: { isActive: nextStatus },
      }),
      {
        loading: "Updating status...",
        success: nextStatus
          ? `Supplier ${supplier.name} is now active.`
          : `Supplier ${supplier.name} is now inactive.`,
        error: (err: any) => err.message || "Failed to update status",
      }
    );
  };

  const onSubmitForm = async (formData: SupplierFormData) => {
    try {
      if (editing) {
        await toast.promise(
          updateMutation.mutateAsync({ id: editing.id, data: formData }),
          {
            loading: "Saving...",
            success: "Supplier updated successfully!",
            error: (err: any) => err.message || "Update error",
          }
        );
      } else {
        await toast.promise(
          createMutation.mutateAsync(formData),
          {
            loading: "Creating...",
            success: "Supplier created successfully!",
            error: (err: any) => err.message || "Creation error",
          }
        );
      }
      setIsFormOpen(false);
    } catch (e) {
      // handled by toast.promise
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await toast.promise(
        deleteMutation.mutateAsync(deleteTarget.id),
        {
          loading: "Deleting supplier...",
          success: "Supplier deleted successfully!",
          error: (err: any) => err.message || "Failed to delete supplier",
        }
      );
      setDeleteTarget(null);
    } catch (e) {
      // handled by toast.promise
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers Management"
        description="Manage warehouse product distributors and manufacturers"
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-dark transition-all shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" /> Add Supplier
          </Button>
        }
        filters={
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, tax code..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>
          </div>
        }
      />

      <div className="premium-card rounded-sm overflow-hidden">
        <Table className="table-fixed min-w-[1100px] w-full text-center">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead className="w-16 text-center">No.</TableHead>
                <TableHead className="w-60 text-center">Supplier Name</TableHead>
                <TableHead className="w-28 text-center">Tax Code</TableHead>
                <TableHead className="w-36 text-center">Contact Person</TableHead>
                <TableHead className="w-60 text-center">Contact Details</TableHead>
                <TableHead className="w-60 text-center">Address</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-ink-muted">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-ink-muted">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSuppliers.map((sup, idx) => (
                  <TableRow key={sup.id} className="hover:bg-surface-soft/40 transition-colors">
                    <TableCell className="text-center text-xs font-mono text-ink-muted">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell
                      className="text-center text-sm font-semibold text-ink truncate cursor-pointer hover:text-brand hover:underline"
                      onClick={() => setSelectedSupplier(sup)}
                    >
                      {sup.name}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono text-ink-muted">{sup.taxCode || "—"}</TableCell>
                    <TableCell className="text-center py-3">
                      {sup.contactPerson ? (
                        <div className="min-w-0 text-center">
                          <span className="block font-semibold text-ink text-sm truncate">
                            {sup.contactPerson}
                          </span>
                          {sup.contactPosition && (
                            <span className="block text-[11px] text-ink-muted/70 font-medium mt-0.5 truncate">
                              {sup.contactPosition}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <div className="space-y-2 text-xs flex flex-col items-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-ink text-sm text-center">{sup.phone}</span>
                          {sup.email && <span className="text-ink-muted/70 truncate max-w-[200px] text-center" title={sup.email}>{sup.email}</span>}
                        </div>
                        
                        {(sup.contactPhone || sup.contactEmail) && (
                          <div className="flex flex-col items-center pt-1 border-t border-border/20 w-full">
                            {sup.contactPhone && <span className="font-mono text-ink text-sm text-center">{sup.contactPhone}</span>}
                            {sup.contactEmail && <span className="text-ink-muted/70 truncate max-w-[200px] mt-0.5 text-center" title={sup.contactEmail}>{sup.contactEmail}</span>}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-ink-muted truncate max-w-[240px]" title={sup.address || ""}>{sup.address || "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={sup.isActive ?? true}
                          onCheckedChange={() => handleToggleStatus(sup)}
                          className="data-[state=checked]:bg-brand"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
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
                            className="w-40 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                          >
                            <DropdownMenuItem
                              className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                              onClick={() => setSelectedSupplier(sup)}
                            >
                              <Eye className="w-4 h-4 mr-2.5" />
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                              onClick={() => openEdit(sup)}
                            >
                              <Edit className="w-4 h-4 mr-2.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer rounded-sm text-danger focus:text-danger focus:bg-danger/10 data-[highlighted]:text-danger data-[highlighted]:bg-danger/10"
                              onClick={() => setDeleteTarget(sup)}
                            >
                              <Trash2 className="w-4 h-4 mr-2.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center p-5 bg-surface border-t border-border">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
      </div>

      {/* Form Dialog */}
      <BaseCrudModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={editing ? "Edit Supplier" : "Add Supplier"}
        size="md"
        primaryActionText="Confirm"
        onPrimaryAction={handleSubmit(onSubmitForm)}
        onSecondaryAction={() => setIsFormOpen(false)}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 text-left">
          {/* Section: Company Information */}
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sName" className="text-sm font-semibold text-ink">Supplier Name <span className="text-brand">*</span></Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} id="sName" placeholder="Công ty TNHH L'Oreal Việt Nam" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
                {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sPhone" className="text-sm font-semibold text-ink">Company Hotline <span className="text-brand">*</span></Label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <Input {...field} id="sPhone" placeholder="02839369000" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
                {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sEmail" className="text-sm font-semibold text-ink">Company Email</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input {...field} id="sEmail" type="email" placeholder="contact@loreal.vn" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sTaxCode" className="text-sm font-semibold text-ink">Tax Code</Label>
                <Controller
                  control={control}
                  name="taxCode"
                  render={({ field }) => (
                    <Input {...field} id="sTaxCode" placeholder="0305364871" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sAddress" className="text-sm font-semibold text-ink">Warehouse Address</Label>
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <Input {...field} id="sAddress" placeholder="Tầng 10, Tòa nhà Vincom, 72 Lê Thánh Tôn, Quận 1, TP. HCM" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                )}
              />
            </div>
          </div>

          {/* Section: Representative Contact */}
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sContactPerson" className="text-sm font-semibold text-ink">Name</Label>
                <Controller
                  control={control}
                  name="contactPerson"
                  render={({ field }) => (
                    <Input {...field} id="sContactPerson" placeholder="Bà Nguyễn Thị Ngọc Anh" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sContactPosition" className="text-sm font-semibold text-ink">Job position</Label>
                <Controller
                  control={control}
                  name="contactPosition"
                  render={({ field }) => (
                    <Input {...field} id="sContactPosition" placeholder="Trưởng phòng thương hiệu" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sContactPhone" className="text-sm font-semibold text-ink">Phone</Label>
                <Controller
                  control={control}
                  name="contactPhone"
                  render={({ field }) => (
                    <Input {...field} id="sContactPhone" placeholder="09xxxxxxxx" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sContactEmail" className="text-sm font-semibold text-ink">Email</Label>
                <Controller
                  control={control}
                  name="contactEmail"
                  render={({ field }) => (
                    <Input {...field} id="sContactEmail" type="email" placeholder="ngocanh.nguyen@loreal.com" className="h-10 bg-surface border-border focus-visible:ring-brand focus-visible:border-brand" />
                  )}
                />
                {errors.contactEmail && <p className="text-xs text-danger">{errors.contactEmail.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Additional Information */}
          <div className="space-y-4">
            
            <div className="space-y-1.5">
              <Label htmlFor="sNotes" className="text-sm font-semibold text-ink">Notes</Label>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Textarea {...field} id="sNotes" rows={3} placeholder="Additional notes about payment terms, shipping, etc." className="bg-surface border-border focus-visible:ring-brand focus-visible:border-brand resize-none" />
                )}
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-sm border border-border p-4 bg-surface-soft/30">
              <div className="space-y-0.5 text-left">
                <span className="text-sm font-semibold text-ink">Activate Supplier</span>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This supplier is currently active and accepting stock receipts.
                </p>
              </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-brand"
                />
              )}
            />
          </div>
        </div>

        <button type="submit" className="hidden" />
      </form>
      </BaseCrudModal>

      {/* Delete Confirmation Dialog */}
      <DeleteModal
        open={!!deleteTarget}
        title="Delete Supplier"
        description={
          <span>
            Are you sure you want to delete supplier{" "}
            <strong className="text-ink">"{deleteTarget?.name}"</strong>?
            This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        loading={deleteMutation.isPending}
        submitError={deleteMutation.error?.message || null}
        onClose={() => {
          setDeleteTarget(null);
          deleteMutation.reset();
        }}
        onConfirm={confirmDelete}
      />

      <SupplierDetailModal
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        supplier={selectedSupplier}
      />
    </div>
  );
}
