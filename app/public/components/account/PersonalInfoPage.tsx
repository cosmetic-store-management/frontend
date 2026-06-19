import { useState, useEffect, useRef, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useChangePassword } from "@/auth/hooks/usePublicAuth";
import { useUpdateProfile, useUpdateAvatar } from "@/public/hooks/useUser";
import { profileUpdateSchema, changePasswordSchema, type ProfileUpdateFormData, type ChangePasswordFormData } from "@/public/schemas/profile.schema";
import { toast } from "@/lib/toast";

export function PersonalInfoPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateAvatar  = useUpdateAvatar();
  const changePass    = useChangePassword();

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const isDatePickerOpen = useRef(false);

  // ── Profile form ──
  const { control: profileCtrl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } =
    useForm<ProfileUpdateFormData>({
      resolver: zodResolver(profileUpdateSchema),
      defaultValues: { name: user?.name || "", phone: user?.phone || "", dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "", gender: user?.gender || undefined },
    });

  useEffect(() => {
    if (user) resetProfile({ name: user.name || "", phone: user.phone || "", dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "", gender: user.gender || undefined });
  }, [user, resetProfile]);

  // ── Password form ──
  const { control: pwdCtrl, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrors }, reset: resetPwd } =
    useForm<ChangePasswordFormData>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { toast.error("Ảnh quá lớn. Tối đa 1.5 MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateAvatar.mutate(ev.target?.result as string, {
        onSuccess: () => toast.success("Cập nhật ảnh đại diện thành công!"),
        onError:   () => toast.error("Có lỗi khi cập nhật ảnh."),
      });
    };
    reader.readAsDataURL(file);
  }, [updateAvatar]);

  const onSaveProfile = async (data: ProfileUpdateFormData) => {
    try {
      await updateProfile.mutateAsync({ ...data, dob: data.dob ? new Date(data.dob).toISOString() : undefined });
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Cập nhật thất bại");
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePass.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Đổi mật khẩu thành công!");
      resetPwd();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (!user) return null;

  return (
    <div className="animate-slide-up bg-surface flex-1">
      {/* ── Hồ sơ ── */}
      <div className="px-6 py-6 border-b border-border/50">
        <h2 className="text-base font-bold text-ink mb-1">Hồ sơ của tôi</h2>
        <p className="text-xs text-ink-muted mb-6">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          <button
            id="avatar-upload-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatar.isPending}
            className="group relative w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-brand transition-colors focus:outline-none"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-success/20 text-success font-black text-2xl flex items-center justify-center">
                {user.name?.substring(0, 2).toUpperCase() || "KH"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              {updateAvatar.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white text-[9px] font-bold">Đổi ảnh</span>
                </>
              )}
            </div>
          </button>
          <p className="text-[11px] text-ink-muted">Nhấn vào ảnh để thay đổi · Max 1.5 MB</p>
        </div>

        {/* Profile form */}
        <form onSubmit={handleProfileSubmit(onSaveProfile)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-sm font-semibold text-ink">Họ và tên</label>
              <Controller control={profileCtrl} name="name" render={({ field }) => (
                <input {...field} id="profile-name" type="text" placeholder="Nhập họ và tên"
                  className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm" />
              )} />
              {profileErrors.name && <p className="text-xs text-danger">{profileErrors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="text-sm font-semibold text-ink">Email</label>
              <input id="profile-email" type="email" value={user.email || ""} disabled
                className="w-full bg-surface-soft/50 border border-border py-2 px-3 text-sm text-ink-muted cursor-not-allowed rounded-sm" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="text-sm font-semibold text-ink">Số điện thoại</label>
              <input id="profile-phone" type="tel" value={user.phone || "Chưa cập nhật"} disabled
                className="w-full bg-surface-soft/50 border border-border py-2 px-3 text-sm text-ink-muted cursor-not-allowed rounded-sm" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-dob" className="text-sm font-semibold text-ink">Ngày sinh</label>
              <Controller control={profileCtrl} name="dob" render={({ field }) => (
                <input {...field} id="profile-dob" type="date" max={new Date().toISOString().split("T")[0]}
                  onClick={(e) => {
                    const input = e.target as HTMLInputElement;
                    if (isDatePickerOpen.current) { input.blur(); isDatePickerOpen.current = false; }
                    else { input.showPicker?.(); isDatePickerOpen.current = true; }
                  }}
                  onBlur={() => { isDatePickerOpen.current = false; }}
                  className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm cursor-pointer" />
              )} />
              {profileErrors.dob && <p className="text-xs text-danger">{profileErrors.dob.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-ink block">Giới tính</label>
              <Controller control={profileCtrl} name="gender" render={({ field }) => (
                <div className="flex items-center gap-6">
                  {[{ value: "male", label: "Nam" }, { value: "female", label: "Nữ" }, { value: "other", label: "Khác" }].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-ink">
                      <input type="radio" {...field} value={opt.value} checked={field.value === opt.value} className="w-4 h-4 accent-brand" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )} />
            </div>
          </div>

          <div className="mt-6">
            <button id="save-profile-btn" type="submit" disabled={updateProfile.isPending}
              className="btn-hover bg-brand text-white font-bold py-2.5 px-8 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
              {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Bảo mật ── */}
      <div className="px-6 py-6">
        <h3 className="text-base font-bold text-ink mb-1">Bảo mật</h3>
        <p className="text-xs text-ink-muted mb-6">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
        <form onSubmit={handlePwdSubmit(onChangePassword)} className="space-y-4 max-w-md">
          {[
            { name: "currentPassword" as const, id: "pwd-current", label: "Mật khẩu hiện tại" },
            { name: "newPassword"     as const, id: "pwd-new",     label: "Mật khẩu mới" },
            { name: "confirmPassword" as const, id: "pwd-confirm", label: "Xác nhận mật khẩu mới" },
          ].map(({ name, id, label }) => (
            <div key={name} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
              <Controller control={pwdCtrl} name={name} render={({ field }) => (
                <input {...field} id={id} type="password"
                  className="w-full bg-surface-soft border border-border rounded-sm py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none" />
              )} />
              {pwdErrors[name] && <p className="text-xs text-danger">{pwdErrors[name]?.message}</p>}
            </div>
          ))}
          <button id="save-password-btn" type="submit" disabled={changePass.isPending}
            className="btn-hover bg-brand text-white font-bold py-2.5 px-8 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60">
            {changePass.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
