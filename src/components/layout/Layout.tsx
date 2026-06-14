import { ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useInspectionStore } from '@/store/inspectionStore';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const initialize = useInspectionStore((state) => state.initialize);
  const isInitialized = useInspectionStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
