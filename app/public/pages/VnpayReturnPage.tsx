import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

export function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const responseCode = searchParams.get("vnp_ResponseCode");
  const orderCode = searchParams.get("vnp_TxnRef");
  
  const isSuccess = responseCode === "00";

  useEffect(() => {
    // Tự động chuyển hướng về trang đơn hàng sau 3s
    const timer = setTimeout(() => {
      navigate("/account?view=orders");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!responseCode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface-soft p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-soft p-4 animate-page-enter">
      <div className="bg-surface p-8 rounded-sm shadow-sm text-center max-w-sm w-full animate-fade-in">
        {isSuccess ? (
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-danger/20 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10" />
          </div>
        )}
        
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? "text-success" : "text-danger"}`}>
          {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h2>
        
        <p className="text-ink-muted mb-6">
          Đơn hàng <span className="font-semibold text-ink">{orderCode}</span> 
          {isSuccess ? " đã được thanh toán qua VNPay." : " thanh toán bị lỗi hoặc đã bị hủy."}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-brand text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Đang chuyển hướng về hồ sơ...
        </div>
      </div>
    </div>
  );
}
