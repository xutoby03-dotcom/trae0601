import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const releaseExpiredReservations = useStore((state) => state.releaseExpiredReservations);

  useEffect(() => {
    releaseExpiredReservations();
    const interval = setInterval(releaseExpiredReservations, 60000);
    return () => clearInterval(interval);
  }, [releaseExpiredReservations]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-0 bg-grid-pattern bg-[size:24px_24px] pointer-events-none opacity-50" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 relative">
        {children}
      </main>
    </div>
  );
}
