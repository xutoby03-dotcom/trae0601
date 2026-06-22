import { useRef } from 'react';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';

export default function Home() {
  const topRef = useRef<HTMLDivElement>(null);

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      ref={topRef}
      className="relative z-10 min-h-screen flex flex-col bg-transparent"
    >
      <Header scrollToTop={scrollToTop} />
      <main className="flex-1 flex flex-col min-h-0 max-w-[1800px] w-full mx-auto">
        <KanbanBoard />
      </main>
      <footer className="relative z-10 border-t border-gold-600/10 py-3 px-6 text-center">
        <p className="text-[10px] font-mono text-ink-600 tracking-widest">
          GOLDSMITH ATELIER · WAX MOLD TRACKING v1.0 · 以匠心铸每一件珠宝
        </p>
      </footer>
    </div>
  );
}
