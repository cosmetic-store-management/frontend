import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/auth/hooks/usePublicAuth";
import {
  publicForgotPasswordSchema,
  type PublicForgotPasswordForm,
} from "../schemas/public-auth.schema";
import { toast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

export default function PublicForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PublicForgotPasswordForm>({
    resolver: zodResolver(publicForgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const onSubmit = async (data: PublicForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      },
    });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-125 mx-auto py-20 px-4">
        <div className="w-full text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-xl uppercase tracking-widest font-semibold text-[#333333] mb-4">
            Kiểm tra hộp thư
          </h1>
          <p className="text-sm text-[#757575] mb-8 leading-relaxed">
            Nếu tài khoản gắn với email <strong>{getValues("email")}</strong>{" "}
            tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Link có hiệu lực
            trong <strong>1 giờ</strong>.
          </p>
          <Link
            to="/login"
            className="text-sm text-[#8A151B] hover:underline font-medium"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-125 mx-auto py-20 px-4">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl uppercase tracking-widest font-semibold text-[#333333]">
            Khôi phục mật khẩu
          </h1>
          <p className="text-sm text-[#757575] mt-3">
            Nhập số điện thoại của bạn, chúng tôi sẽ gửi link đặt lại qua email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="relative">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              {...register("email")}
              className={`w-full h-12 px-4 bg-white border ${
                errors.email
                  ? "border-danger focus:border-danger"
                  : "border-[#cccccc] focus:border-[#333333]"
              } text-[#333333] placeholder:text-[#757575] focus:ring-0 outline-none text-sm`}
            />
            {errors.email && (
              <p className="text-xs text-danger mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
              className="w-full bg-[#8A151B] hover:bg-[#7a1218] text-[#f8f8f8] h-12.5 flex items-center justify-center font-medium uppercase text-sm disabled:opacity-70"
            >
              {isSubmitting || forgotPasswordMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm">
          <Link
            to="/login"
            className="text-[#8A151B] hover:underline font-medium"
          >
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
