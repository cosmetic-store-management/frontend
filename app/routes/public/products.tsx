import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProductCatalogPage } from "../../public/pages/ProductCatalogPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Products",
    description:
      "Explore thousands of authentic cosmetics — skincare, makeup, haircare and body. Filter by category, brand and price.",
    keywords:
      "cosmetics, skincare, makeup, serum, moisturizer, lipstick, GlowUp",
    canonical: "/products",
  });

export default function ProductsRoute() {
  return <ProductCatalogPage />;
}
