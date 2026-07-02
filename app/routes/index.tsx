import type { MetaFunction } from "react-router";
import HomePage from "../public/pages/HomePage";

export const meta: MetaFunction = () => {
  return [
    { title: "GlowUp Cosmetics - Authentic Cosmetics" },
    {
      name: "description",
      content: "Reveal your natural beauty with authentic cosmetics",
    },
  ];
};

export default function Index() {
  return <HomePage />;
}
