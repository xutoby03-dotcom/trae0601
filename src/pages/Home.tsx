import SessionSelector from '@/components/SessionSelector';
import EnvelopeTable from '@/components/EnvelopeTable';
import AnalysisPanel from '@/components/AnalysisPanel';
import { FileSearch } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <header className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-ink-800 flex items-center justify-center shadow-stamp border-2 border-ink-900">
            <FileSearch className="w-6 h-6 text-parchment-100" />
          </div>
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-black text-ink-800 tracking-wide">
              线索封套复盘档案
            </h1>
            <p className="text-sm text-ink-700 mt-0.5">
              Envelope Review System · 追踪每一条线索的完整旅程
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-[calc(100vh-140px)]">
        <div className="lg:col-span-3 h-full min-h-[300px]">
          <SessionSelector />
        </div>
        <div className="lg:col-span-6 h-full min-h-[400px]">
          <EnvelopeTable />
        </div>
        <div className="lg:col-span-3 h-full min-h-[300px]">
          <AnalysisPanel />
        </div>
      </div>
    </div>
  );
}
