import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "@/lib/toast";
import { useSocialLogin } from "@/auth/hooks/useAuth";

let processingToken: string | null = null;

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const socialLogin = useSocialLogin();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken") || "";
    const error = searchParams.get("error");

    if (error) {
      toast.error("Login failed or was cancelled.");
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
            toast.success("Login successful!");
            navigate("/", { replace: true });
          },
          onError: () => {
            toast.error("Unable to fetch user information.");
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
        <p className="text-[#333333] font-medium">{"Processing login..."}</p>
      </div>
    </div>
  );
}
