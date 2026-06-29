import { Outlet } from "react-router";
import Header from "../../public/layout/Header";
import Footer from "../../public/layout/Footer";
import { SlideOutCart } from "@/public/components/cart/SlideOutCart";

export default function AuthLayout() {
  return (
    <div className="public-theme min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full relative flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <SlideOutCart />
    </div>
  );
}
