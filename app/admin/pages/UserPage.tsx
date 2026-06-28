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
    label: "Chủ cửa hàng",
    className: "bg-surface-soft text-violet-600 font-bold uppercase",
  },
  manager: {
    label: "Quản lý",
    className: "bg-surface-soft text-danger font-bold uppercase",
  },
  staff: {
    label: "Nhân viên",
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
          Quyền truy cập bị hạn chế
        </h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          Chức năng quản lý nhân sự chỉ khả dụng đối với tài khoản Quản lý
          (Manager) hoặc Chủ cửa hàng (Owner).
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
        loading: "Đang tạo tài khoản nhân viên...",
        success: "Đã tạo tài khoản nhân viên thành công!",
        error: (err: any) => err.message || "Lỗi tạo tài khoản",
      },
    );
  };

  const handleToggleStatus = (user: User) => {
    if (user.role === "owner") {
      toast.error("Không thể khóa tài khoản Chủ cửa hàng!");
      return;
    }
    toast.promise(
      updateStatusMutation.mutateAsync({
        id: user.id,
        isActive: !user.isActive,
      }),
      {
        loading: "Đang cập nhật trạng thái...",
        success: `Tài khoản ${user.name} đã được ${!user.isActive ? "MỞ KHÓA" : "KHÓA"} thành công.`,
        error: (err: any) => err.message || "Lỗi cập nhật trạng thái",
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
        loading: "Đang đặt lại mật khẩu...",
        success: `Mật khẩu của ${resetTarget.name} đã được đặt lại thành công.`,
        error: (err: any) => err.message || "Lỗi đặt lại mật khẩu",
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
        loading: "Đang cập nhật quyền...",
        success: "Đã cập nhật phân quyền thành công!",
        error: (err: any) => err.message || "Lỗi cập nhật quyền",
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left w-full pb-12">
      <PageHeader
        title="Quản lý nhân viên"
        description="Quản trị và phân quyền cho nhân viên làm việc tại hệ thống cửa hàng."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="w-4 h-4" /> Thêm nhân viên
          </Button>
        }
        filters={
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full flex-wrap">
            <div className="group relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-brand" />
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 border-border bg-surface text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
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

            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-fit h-10 border-border bg-surface text-sm text-ink-muted rounded-sm px-3">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="owner">Chủ cửa hàng</SelectItem>
                <SelectItem value="manager">Quản lý</SelectItem>
                <SelectItem value="staff">Nhân viên</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-fit h-10 border-border bg-surface text-sm text-ink-muted rounded-sm px-3">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Staff List Table */}
      <div className="premium-card rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-200">
            <TableHeader>
              <TableRow className="bg-surface-muted text-left border-b border-border">
                <TableHead className="w-[35%]">Nhân viên</TableHead>
                <TableHead className="w-[25%]">Liên hệ</TableHead>
                <TableHead className="text-center w-[15%]">
                  Vai trò
                </TableHead>
                <TableHead className="text-center w-[15%]">
                  Trạng thái
                </TableHead>
                <TableHead className="text-center w-32">
                  Thao tác
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
                      <span>Đang tải danh sách nhân viên...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-ink-muted"
                  >
                    Không tìm thấy tài khoản nhân viên nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                staffUsers.map((user: User, i: number) => (
                  <TableRow
                    key={user.id}
                    className={`hover:bg-bg/40 ${user.isActive === false ? "opacity-60 bg-surface-muted/30" : ""}`}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <TableCell className="align-middle">
                      <span className="font-medium text-ink-muted text-base leading-tight">
                        {user.name}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex flex-col">
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
                          Hoạt động
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-sm bg-surface-soft text-danger px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        >
                          Đã khóa
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
                                Sửa thông tin
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
                                Phân quyền nhân sự
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setNotesTarget(user)}
                              >
                                <MoreVertical className="w-4 h-4 mr-2.5" />
                                Ghi chú nội bộ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => setResetTarget(user)}
                              >
                                <KeyRound className="w-4 h-4 mr-2.5" />
                                Đặt lại mật khẩu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className={`cursor-pointer rounded-sm ${user.isActive !== false ? "text-danger focus:text-danger focus:bg-danger/10" : "text-success focus:text-success focus:bg-success/10"}`}
                              >
                                {user.isActive !== false ? (
                                  <>
                                    <Lock className="w-4 h-4 mr-2.5" /> Khóa tài
                                    khoản
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2.5" /> Mở
                                    khóa tài khoản
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
          <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
            <div className="text-sm text-ink-muted font-medium">
              Trang {cursors.length + 1}
              {data?.total ? (
                <>
                  <span className="mx-2 text-border">|</span> Tổng: {data.total} nhân viên
                </>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium"
                onClick={handlePrev}
                disabled={cursors.length === 0}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium"
                onClick={handleNext}
                disabled={!data?.hasNextPage}
              >
                Sau
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
              loading: "Đang cập nhật...",
              success: "Đã cập nhật thông tin nhân viên!",
              error: (err: any) => err.message || "Lỗi cập nhật",
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
              loading: "Đang lưu ghi chú...",
              success: "Đã lưu ghi chú thành công!",
              error: (err: any) => err.message || "Lỗi lưu ghi chú",
            },
          );
        }}
      />
    </div>
  );
}
