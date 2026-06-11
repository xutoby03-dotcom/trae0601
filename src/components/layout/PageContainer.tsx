import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}
