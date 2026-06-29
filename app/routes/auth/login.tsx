import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import LoginPage from "../../auth/pages/LoginPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Đăng nhập",
    description: "Đăng nhập vào tài khoản GlowUp của bạn",
  });

export default function LoginRoute() {
  return <LoginPage />;
}
