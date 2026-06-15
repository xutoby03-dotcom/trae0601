import { PropsWithChildren } from 'react';
import Navbar from './Navbar';

export default function Container({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-coffee-500">
        手冲刻度笔记 · 让每一杯都恰到好处
      </footer>
    </div>
  );
}
