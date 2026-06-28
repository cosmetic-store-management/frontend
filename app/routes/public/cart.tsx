import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { CartPage } from "../../public/pages/CartPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Cart",
    noindex: true, // Cart page does not need indexing
  });

export default function CartRoute() {
  return <CartPage />;
}
