import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings,
  Shield,
  CreditCard,
  Loader2,
  Store,
  Lock,
  Save,
  Palette,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { useSettings, useSaveSettings } from "../hooks/useSettings";
import { useBanks } from "@/public/hooks/useBank";
import { useChangePassword } from "@/auth/hooks/useAuth";
import { useAuthStore } from "@/auth/store/auth.store";
import {
  settingsSchema,
  accountSchema,
  passwordSchema,
  type SettingsFormData,
  type AccountFormData,
  type PasswordFormData,
} from "../schemas/settings.schema";

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const saveSettingsMutation = useSaveSettings();
  const changePasswordMutation = useChangePassword();

  const { user } = useAuthStore();

  const { data: banks = [] } = useBanks();

  const [activeTab, setActiveTab] = useState<
    "general" | "branding" | "payment" | "security"
  >("general");

  // Form Cài đặt chung & Thanh toán
  const {
    control,
    handleSubmit,
    reset,
    watch: _watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      storeName: "",
      email: "",
      phone: "",
      storeAddress: "",
      logoUrl: "",
      favicon: "",
      currency: "VND",
      pointsEarnRate: 100,
      maxPointsPct: 50,
      isCodActive: false,
      isBankActive: false,
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
      isQrActive: false,
    },
  });

  // Form Thông tin cá nhân
  const {
    control: _accountControl,
    handleSubmit: _handleAccountSubmit,
    reset: resetAccount,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Form Đổi mật khẩu
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        storeAddress: settings.storeAddress || "",
        taxId: settings.taxId || "",
        workingHours: settings.workingHours || "",
        description: settings.description || "",
        logoUrl: settings.logoUrl || "",
        favicon: settings.favicon || "",
        seoTitle: settings.seoTitle || "",
        seoDescription: settings.seoDescription || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        zaloUrl: settings.zaloUrl || "",
        currency: settings.currency || "VND",
        pointsEarnRate: settings.pointsEarnRate ?? 100,
        maxPointsPct: settings.maxPointsPct ?? 50,
        profitMargin: settings.profitMargin ?? 0,
        isCodActive: !!settings.isCodActive,
        isBankActive: !!settings.isBankActive,
        isQrActive: !!settings.isQrActive,
        bankName: settings.bankName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankAccountName: settings.bankAccountName || "",
        bankQrCodeUrl: settings.bankQrCodeUrl || "",
      });
    }
  }, [settings, reset]);

  useEffect(() => {
    if (user) {
      resetAccount({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, resetAccount]);

  const onSubmitAll = async (data: SettingsFormData) => {
    try {
      await saveSettingsMutation.mutateAsync(data as any);
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error saving settings!");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully!");
      resetPassword();
    } catch (err: any) {
      toast.error(err.message || "Error changing password!");
    }
  };

  const onError = () => {
    toast.error("Please check the entered information");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-ink-muted">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-page-enter text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage general settings, payment gateways, and account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1 bg-card border border-border rounded-sm p-3 shadow-sm h-fit sticky top-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "general"
                ? "text-white font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={
              activeTab === "general"
                ? { background: "hsl(352, 72%, 52%)" }
                : {}
            }
          >
            <Settings className="w-4 h-4" /> General
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "branding"
                ? "text-white font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={
              activeTab === "branding"
                ? { background: "hsl(352, 72%, 52%)" }
                : {}
            }
          >
            <Palette className="w-4 h-4" /> Branding
          </button>

          <button
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "payment"
                ? "text-white font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={
              activeTab === "payment"
                ? { background: "hsl(352, 72%, 52%)" }
                : {}
            }
          >
            <CreditCard className="w-4 h-4" /> Payment
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "security"
                ? "text-white font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={
              activeTab === "security"
                ? { background: "hsl(352, 72%, 52%)" }
                : {}
            }
          >
            <Shield className="w-4 h-4" /> Account & Security
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {(activeTab === "general" ||
            activeTab === "branding" ||
            activeTab === "payment") && (
            <form
              onSubmit={handleSubmit(onSubmitAll, onError)}
              className="space-y-6"
            >
              {activeTab === "general" && (
                <>
                  <div className="premium-card p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-border pb-4">
                      <Store className="w-5 h-5 text-brand" />
                      <h2 className="text-lg font-bold text-ink">
                        Store Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>
                          Store Name <span className="text-danger">*</span>
                        </Label>
                        <Controller
                          name="storeName"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Store Name" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="09xxxx" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Controller
                          name="email"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="email@shop.com" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax ID</Label>
                        <Controller
                          name="taxId"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Tax ID" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Store Address</Label>
                        <Controller
                          name="storeAddress"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="123 Street..." />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Working Hours</Label>
                        <Controller
                          name="workingHours"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="08:00 - 22:00" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Controller
                          name="currency"
                          control={control}
                          render={({ field }) => <Input {...field} disabled />}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Store Description</Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Description..." />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div className="premium-card p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-border pb-4">
                      <Palette className="w-5 h-5 text-brand" />
                      <h2 className="text-lg font-bold text-ink">Branding</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <Controller
                          name="logoUrl"
                          control={control}
                          render={({ field }) => (
                            <ImageUpload
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <Controller
                          name="favicon"
                          control={control}
                          render={({ field }) => (
                            <ImageUpload
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>SEO Title</Label>
                        <Controller
                          name="seoTitle"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Website title" />
                          )}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>SEO Description</Label>
                        <Controller
                          name="seoDescription"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder="Search engine description"
                              rows={2}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="premium-card p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-border pb-4">
                      <Share2 className="w-5 h-5 text-brand" />
                      <h2 className="text-lg font-bold text-ink">
                        Social Media
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Facebook URL</Label>
                        <Controller
                          name="facebookUrl"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="https://facebook.com/..."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram URL</Label>
                        <Controller
                          name="instagramUrl"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="https://instagram.com/..."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>TikTok URL</Label>
                        <Controller
                          name="tiktokUrl"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="https://tiktok.com/..."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Youtube URL</Label>
                        <Controller
                          name="youtubeUrl"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="https://youtube.com/..."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zalo URL</Label>
                        <Controller
                          name="zaloUrl"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="https://zalo.me/..."
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "general" && (
                <>
                  <div className="premium-card p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-border pb-4">
                      <Store className="w-5 h-5 text-brand" />
                      <h2 className="text-lg font-bold text-ink">
                        Reward Points
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label>Earn Rate (VND = 1 point)</Label>
                        <Controller
                          name="pointsEarnRate"
                          control={control}
                          render={({ field }) => (
                            <Input type="number" {...field} />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max % Points Usage</Label>
                        <Controller
                          name="maxPointsPct"
                          control={control}
                          render={({ field }) => (
                            <Input type="number" {...field} />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "payment" && (
                <div className="space-y-6">
                  {/* Bank Transfer */}
                  <div className="premium-card p-5">
                    <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                      <CreditCard className="w-5 h-5 text-brand" />
                      <h2 className="text-lg font-bold text-ink">
                        Bank Transfer
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                      <div className="space-y-2">
                        <Label>Bank</Label>
                        <Controller
                          name="bankName"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full h-10 [&>span]:w-full [&>span]:overflow-hidden [&>span]:block">
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent className="max-h-75">
                                {banks.map((bank: any) => (
                                  <SelectItem
                                    key={bank.bin}
                                    value={bank.bin}
                                    className="w-full"
                                  >
                                    <div className="flex items-center gap-2 w-full overflow-hidden">
                                      <img
                                        src={bank.logo}
                                        alt={bank.shortName}
                                        className="w-5 h-5 object-contain shrink-0"
                                      />
                                      <span className="truncate block text-left">
                                        {bank.shortName} - {bank.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Controller
                          name="bankAccountNumber"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Account Number" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Controller
                          name="bankAccountName"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} placeholder="Account Name" />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saveSettingsMutation.isPending}
                  className="gap-2 px-6"
                >
                  {saveSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Settings
                </Button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="premium-card p-6 space-y-6"
              >
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <Lock className="w-5 h-5 text-brand" />
                  <h2 className="text-lg font-bold text-ink">
                    Change Password
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Current Password</Label>
                    <Controller
                      name="currentPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <Input {...field} type="password" />
                      )}
                    />
                    {passwordErrors.currentPassword && (
                      <span className="text-xs text-danger">
                        {passwordErrors.currentPassword.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Controller
                      name="newPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <Input {...field} type="password" />
                      )}
                    />
                    {passwordErrors.newPassword && (
                      <span className="text-xs text-danger">
                        {passwordErrors.newPassword.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Controller
                      name="confirmPassword"
                      control={passwordControl}
                      render={({ field }) => (
                        <Input {...field} type="password" />
                      )}
                    />
                    {passwordErrors.confirmPassword && (
                      <span className="text-xs text-danger">
                        {passwordErrors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="gap-2 px-6"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
