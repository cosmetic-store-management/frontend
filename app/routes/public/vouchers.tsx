import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { VouchersPage } from "@/public/pages/VouchersPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "My Vouchers",
    description:
      "Save and use vouchers when shopping at GlowUp Cosmetics. Free shipping, percentage off, and more great deals.",
    keywords: "voucher codes, discount, promotions, GlowUp",
    canonical: "/vouchers",
  });

export default function Vouchers() {
  return <VouchersPage />;
}
