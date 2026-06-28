import { useState, useEffect } from "react";
import {
  useUsers,
  useCreateStaff,
  useUpdateRole,
  useUpdateStatus,
  useResetPassword,
  useUpdateStaffInfo,
  useUpdateStaffNotes,
} from "../hooks/useUser";
import type { CreateStaffFormData } from "../schemas/user.schema";
import type { User } from "@/admin/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import {
  UserPlus,
  Search,
  ShieldAlert,
  Loader2,
  Lock,
  Unlock,
  KeyRound,
  MoreVertical,
  Settings2,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "@/auth/hooks/useAdminAuth";
import { StaffFormModal } from "../components/users/StaffFormModal";
import { StaffPermissionsModal } from "../components/users/StaffPermissionsModal";
import { StaffResetPasswordModal } from "../components/users/StaffResetPasswordModal";
import { StaffInfoModal } from "../components/users/StaffInfoModal";
import { StaffNotesModal } from "../components/users/StaffNotesModal";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  owner: {
    label: "Store Owner",
    className: "bg-surface-soft text-violet-600 font-bold uppercase",
  },
  manager: {
    label: "Manager",
    className: "bg-surface-soft text-danger font-bold uppercase",
  },
  staff: {
    label: "Staff",
    className: "bg-surface-soft text-ink-muted font-bold uppercase",
  },
};

