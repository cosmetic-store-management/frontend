import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { CartPage } from "../../public/pages/CartPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title:   "Giỏ hàng",
    noindex: true, // Cart page không cần index
  });

export default function CartRoute() {
  return <CartPage />;
}
