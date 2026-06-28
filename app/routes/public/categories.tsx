import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { CategoriesPage } from "../../public/pages/CategoriesPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Categories",
    description:
      "Browse products by category: Skincare, Makeup, Haircare, Fragrance and more.",
    keywords: "cosmetics categories, skincare, makeup, haircare, GlowUp",
    canonical: "/categories",
  });

export default function CategoriesRoute() {
  return <CategoriesPage />;
}
