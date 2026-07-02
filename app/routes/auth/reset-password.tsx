import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import ResetPasswordPage from "../../auth/pages/ResetPasswordPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Reset Password",
    description: "Reset your GlowUp account password",
  });

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