export function UserPage() {
  const { isManager, isOwner } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const limit = 20;

  const currentCursor = cursors[cursors.length - 1] || undefined;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCursors([]);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCursors([]);
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    setCursors([]);
  };

  const { data, isLoading, error } = useUsers({
    cursor: currentCursor,
    limit,
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  const handleNext = () => {
    if (data?.nextCursor) {
      setCursors((prev) => [...prev, data.nextCursor!]);
    }
  };

  const handlePrev = () => {
    setCursors((prev) => prev.slice(0, -1));
  };

  const createStaffMutation = useCreateStaff();
  const updateRoleMutation = useUpdateRole();
  const updateStatusMutation = useUpdateStatus();
  const resetPasswordMutation = useResetPassword();
  const updateStaffInfoMutation = useUpdateStaffInfo();
  const updateStaffNotesMutation = useUpdateStaffNotes();

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Dialog Targets
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [infoTarget, setInfoTarget] = useState<User | null>(null);
  const [notesTarget, setNotesTarget] = useState<User | null>(null);

  const [editRole, setEditRole] = useState<"manager" | "staff">("staff");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  if (!isManager && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center p-8 bg-surface border border-border rounded-sm shadow-ui-soft animate-page-enter">
        <div className="p-3 bg-brand-light text-brand rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-ink">
          Access Restricted
        </h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          Staff management is only available for Manager or Store Owner accounts.
        </p>
      </div>
    );
  }

  const staffUsers = data?.users ?? [];

  if (error) toast.error(error.message);

  const openCreate = () => {
    setIsFormOpen(true);
  };

  const onSubmitForm = (formData: CreateStaffFormData) => {
    toast.promise(
      createStaffMutation
        .mutateAsync(formData)
        .then(() => setIsFormOpen(false)),
      {
        loading: "Creating staff account...",
        success: "Staff account created successfully!",
        error: (err: any) => err.message || "Creation error",
      },
    );
  };

  const handleToggleStatus = (user: User) => {
    if (user.role === "owner") {
      toast.error("Cannot lock Store Owner account!");
      return;
    }
    toast.promise(
      updateStatusMutation.mutateAsync({
        id: user.id,
        isActive: !user.isActive,
      }),
      {
        loading: "Updating status...",
        success: `Account ${user.name} has been successfully ${!user.isActive ? "UNLOCKED" : "LOCKED"}.`,
        error: (err: any) => err.message || "Status update error",
      },
    );
  };

  const confirmResetPassword = () => {
    if (!resetTarget) return;
    toast.promise(
      resetPasswordMutation
        .mutateAsync(resetTarget.id)
        .then(() => setResetTarget(null)),
      {
        loading: "Resetting password...",
        success: `Password for ${resetTarget.name} has been successfully reset.`,
        error: (err: any) => err.message || "Password reset error",
      },
    );
  };

  const handleSavePermissions = () => {
    if (!editTarget) return;
    toast.promise(
      updateRoleMutation
        .mutateAsync({
          id: editTarget.id,
          role: editRole,
          permissions: editPermissions,
        })
        .then(() => setEditTarget(null)),
      {
        loading: "Updating permissions...",
        success: "Permissions updated successfully!",
        error: (err: any) => err.message || "Permission update error",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left w-full pb-12">
      <PageHeader
        title="Staff Management"
        description="Manage and assign permissions for store employees."
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <UserPlus className="size-4 mr-2" /> Add Staff
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-brand" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Store Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-fit h-10 border-border bg-surface text-sm text-ink-muted rounded-sm px-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      {/* Staff List Table */}
      <div className="premium-card rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-200 table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted border-b border-border">
                <TableHead className="w-[25%] text-left pl-4">Staff</TableHead>
                <TableHead className="w-[25%] text-center">Contact</TableHead>
                <TableHead className="text-center w-[20%]">
                  Role
                </TableHead>
                <TableHead className="text-center w-[20%]">
                  Status
                </TableHead>
                <TableHead className="text-center w-[10%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-ink-muted"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span>Loading staff list...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-ink-muted"
                  >
                    No matching staff accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                staffUsers.map((user: User, i: number) => (
                  <TableRow
                    key={user.id}
                    className={`hover:bg-bg/40 ${user.isActive === false ? "opacity-60 bg-surface-muted/30" : ""}`}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <TableCell className="align-middle pl-4">
                      <span className="font-medium text-ink-muted text-base leading-tight">
                        {user.name}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      <div className="flex flex-col w-fit mx-auto text-left">
                        <span className="text-sm font-medium text-ink-muted">
                          {user.email}
                        </span>
                        <span className="text-xs font-mono text-ink-muted/80 mt-1">
                          {user.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      <div
                        className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-[10px] ${ROLE_BADGE[user.role]?.className || "bg-surface-soft text-ink-muted font-bold uppercase"}`}
                      >
                        {ROLE_BADGE[user.role]?.label ?? user.role}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      {user.isActive !== false ? (
                        <span
                          className="inline-flex items-center rounded-sm bg-surface-soft text-success px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-sm bg-surface-soft text-danger px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        >
                          Locked
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="align-middle text-center">
                      <div className="flex items-center justify-center">
                        {(isOwner || (isManager && user.role === "staff")) && (
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
                              className="w-48 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setInfoTarget(user)}
                              >
                                <Settings2 className="w-4 h-4 mr-2.5" />
                                Edit Info
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => {
                                  setEditTarget(user);
                                  setEditRole(user.role as "manager" | "staff");
                                  setEditPermissions(user.permissions || []);
                                }}
                              >
                                <ShieldAlert className="w-4 h-4 mr-2.5" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setNotesTarget(user)}
                              >
                                <MoreVertical className="w-4 h-4 mr-2.5" />
                                Internal Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setResetTarget(user)}
                              >
                                <KeyRound className="w-4 h-4 mr-2.5" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className={`cursor-pointer rounded-sm ${user.isActive !== false ? "text-danger focus:text-danger focus:bg-danger/10" : "text-success focus:text-success focus:bg-success/10"}`}
                              >
                                {user.isActive !== false ? (
                                  <>
                                    <Lock className="w-4 h-4 mr-2.5" /> Lock Account
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2.5" /> Unlock Account
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination UI */}
        {(cursors.length > 0 || data?.hasNextPage) && (
          <div className="flex items-center justify-between px-5 py-4 bg-surface border-t border-border">
            <div className="text-sm text-ink-muted font-medium">
              Page {cursors.length + 1}
              {data?.total ? (
                <>
                  <span className="mx-2 text-border">|</span> Total: {data.total} staff
                </>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                onClick={handlePrev}
                disabled={cursors.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                onClick={handleNext}
                disabled={!data?.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <StaffFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={onSubmitForm}
        isLoading={createStaffMutation.isPending}
      />

      <StaffPermissionsModal
        user={editTarget}
        editRole={editRole}
        editPermissions={editPermissions}
        isOwner={isOwner}
        isLoading={updateRoleMutation.isPending}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onRoleChange={setEditRole}
        onPermissionsChange={setEditPermissions}
        onSave={handleSavePermissions}
      />

      <StaffResetPasswordModal
        user={resetTarget}
        isLoading={resetPasswordMutation.isPending}
        onOpenChange={(open) => !open && setResetTarget(null)}
        onConfirm={confirmResetPassword}
      />

      <StaffInfoModal
        user={infoTarget}
        isLoading={updateStaffInfoMutation.isPending}
        onOpenChange={(open) => !open && setInfoTarget(null)}
        onSubmit={(data) => {
          if (!infoTarget) return;
          toast.promise(
            updateStaffInfoMutation
              .mutateAsync({ id: infoTarget.id, data })
              .then(() => setInfoTarget(null)),
            {
              loading: "Updating...",
              success: "Staff info updated successfully!",
              error: (err: any) => err.message || "Failed to update",
            },
          );
        }}
      />

      <StaffNotesModal
        user={notesTarget}
        isLoading={updateStaffNotesMutation.isPending}
        onOpenChange={(open) => !open && setNotesTarget(null)}
        onSubmit={(data) => {
          if (!notesTarget) return;
          toast.promise(
            updateStaffNotesMutation
              .mutateAsync({
                id: notesTarget.id,
                internalNotes: data.internalNotes || "",
              })
              .then(() => setNotesTarget(null)),
            {
              loading: "Saving notes...",
              success: "Notes saved successfully!",
              error: (err: any) => err.message || "Failed to save notes",
            },
          );
        }}
      />
    </div>
  );
}
