import { Link, useNavigate, useLocation } from "react-router";
import { Phone, Lock, LogIn, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/auth/hooks/usePublicAuth";
import {
  publicLoginSchema,
  type PublicLoginForm,
} from "../schemas/public-auth.schema";
import { toast } from "@/lib/toast";

export default function PublicLoginPage() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicLoginForm>({
    resolver: zodResolver(publicLoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: PublicLoginForm) => {
    try {
      const isEmail = data.identifier.includes("@");
      const payload = isEmail
        ? { email: data.identifier, password: data.password }
        : { phone: data.identifier, password: data.password };

      await loginMutation.mutateAsync(payload);
      toast.success("Đăng nhập thành công!");
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");
      // Prevent SSR hydration bugs on redirect like in Admin
      if (returnUrl) {
        {
          /* eslint-disable-next-line  */
        }
        window.location.href = returnUrl;
      } else {
        {
          /* eslint-disable-next-line  */
        }
        window.location.href = "/";
      }
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div className="w-full max-w-125 mx-auto py-20 px-4">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl uppercase tracking-widest font-semibold text-[#333333]">
            Đăng nhập
          </h1>
          <p className="text-sm text-[#757575] mt-3">
            Nếu bạn đã có tài khoản, hãy đăng nhập để tích lũy điểm và mua hàng
            nhanh hơn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Email hoặc số điện thoại"
              {...register("identifier")}
              className={`w-full h-12 px-4 bg-white border ${
                errors.identifier
                  ? "border-danger focus:border-danger"
                  : "border-[#cccccc] focus:border-[#333333]"
              } text-[#333333] placeholder:text-[#757575] focus:ring-0 outline-none text-sm`}
            />
            {errors.identifier && (
              <p className="text-xs text-danger mt-1.5">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Mật khẩu"
              {...register("password")}
              className={`w-full h-12 px-4 bg-white border ${
                errors.password
                  ? "border-danger focus:border-danger"
                  : "border-[#cccccc] focus:border-[#333333]"
              } text-[#333333] placeholder:text-[#757575] focus:ring-0 outline-none text-sm`}
            />
            {errors.password && (
              <p className="text-xs text-danger mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="remember"
                  {...(register as any)("remember")}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border border-zinc-300 bg-white rounded-none peer-checked:bg-brand peer-checked:border-brand transition-colors flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white pointer-events-none transition-opacity opacity-0 peer-checked:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-[#333333]">Ghi nhớ đăng nhập</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-[#8A151B] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full bg-[#8A151B] hover:bg-[#7a1218] text-[#f8f8f8] h-12.5 flex items-center justify-center font-medium uppercase text-sm disabled:opacity-70"
            >
              {isSubmitting || loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Đăng nhập"
              )}
            </button>

            <a
              href={`${import.meta.env.VITE_API_URL}/auth/facebook`}
              className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-[#f8f8f8] h-12.5 font-medium flex items-center justify-center gap-4"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
              </svg>
              Đăng nhập Facebook
            </a>

            <a
              href={`${import.meta.env.VITE_API_URL}/auth/google`}
              className="w-full bg-[#db4437] hover:bg-[#c23321] text-[#f8f8f8] h-12.5 font-medium flex items-center justify-center gap-4"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Đăng nhập Google
            </a>
          </div>
        </form>

        <div className="mt-12 text-center">
          <h2 className="text-sm uppercase tracking-widest font-semibold text-[#333333] mb-4">
            Tạo tài khoản ngay
          </h2>
          <Link
            to="/register"
            className="block w-full bg-white hover:bg-gray-50 border border-[#cccccc] text-[#333333] h-12 px-4 flex items-center justify-center font-medium"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
