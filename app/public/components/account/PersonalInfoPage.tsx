import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAuth,
  useChangePassword,
  useSendOtp,
  useVerifyOtp,
} from "@/auth/hooks/usePublicAuth";
import { useUpdateProfile, useUpdateAvatar } from "@/public/hooks/useUser";
import {
  profileUpdateSchema,
  changePasswordSchema,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
} from "@/public/schemas/profile.schema";
import { toast } from "@/lib/toast";

const MAX_AVATAR_SIZE = 1.5 * 1024 * 1024;

export function PersonalInfoPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const changePass = useChangePassword();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDatePickerOpen = useRef(false);

  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [otpModalData, setOtpModalData] = useState<{
    email: string;
    profileData: ProfileUpdateFormData;
  } | null>(null);
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpModalData && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpModalData, otpTimer]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const newOtp = [...otpArray];
    if (value.length > 1) {
      for (let i = 0; i < Math.min(value.length, 6); i++) {
        newOtp[i] = value[i];
      }
      setOtpArray(newOtp);
      const nextFocus = Math.min(value.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtpArray(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpArray];
        newOtp[index] = "";
        setOtpArray(newOtp);
      }
    }
  };

  // ── Profile form ──
  const {
    control: profileCtrl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
      gender: user?.gender || undefined,
    },
  });

  useEffect(() => {
    if (user)
      resetProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        gender: user.gender || undefined,
      });
  }, [user, resetProfile]);

  // ── Password form ──
  const {
    control: pwdCtrl,
    handleSubmit: handlePwdSubmit,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_AVATAR_SIZE) {
        toast.error("Ảnh quá lớn. Tối đa 1.5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateAvatar.mutate(ev.target?.result as string, {
          onSuccess: () => toast.success("Cập nhật ảnh đại diện thành công!"),
          onError: () => toast.error("Có lỗi khi cập nhật ảnh."),
        });
      };
      reader.readAsDataURL(file);
    },
    [updateAvatar],
  );

  const executeUpdateProfile = async (data: ProfileUpdateFormData) => {
    try {
      await updateProfile.mutateAsync({
        ...data,
        dob: data.dob ? new Date(data.dob).toISOString() : undefined,
      });
      toast.success("Cập nhật thông tin thành công!");
      setOtpModalData(null);
      setOtpArray(Array(6).fill(""));
      setOtpTimer(0);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Cập nhật thất bại",
      );
    }
  };

  const onSaveProfile = async (data: ProfileUpdateFormData) => {
    // Nếu đổi email, phải gửi OTP
    if (data.email && data.email !== user?.email) {
      try {
        await sendOtpMutation.mutateAsync(data.email);
        setOtpModalData({ email: data.email, profileData: data });
        setOtpTimer(300); // 5 phút = 300 giây
        setOtpArray(Array(6).fill(""));
        toast.success("Mã OTP đã được gửi đến email mới. Vui lòng kiểm tra.");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi khi gửi OTP");
      }
      return;
    }
    await executeUpdateProfile(data);
  };

  const handleVerifyAndSave = async () => {
    const currentOtpCode = otpArray.join("");
    if (!otpModalData || currentOtpCode.length !== 6) return;

    try {
      await verifyOtpMutation.mutateAsync({
        email: otpModalData.email,
        otpCode: currentOtpCode,
      });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn",
      );
      return;
    }

    // Nếu OTP đúng thì mới update
    await executeUpdateProfile(otpModalData.profileData);
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePass.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      resetPwd();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="animate-slide-up bg-surface flex-1">
        {/* ── Hồ sơ ── */}
        <div className="px-6 py-6 border-b border-border/50">
          <h2 className="text-base font-bold text-ink mb-1">Hồ sơ của tôi</h2>
          <p className="text-xs text-ink-muted mb-6">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              id="avatar-upload-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatar.isPending}
              className="group relative w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-brand transition-colors focus:outline-none"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
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
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-white text-[9px] font-bold">
                      Đổi ảnh
                    </span>
                  </>
                )}
              </div>
            </button>
            <p className="text-[11px] text-ink-muted">
              Nhấn vào ảnh để thay đổi · Max 1.5 MB
            </p>
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfileSubmit(onSaveProfile)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-name"
                  className="text-sm font-semibold text-ink"
                >
                  Họ và tên
                </label>
                <Controller
                  control={profileCtrl}
                  name="name"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="profile-name"
                      type="text"
                      placeholder="Nhập họ và tên"
                      className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm"
                    />
                  )}
                />
                {profileErrors.name && (
                  <p className="text-xs text-danger">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-email"
                  className="text-sm font-semibold text-ink"
                >
                  Email
                </label>
                <Controller
                  control={profileCtrl}
                  name="email"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="profile-email"
                      type="email"
                      placeholder="Chưa cập nhật"
                      className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm"
                    />
                  )}
                />
                {profileErrors.email && (
                  <p className="text-xs text-danger">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-phone"
                  className="text-sm font-semibold text-ink"
                >
                  Số điện thoại
                </label>
                <Controller
                  control={profileCtrl}
                  name="phone"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="profile-phone"
                      type="tel"
                      placeholder="Chưa cập nhật"
                      className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm"
                    />
                  )}
                />
                {profileErrors.phone && (
                  <p className="text-xs text-danger">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-dob"
                  className="text-sm font-semibold text-ink"
                >
                  Ngày sinh
                </label>
                <Controller
                  control={profileCtrl}
                  name="dob"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="profile-dob"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      onClick={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (isDatePickerOpen.current) {
                          input.blur();
                          isDatePickerOpen.current = false;
                        } else {
                          input.showPicker?.();
                          isDatePickerOpen.current = true;
                        }
                      }}
                      onBlur={() => {
                        isDatePickerOpen.current = false;
                      }}
                      className="w-full bg-surface-soft border border-border py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none rounded-sm cursor-pointer"
                    />
                  )}
                />
                {profileErrors.dob && (
                  <p className="text-xs text-danger">
                    {profileErrors.dob.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                {/* eslint-disable-next-line  */}
                <label className="text-sm font-semibold text-ink block">
                  Giới tính
                </label>
                <Controller
                  control={profileCtrl}
                  name="gender"
                  render={({ field }) => (
                    <div className="flex items-center gap-6">
                      {[
                        { value: "male", label: "Nam" },
                        { value: "female", label: "Nữ" },
                        { value: "other", label: "Khác" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-sm text-ink"
                        >
                          <input
                            type="radio"
                            {...field}
                            value={opt.value}
                            checked={field.value === opt.value}
                            className="w-4 h-4 accent-brand"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                id="save-profile-btn"
                type="submit"
                disabled={updateProfile.isPending}
                className="btn-hover bg-brand text-white font-bold py-2.5 px-8 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Bảo mật ── */}
        <div className="px-6 py-6">
          <h3 className="text-base font-bold text-ink mb-1">Bảo mật</h3>
          <p className="text-xs text-ink-muted mb-6">
            Đổi mật khẩu định kỳ để bảo vệ tài khoản
          </p>
          <form
            onSubmit={handlePwdSubmit(onChangePassword)}
            className="space-y-4 max-w-md"
          >
            {[
              {
                name: "currentPassword" as const,
                id: "pwd-current",
                label: "Mật khẩu hiện tại",
              },
              {
                name: "newPassword" as const,
                id: "pwd-new",
                label: "Mật khẩu mới",
              },
              {
                name: "confirmPassword" as const,
                id: "pwd-confirm",
                label: "Xác nhận mật khẩu mới",
              },
            ].map(({ name, id, label }) => (
              <div key={name} className="space-y-1.5">
                <label htmlFor={id} className="text-sm font-semibold text-ink">
                  {label}
                </label>
                <Controller
                  control={pwdCtrl}
                  name={name}
                  render={({ field }) => (
                    <input
                      {...field}
                      id={id}
                      type="password"
                      className="w-full bg-surface-soft border border-border rounded-sm py-2 px-3 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
                    />
                  )}
                />
                {pwdErrors[name] && (
                  <p className="text-xs text-danger">
                    {pwdErrors[name]?.message}
                  </p>
                )}
              </div>
            ))}
            <button
              id="save-password-btn"
              type="submit"
              disabled={changePass.isPending}
              className="btn-hover bg-brand text-white font-bold py-2.5 px-8 rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {changePass.isPending ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModalData &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-surface w-full max-w-105 rounded-lg p-6 shadow-xl border border-border/50 animate-scale-up">
              <h3 className="text-lg font-bold text-ink mb-1">
                Xác thực Email
              </h3>
              <p className="text-sm text-ink-muted mb-5 leading-relaxed">
                Mã OTP đã được gửi đến{" "}
                <strong className="text-brand font-semibold">
                  {otpModalData.email}
                </strong>
              </p>
              <div className="flex justify-between gap-2 mb-6">
                {otpArray.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-12 bg-surface-soft border border-border text-center text-xl font-bold focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none rounded-md transition-all shadow-sm"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-ink-muted">
                  Thời gian còn lại:{" "}
                  <strong className="text-danger">
                    {Math.floor(otpTimer / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(otpTimer % 60).toString().padStart(2, "0")}
                  </strong>
                </span>
                {otpTimer === 0 && (
                  <button
                    type="button"
                    onClick={() => onSaveProfile(otpModalData.profileData)}
                    disabled={sendOtpMutation.isPending}
                    className="text-xs text-brand font-bold hover:underline disabled:opacity-50"
                  >
                    {sendOtpMutation.isPending ? "Đang gửi..." : "Gửi lại mã"}
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpModalData(null);
                    setOtpArray(Array(6).fill(""));
                    setOtpTimer(0);
                  }}
                  className="btn-hover bg-surface-soft text-ink text-sm font-medium py-2 px-5 rounded-md hover:bg-border/50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAndSave}
                  disabled={
                    otpArray.join("").length !== 6 ||
                    verifyOtpMutation.isPending ||
                    otpTimer === 0
                  }
                  className="btn-hover bg-brand text-white text-sm font-medium py-2 px-5 rounded-md hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {verifyOtpMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
