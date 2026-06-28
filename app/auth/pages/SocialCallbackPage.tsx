import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "@/lib/toast";
import { useSocialLogin } from "@/auth/hooks/usePublicAuth";

let processingToken: string | null = null;

export default function SocialCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const socialLogin = useSocialLogin();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken") || "";
    const error = searchParams.get("error");

    if (error) {
      toast.error("Đăng nhập thất bại hoặc bị hủy bỏ.");
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      if (processingToken === token) return;
      processingToken = token;

      socialLogin.mutate(
        { token, refreshToken },
        {
          onSuccess: () => {
            toast.success("Đăng nhập thành công!");
            navigate("/", { replace: true });
          },
          onError: () => {
            toast.error("Không thể lấy thông tin người dùng.");
            navigate("/login", { replace: true });
          },
        },
      );
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, socialLogin]);

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#8A151B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#333333] font-medium">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
