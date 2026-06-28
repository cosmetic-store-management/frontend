import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { FlashSalePage } from "../../public/pages/FlashSalePage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Flash Sale - Săn Deal Khủng",
    description:
      "Săn deal mỹ phẩm giảm giá siêu hot mỗi ngày tại GlowUp. Hàng ngàn sản phẩm có giá cực sốc.",
    keywords: "flash sale, deal mỹ phẩm, giảm giá, khuyến mãi",
    canonical: "/flash-sale",
  });

export default function FlashSaleRoute() {
  return <FlashSalePage />;
}
