import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { CheckoutPage } from "../../public/pages/CheckoutPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Checkout",
    noindex: true,
  });

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
