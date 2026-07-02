import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProductDetailPage } from "../../public/pages/ProductDetailPage";

/**
 * SEO cho product detail — title/desc lý tưởng nên lấy từ product data.
 * React Router v7 loader pattern là cách đúng, nhưng cần SSR.
 * Ở đây dùng meta mặc định; ProductDetailPage tự cập nhật document.title khi load.
 */
export const meta: MetaFunction = ({ params }) => {
  const slug = params.slug ?? "";
  const readableTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return buildMeta({
    title: readableTitle || "Product Details",
    description: `View details, reviews, and buy authentic ${readableTitle} products at GlowUp Cosmetics.`,
    keywords: `${readableTitle}, authentic cosmetics, GlowUp`,
  });
};

export default function ProductDetailRoute() {
  return <ProductDetailPage />;
}
