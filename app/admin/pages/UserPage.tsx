import { useState, useEffect } from "react";
import { useUsers, useCreateStaff, useUpdateRole, useUpdateStatus, useResetPassword, useUpdateStaffInfo, useUpdateStaffNotes } from "../hooks/useUser";
import type { CreateStaffFormData } from "../schemas/user.schema";
import type { User } from "@/admin/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { UserPlus, Search, Shield, ShieldAlert, Loader2, Lock, Unlock, KeyRound, MoreHorizontal, Settings2, X } from "lucide-react";
import { useAuth } from "@/auth/hooks/useAdminAuth";
import { StaffFormModal } from "../components/users/StaffFormModal";
import { StaffPermissionsModal } from "../components/users/StaffPermissionsModal";
import { StaffResetPasswordModal } from "../components/users/StaffResetPasswordModal";
import { StaffInfoModal } from "../components/users/StaffInfoModal";
import { StaffNotesModal } from "../components/users/StaffNotesModal";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  owner:    { label: "Chủ cửa hàng", className: "bg-violet-500/10 text-violet-600 border-violet-500/20 font-semibold" },
  manager:  { label: "Quản lý",      className: "bg-brand/10 text-brand border-brand/20 font-medium" },
  staff:    { label: "Nhân viên",    className: "bg-surface-soft text-ink-muted border-border font-medium" },
};

