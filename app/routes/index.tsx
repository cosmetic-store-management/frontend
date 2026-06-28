import type { MetaFunction } from "react-router";
import HomePage from "../public/pages/HomePage";

export const meta: MetaFunction = () => {
  return [
    { title: "GlowUp Cosmetics - Mỹ phẩm chính hãng" },
    {
      name: "description",
      content: "Đánh thức vẻ đẹp tự nhiên của bạn với mỹ phẩm chính hãng",
    },
  ];
};

export default function Index() {
  return <HomePage />;
}
