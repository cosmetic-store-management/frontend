import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import CallbackPage from "../../auth/pages/CallbackPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Xác thực",
    noindex: true,
  });

export default function CallbackRoute() {
  return <CallbackPage />;
}
