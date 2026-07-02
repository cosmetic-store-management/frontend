import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import LoginPage from "../../auth/pages/LoginPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Log In",
    description: "Log in to your GlowUp account",
  });

export default function LoginRoute() {
  return <LoginPage />;
}
