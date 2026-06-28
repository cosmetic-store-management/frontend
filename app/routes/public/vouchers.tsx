import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { VouchersPage } from "@/public/pages/VouchersPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Kho mã giảm giá",
    description:
      "Lưu và sử dụng mã giảm giá khi mua sắm tại GlowUp Cosmetics. Freeship, giảm phần trăm và nhiều ưu đãi hấp dẫn.",
    keywords: "mã giảm giá, voucher, khuyến mãi, GlowUp",
    canonical: "/vouchers",
  });

export default function Vouchers() {
  return <VouchersPage />;
}
