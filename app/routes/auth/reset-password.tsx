import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import ResetPasswordPage from "../../auth/pages/ResetPasswordPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Đặt lại mật khẩu",
    description: "Đặt lại mật khẩu tài khoản GlowUp",
  });

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
