import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { AccountPage } from "../../public/pages/AccountPage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "My Account",
    noindex: true, // Profile page does not need indexing
  });

export default function AccountRoute() {
  return <AccountPage />;
}
