import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { CategoriesPage } from "../../public/pages/CategoriesPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title:       "Danh mục sản phẩm",
    description: "Duyệt sản phẩm theo danh mục: Chăm sóc da, Trang điểm, Chăm sóc tóc, Nước hoa và nhiều hơn nữa.",
    keywords:    "danh mục mỹ phẩm, skincare, trang điểm, chăm sóc tóc, GlowUp",
    canonical:   "/categories",
  });

export default function CategoriesRoute() {
  return <CategoriesPage />;
}
