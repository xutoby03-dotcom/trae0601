import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
