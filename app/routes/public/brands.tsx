import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import BrandsPage from "@/public/pages/BrandsPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Thương hiệu",
    description:
      "Khám phá các thương hiệu mỹ phẩm hàng đầu tại GlowUp: L'Oréal, Innisfree, Cetaphil, Romand, Some By Mi và nhiều thương hiệu nổi tiếng khác.",
    keywords:
      "thương hiệu mỹ phẩm, Innisfree, Cetaphil, Romand, L'Oréal, GlowUp",
    canonical: "/brands",
  });

export default function Brands() {
  return <BrandsPage />;
}
