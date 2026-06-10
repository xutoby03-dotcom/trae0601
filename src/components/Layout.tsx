import { ReactNode, useEffect } from 'react';
import { Navbar } from './Navbar';
import { usePetStore } from '@/store/usePetStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const initData = usePetStore((state) => state.initData);
  const loading = usePetStore((state) => state.loading);

  useEffect(() => {
    initData();
  }, [initData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}
