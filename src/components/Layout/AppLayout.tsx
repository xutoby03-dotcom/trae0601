import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-teal-50">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 0%, rgba(34, 160, 107, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 100%, rgba(15, 118, 110, 0.12) 0%, transparent 50%)
          `,
        }}
      />
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="relative mt-16 py-6 border-t border-emerald-100/60">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-emerald-700/60">
          💊 老人药盒管家 · 守护家人每一次服药安全
        </div>
      </footer>
    </div>
  );
}
