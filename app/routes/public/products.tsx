import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProductCatalogPage } from "../../public/pages/ProductCatalogPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Sản phẩm",
    description:
      "Khám phá hàng ngàn mỹ phẩm chính hãng — skincare, makeup, chăm sóc tóc và cơ thể. Lọc theo danh mục, thương hiệu và giá.",
    keywords: "mỹ phẩm, skincare, makeup, serum, kem dưỡng, son môi, GlowUp",
    canonical: "/products",
  });

export default function ProductsRoute() {
  return <ProductCatalogPage />;
}
