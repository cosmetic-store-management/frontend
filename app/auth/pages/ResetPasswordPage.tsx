import { useSearchParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "@/auth/hooks/useAuth";
import {
  resetPasswordSchema,
  type ResetPasswordForm,
} from "../schemas/auth.schema";
import { toast } from "@/lib/toast";
import { Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error("Token not found. The link is invalid.");
      return;
    }

    resetPasswordMutation.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success("Password reset successfully!");
          navigate("/login");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Something went wrong");
        },
      },
    );
  };

  if (!token) {
    return (
      <div className="w-full max-w-125 mx-auto py-20 px-4">
        <div className="w-full text-center">
          <h1 className="text-xl uppercase tracking-widest font-semibold text-[#8A151B] mb-2">
            Error
          </h1>
          <p className="text-sm text-[#757575]">
            The password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-125 mx-auto py-20 px-4">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl uppercase tracking-widest font-semibold text-[#333333]">
            Reset Password
          </h1>
          <p className="text-sm text-[#757575] mt-3">
            Please enter your new password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="relative">
            <input
              type="password"
              placeholder="New password"
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

          <div className="relative">
            <input
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              className={`w-full h-12 px-4 bg-white border ${
                errors.confirmPassword
                  ? "border-danger focus:border-danger"
                  : "border-[#cccccc] focus:border-[#333333]"
              } text-[#333333] placeholder:text-[#757575] focus:ring-0 outline-none text-sm`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger mt-1.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting || resetPasswordMutation.isPending}
              className="w-full bg-[#8A151B] hover:bg-[#7a1218] text-[#f8f8f8] h-12.5 flex items-center justify-center font-medium uppercase text-sm disabled:opacity-70"
            >
              {isSubmitting || resetPasswordMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Confirm Reset"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
