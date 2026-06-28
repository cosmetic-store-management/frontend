import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { FlashSalePage } from "../../public/pages/FlashSalePage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Flash Sale - Best Deals Today",
    description:
      "Shop hot cosmetics deals every day at GlowUp. Thousands of products at amazing prices.",
    keywords: "flash sale, cosmetics deals, discount, promotions",
    canonical: "/flash-sale",
  });

export default function FlashSaleRoute() {
  return <FlashSalePage />;
}
