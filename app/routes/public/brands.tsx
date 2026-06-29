import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import BrandsPage from "@/public/pages/BrandsPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Brands",
    description:
      "Discover top cosmetics brands at GlowUp: L'Oréal, Innisfree, Cetaphil, Romand, Some By Mi and many more.",
    keywords: "cosmetics brands, Innisfree, Cetaphil, Romand, L'Oréal, GlowUp",
    canonical: "/brands",
  });

export default function Brands() {
  return <BrandsPage />;
}
