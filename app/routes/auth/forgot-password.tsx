import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import ForgotPasswordPage from "../../auth/pages/ForgotPasswordPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Quên mật khẩu",
    description: "Khôi phục mật khẩu tài khoản GlowUp",
  });

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
