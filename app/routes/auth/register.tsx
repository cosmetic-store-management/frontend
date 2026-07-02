import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import RegisterPage from "../../auth/pages/RegisterPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Sign Up",
    description: "Create a new GlowUp account",
  });

export default function RegisterRoute() {
  return <RegisterPage />;
}
