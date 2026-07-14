import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProductDetailPage } from "../../public/pages/ProductDetailPage";
import { queryClient } from "@/lib/queryClient";
import { QK } from "@/lib/queryKeys";
import { getProductBySlug } from "../../public/services/product.service";

/**
 * Pre-fetch dữ liệu sản phẩm trong lúc chuyển trang (Render-as-you-fetch).
 * Triệt tiêu hoàn toàn loading spinner khi trang load.
 */
export async function clientLoader({ params }: any) {
  const slug = params.slug;
  if (!slug) throw new Error("Product slug is required");

  // ensureQueryData sẽ lấy từ cache nếu có, nếu không sẽ fetch trước
  const product = await queryClient.ensureQueryData({
    queryKey: QK.product(slug),
    queryFn: () => getProductBySlug(slug),
    staleTime: 60 * 1000,
  });

  return product;
}

/**
 * Dynamic SEO: Lấy trực tiếp thông tin sản phẩm từ clientLoader
 * để tạo thẻ <title> và <meta description> chính xác tuyệt đối!
 */
export const meta: MetaFunction = ({ data }) => {
  const product = data as any;
  if (!product) {
    return buildMeta({
      title: "Product Not Found",
      description: "This product is unavailable or does not exist.",
    });
  }

  return buildMeta({
    title: product.name,
    description: `View details, reviews, and buy authentic ${product.name} products at GlowUp Cosmetics.`,
    keywords: `${product.name}, authentic cosmetics, GlowUp`,
  });
};

export default function ProductDetailRoute() {
  return <ProductDetailPage />;
}
