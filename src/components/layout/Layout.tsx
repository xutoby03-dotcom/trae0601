import { Outlet } from 'react-router-dom';
import Header from './Header';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-6 md:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-wood-200 py-6 bg-paper-100/80">
        <div className="container text-center">
          <p className="text-sm text-wood-500 font-serif">
            漂流书柜 · 让每一本好书遇到对的人
          </p>
          <p className="text-xs text-wood-400 mt-1">
            登记 · 借阅 · 分享 · 传递书香
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
