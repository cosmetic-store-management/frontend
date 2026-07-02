import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import ForgotPasswordPage from "../../auth/pages/ForgotPasswordPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Forgot Password",
    description: "Recover your GlowUp account password",
  });

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
