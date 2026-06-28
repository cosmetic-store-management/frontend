import type { MetaFunction } from "react-router";
import { buildMeta } from "@/lib/seo";
import { ProfilePage } from "../../public/pages/ProfilePage";

export const meta: MetaFunction = () =>
  buildMeta({
    title: "Tài khoản của tôi",
    noindex: true, // Profile page không cần index
  });

export default function ProfileRoute() {
  return <ProfilePage />;
}
