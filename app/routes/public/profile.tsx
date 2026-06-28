import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProfilePage } from "../../public/pages/ProfilePage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "My Account",
    noindex: true, // Profile page does not need indexing
  });

export default function ProfileRoute() {
  return <ProfilePage />;
}