export function UserPage() {
  const { isManager, isOwner } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, roleFilter]);

  const { data, isLoading, error } = useUsers({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-surface border border-border rounded-sm shadow-ui-soft animate-page-enter">
        <div className="p-3 bg-brand-light text-brand rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-ink">Quyền truy cập bị hạn chế</h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          Chức năng quản lý nhân sự chỉ khả dụng đối với tài khoản Quản lý (Manager) hoặc Chủ cửa hàng (Owner).
        </p>
      </div>
    );
  }

  const staffUsers = data?.users ?? [];
  const meta = { totalPages: data?.totalPages || 1, page: data?.page || 1, totalDocs: data?.total || 0 };

  if (error) toast.error(error.message);

  const openCreate = () => {
    setIsFormOpen(true);
  };

  const onSubmitForm = (formData: CreateStaffFormData) => {
    toast.promise(
      createStaffMutation.mutateAsync(formData).then(() => setIsFormOpen(false)),
      {
        loading: "Đang tạo tài khoản nhân viên...",
        success: "Đã tạo tài khoản nhân viên thành công!",
        error: (err: any) => err.message || "Lỗi tạo tài khoản",
      }
    );
  };

  const handleToggleStatus = (user: User) => {
    if (user.role === "owner") {
      toast.error("Không thể khóa tài khoản Chủ cửa hàng!");
      return;
    }
    toast.promise(
      updateStatusMutation.mutateAsync({ id: user.id, isActive: !user.isActive }),
      {
        loading: "Đang cập nhật trạng thái...",
        success: `Tài khoản ${user.name} đã được ${!user.isActive ? "MỞ KHÓA" : "KHÓA"} thành công.`,
        error: (err: any) => err.message || "Lỗi cập nhật trạng thái",
      }
    );
  };

  const confirmResetPassword = () => {
    if (!resetTarget) return;
    toast.promise(
      resetPasswordMutation.mutateAsync(resetTarget.id).then(() => setResetTarget(null)),
      {
        loading: "Đang đặt lại mật khẩu...",
        success: `Mật khẩu của ${resetTarget.name} đã được đặt lại thành công.`,
        error: (err: any) => err.message || "Lỗi đặt lại mật khẩu",
      }
    );
  };

  const handleSavePermissions = () => {
    if (!editTarget) return;
    toast.promise(
      updateRoleMutation.mutateAsync({ id: editTarget.id, role: editRole, permissions: editPermissions }).then(() => setEditTarget(null)),
      {
        loading: "Đang cập nhật quyền...",
        success: "Đã cập nhật phân quyền thành công!",
        error: (err: any) => err.message || "Lỗi cập nhật quyền",
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left w-full pb-12">
      {/* Header */}
      <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1.5 flex-1">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Quản lý nhân viên</h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl leading-6">
              Quản trị và phân quyền cho nhân viên làm việc tại hệ thống cửa hàng.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="w-4 h-4" /> Thêm nhân viên
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="group relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-brand" />
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
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

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-sm">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="owner">Chủ cửa hàng</SelectItem>
              <SelectItem value="manager">Quản lý</SelectItem>
              <SelectItem value="staff">Nhân viên</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="border border-border rounded-sm bg-surface shadow-ui-soft">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-bg/50 border-b border-border">
                <TableHead className="px-5 py-4 w-[35%]">Nhân viên</TableHead>
                <TableHead className="px-5 py-4 w-[25%]">Liên hệ</TableHead>
                <TableHead className="px-5 py-4 text-center w-[15%]">Vai trò</TableHead>
                <TableHead className="px-5 py-4 text-center w-[15%]">Trạng thái</TableHead>
                <TableHead className="px-5 py-4 text-center w-32">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-ink-muted">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span>Đang tải danh sách nhân viên...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : staffUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-ink-muted">
                    Không tìm thấy tài khoản nhân viên nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                staffUsers.map((user: User, i: number) => (
                  <TableRow key={user.id} className={`hover:bg-bg/40 ${user.isActive === false ? "opacity-60 bg-surface-muted/30" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                    <TableCell className="px-5 py-4 align-middle">
                      <span className="font-semibold text-ink text-base leading-tight">{user.name}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4 align-middle">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-ink-muted">{user.email}</span>
                        <span className="text-xs font-mono text-ink-muted/80 mt-1">{user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 align-middle text-center">
                      <div className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs ${ROLE_BADGE[user.role]?.className || "bg-surface text-ink border-border"}`}>
                        {ROLE_BADGE[user.role]?.label ?? user.role}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 align-middle text-center">
                      {user.isActive !== false ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 px-2.5 py-0.5">Hoạt động</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-danger/10 text-danger border-danger/30 px-2.5 py-0.5">Đã khóa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 align-middle text-center">
                      <div className="flex items-center justify-center">
                        {(isOwner || (isManager && user.role === "staff")) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in">
                              <DropdownMenuLabel className="font-semibold text-ink">Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand" onClick={() => setInfoTarget(user)}>
                                <Settings2 className="w-4 h-4 mr-2.5" />
                                Sửa thông tin
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand" onClick={() => {
                                setEditTarget(user);
                                setEditRole(user.role as "manager" | "staff");
                                setEditPermissions(user.permissions || []);
                              }}>
                                <ShieldAlert className="w-4 h-4 mr-2.5" />
                                Phân quyền nhân sự
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand" onClick={() => setNotesTarget(user)}>
                                <MoreHorizontal className="w-4 h-4 mr-2.5" />
                                Ghi chú nội bộ
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand" onClick={() => setResetTarget(user)}>
                                <KeyRound className="w-4 h-4 mr-2.5" />
                                Đặt lại mật khẩu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(user)}
                                className={`cursor-pointer rounded-sm ${user.isActive !== false ? "text-danger focus:text-danger focus:bg-danger/10" : "text-success focus:text-success focus:bg-success/10"}`}
                              >
                                {user.isActive !== false ? (
                                  <><Lock className="w-4 h-4 mr-2.5" /> Khóa tài khoản</>
                                ) : (
                                  <><Unlock className="w-4 h-4 mr-2.5" /> Mở khóa tài khoản</>
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
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-5 bg-surface border-t border-border">
            <div className="text-sm text-ink-muted font-medium">
              Trang {meta.page} / {meta.totalPages} <span className="mx-2 text-border">|</span> Tổng: {meta.totalDocs} nhân viên
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-sm h-9 px-4 font-medium" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Trước</Button>
              <Button variant="outline" size="sm" className="rounded-sm h-9 px-4 font-medium" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>Sau</Button>
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
            updateStaffInfoMutation.mutateAsync({ id: infoTarget.id, data }).then(() => setInfoTarget(null)),
            { loading: "Đang cập nhật...", success: "Đã cập nhật thông tin nhân viên!", error: (err: any) => err.message || "Lỗi cập nhật" }
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
            updateStaffNotesMutation.mutateAsync({ id: notesTarget.id, internalNotes: data.internalNotes || "" }).then(() => setNotesTarget(null)),
            { loading: "Đang lưu ghi chú...", success: "Đã lưu ghi chú thành công!", error: (err: any) => err.message || "Lỗi lưu ghi chú" }
          );
        }}
      />
    </div>
  );
}
