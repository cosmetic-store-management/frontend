import { Outlet } from 'react-router';
import PublicHeader from './Header';
import PublicFooter from './Footer';
import { SlideOutCart } from '@/public/components/SlideOutCart';

export function PublicLayout() {
  return (
    <div className="public-theme min-h-screen bg-slate-100 flex flex-col font-sans text-ink">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <PublicFooter />
      <SlideOutCart />
    </div>
  );
}
