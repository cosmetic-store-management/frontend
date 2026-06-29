import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import RegisterPage from "../../auth/pages/RegisterPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Đăng ký",
    description: "Tạo tài khoản GlowUp mới",
  });

export default function RegisterRoute() {
  return <RegisterPage />;
}
