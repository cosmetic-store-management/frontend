import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Shield, CreditCard, Database, Loader2, Store, Truck, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useSettings, useSaveSettings, useDownloadBackup } from "../hooks/useSettings";
import { settingsSchema, type SettingsFormData } from "../schemas/settings.schema";

// Custom Switch component to avoid dependency on Shadcn Switch if it's not installed
const CustomSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
      ${checked ? "bg-brand" : "bg-ink-lighter/30"}
    `}
  >
    <span
      className={`
        pointer-events-none block h-5 w-5 rounded-full bg-surface shadow-lg ring-0 transition-transform
        ${checked ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const saveSettingsMutation = useSaveSettings();
  const backupMutation = useDownloadBackup();
  const [activeTab, setActiveTab] = useState<"general" | "payment" | "security">("general");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      storeName: "",
      email: "",
      phone: "",
      storeAddress: "",
      currency: "VND",
      standardShippingFee: 30000,
      freeShippingThreshold: 500000,
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

  const isBankActive = watch("isBankActive");

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        storeAddress: settings.storeAddress || "",
        currency: settings.currency || "VND",
        standardShippingFee: settings.standardShippingFee ?? 30000,
        freeShippingThreshold: settings.freeShippingThreshold ?? 500000,
        pointsEarnRate: settings.pointsEarnRate ?? 100,
        maxPointsPct: settings.maxPointsPct ?? 50,
        isCodActive: !!settings.isCodActive,
        isBankActive: !!settings.isBankActive,
        bankName: settings.bankName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankAccountName: settings.bankAccountName || "",
        isQrActive: !!settings.isQrActive,
      });
    }
  }, [settings, reset]);

  const onSubmitAll = async (data: SettingsFormData) => {
    try {
      await saveSettingsMutation.mutateAsync(data);
      toast.success("Đã lưu cấu hình thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình!");
    }
  };

  const onError = (errors: any) => {
    if (errors.storeName || errors.email || errors.phone || errors.storeAddress || errors.standardShippingFee || errors.freeShippingThreshold) {
      toast.error("Vui lòng điền đúng thông tin Cài đặt chung");
      setActiveTab("general");
    } else if (errors.isBankActive || errors.bankName || errors.bankAccountNumber || errors.bankAccountName) {
      toast.error("Vui lòng điền đúng thông tin Cổng thanh toán");
      setActiveTab("payment");
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
    }
  };

  const handleBackup = () => {
    toast.promise(backupMutation.mutateAsync(), {
      loading: "Đang sao lưu cơ sở dữ liệu...",
      success: "Đã tạo bản sao lưu thành công (glowup_db_backup.json)",
      error: (err: any) => err.message || "Lỗi khi sao lưu dữ liệu!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-ink-muted">Đang tải cấu hình hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-page-enter text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-sm text-ink-muted mt-1">Quản lý cài đặt chung, chính sách vận chuyển, và cổng thanh toán</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1 bg-surface border border-border rounded-sm p-3 shadow-ui-soft h-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "general" ? "bg-brand text-white font-medium shadow-ui-soft" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <Settings className="w-4 h-4" /> Cài đặt chung
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "payment" ? "bg-brand text-white font-medium shadow-ui-soft" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Cổng thanh toán
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
              activeTab === "security" ? "bg-brand text-white font-medium shadow-ui-soft" : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <Shield className="w-4 h-4" /> Bảo mật & Dữ liệu
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <form id="settings-form" onSubmit={handleSubmit(onSubmitAll as any, onError)}>
            
            {/* TAB 1: CÀI ĐẶT CHUNG */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Thông tin cửa hàng */}
                <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                    <Store className="w-5 h-5 text-brand" />
                    <h3 className="font-semibold text-base text-ink">Thông tin cửa hàng</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="storeName" className="text-xs font-semibold text-ink">Tên cửa hàng <span className="text-danger">*</span></Label>
                      <Controller control={control} name="storeName" render={({ field }) => (
                        <Input {...field} id="storeName" placeholder="GlowUp Cosmetics" />
                      )} />
                      {errors.storeName && <p className="text-xs text-danger">{errors.storeName.message}</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="currency" className="text-xs font-semibold text-ink">Đơn vị tiền tệ</Label>
                      <Controller control={control} name="currency" render={({ field }) => (
                        <Input {...field} id="currency" disabled />
                      )} />
                      {errors.currency && <p className="text-xs text-danger">{errors.currency.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="email" className="text-xs font-semibold text-ink">Email liên hệ <span className="text-danger">*</span></Label>
                      <Controller control={control} name="email" render={({ field }) => (
                        <Input {...field} id="email" type="email" placeholder="contact@shop.com" />
                      )} />
                      {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="phone" className="text-xs font-semibold text-ink">Hotline hỗ trợ <span className="text-danger">*</span></Label>
                      <Controller control={control} name="phone" render={({ field }) => (
                        <Input {...field} id="phone" placeholder="090..." />
                      )} />
                      {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="storeAddress" className="text-xs font-semibold text-ink">Địa chỉ cửa hàng <span className="text-danger">*</span></Label>
                    <Controller control={control} name="storeAddress" render={({ field }) => (
                      <Input {...field} id="storeAddress" placeholder="Địa chỉ chi tiết phục vụ đổi trả/hóa đơn" />
                    )} />
                    {errors.storeAddress && <p className="text-xs text-danger">{errors.storeAddress.message}</p>}
                  </div>
                </div>

                {/* Chính sách giao hàng */}
                <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                    <Truck className="w-5 h-5 text-brand" />
                    <h3 className="font-semibold text-base text-ink">Chính sách vận chuyển</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="standardShippingFee" className="text-xs font-semibold text-ink">Phí ship mặc định (VNĐ) <span className="text-danger">*</span></Label>
                      <Controller control={control} name="standardShippingFee" render={({ field }) => (
                        <Input {...field} id="standardShippingFee" type="number" min="0" step="1000" />
                      )} />
                      {errors.standardShippingFee && <p className="text-xs text-danger">{errors.standardShippingFee.message}</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="freeShippingThreshold" className="text-xs font-semibold text-ink">Ngưỡng miễn phí Freeship (VNĐ) <span className="text-danger">*</span></Label>
                      <Controller control={control} name="freeShippingThreshold" render={({ field }) => (
                        <Input {...field} id="freeShippingThreshold" type="number" min="0" step="10000" />
                      )} />
                      {errors.freeShippingThreshold && <p className="text-xs text-danger">{errors.freeShippingThreshold.message}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Hệ thống sẽ tự động tính phí vận chuyển cho khách hàng lúc thanh toán dựa trên các thông số này. Không sử dụng API bên thứ 3.
                  </p>
                </div>

                {/* Chương trình điểm thưởng */}
                <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                    <span className="text-brand text-lg">✦</span>
                    <h3 className="font-semibold text-base text-ink">Chương trình điểm thưởng</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="pointsEarnRate" className="text-xs font-semibold text-ink">
                        Tỷ lệ tích điểm <span className="text-danger">*</span>
                      </Label>
                      <Controller control={control} name="pointsEarnRate" render={({ field }) => (
                        <Input {...field} id="pointsEarnRate" type="number" min="1" step="1" />
                      )} />
                      {errors.pointsEarnRate && <p className="text-xs text-danger">{errors.pointsEarnRate.message}</p>}
                      <p className="text-xs text-ink-muted">Chi N đồng = 1 điểm GlowUp (mặc định: 100)</p>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label htmlFor="maxPointsPct" className="text-xs font-semibold text-ink">
                        Giới hạn dùng điểm (%) <span className="text-danger">*</span>
                      </Label>
                      <Controller control={control} name="maxPointsPct" render={({ field }) => (
                        <Input {...field} id="maxPointsPct" type="number" min="1" max="100" step="1" />
                      )} />
                      {errors.maxPointsPct && <p className="text-xs text-danger">{errors.maxPointsPct.message}</p>}
                      <p className="text-xs text-ink-muted">Tối đa X% giá trị đơn hàng có thể thanh toán bằng điểm (mặc định: 50%)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CỔNG THANH TOÁN */}
            {activeTab === "payment" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                    <CreditCard className="w-5 h-5 text-brand" />
                    <h3 className="font-semibold text-base text-ink">Phương thức thanh toán</h3>
                  </div>

                  <div className="space-y-6">
                    {/* COD */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">Thanh toán khi nhận hàng (COD)</h4>
                        <p className="text-xs text-ink-muted">Cho phép khách hàng thanh toán bằng tiền mặt khi nhận hàng.</p>
                      </div>
                      <Controller control={control} name="isCodActive" render={({ field: { value, onChange } }) => (
                        <CustomSwitch checked={value} onChange={onChange} />
                      )} />
                    </div>

                    {/* Bank Transfer */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-ink">Chuyển khoản ngân hàng trực tiếp</h4>
                          <p className="text-xs text-ink-muted">Cung cấp thông tin tài khoản để khách chuyển khoản thủ công.</p>
                        </div>
                        <Controller control={control} name="isBankActive" render={({ field: { value, onChange } }) => (
                          <CustomSwitch checked={value} onChange={onChange} />
                        )} />
                      </div>

                      {/* Thông tin NH chỉ hiện khi bật chuyển khoản */}
                      {isBankActive && (
                        <div className="bg-surface-soft p-4 rounded-md border border-border/60 space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Landmark className="w-4 h-4 text-brand" />
                            <h5 className="text-sm font-semibold text-ink">Thông tin tài khoản nhận tiền</h5>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                              <Label className="text-xs font-semibold text-ink">Tên Ngân hàng</Label>
                              <Controller control={control} name="bankName" render={({ field }) => (
                                <Input {...field} placeholder="VD: Vietcombank" />
                              )} />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <Label className="text-xs font-semibold text-ink">Số Tài Khoản</Label>
                              <Controller control={control} name="bankAccountNumber" render={({ field }) => (
                                <Input {...field} placeholder="VD: 0123456789" />
                              )} />
                            </div>
                          </div>
                          <div className="space-y-1.5 text-left">
                            <Label className="text-xs font-semibold text-ink">Tên Chủ Tài Khoản</Label>
                            <Controller control={control} name="bankAccountName" render={({ field }) => (
                              <Input {...field} placeholder="VD: NGUYEN VAN A" />
                            )} />
                          </div>
                          {errors.isBankActive && (
                            <p className="text-xs text-danger">{errors.isBankActive.message}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">Thanh toán qua mã QR (Momo/VNPAY)</h4>
                        <p className="text-xs text-ink-muted">Chức năng tích hợp đang được xây dựng (Coming soon).</p>
                      </div>
                      <Controller control={control} name="isQrActive" render={({ field: { value, onChange } }) => (
                        <CustomSwitch checked={value} onChange={onChange} />
                      )} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BẢO MẬT & DỮ LIỆU */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                    <Database className="w-5 h-5 text-brand" />
                    <h3 className="font-semibold text-base text-ink">Hệ thống & Dữ liệu</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-soft p-4 rounded-md border border-border/60">
                    <div>
                      <h4 className="text-sm font-semibold text-ink">Sao lưu cơ sở dữ liệu</h4>
                      <p className="text-xs text-ink-muted mt-1">
                        Trích xuất toàn bộ thông tin sản phẩm, đơn hàng, người dùng thành file JSON.
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleBackup} 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 border-dashed whitespace-nowrap" 
                      disabled={backupMutation.isPending}
                    >
                      {backupMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Tải bản Backup"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            {(activeTab === "general" || activeTab === "payment") && (
              <div className="flex justify-end pt-4 mt-6 border-t border-border">
                <Button type="submit" className="min-w-[120px]" disabled={saveSettingsMutation.isPending}>
                  {saveSettingsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
