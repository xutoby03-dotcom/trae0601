import { QueueDisplay } from '../components/QueueDisplay';
import { ListOrdered } from 'lucide-react';

export function QueuePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ListOrdered className="w-6 h-6 text-cyan-600" />
          排号叫号管理
        </h1>
        <p className="text-slate-500 mt-1">顾客取号、叫号操作和排队队列管理</p>
      </div>
      <QueueDisplay />
    </div>
  );
}
