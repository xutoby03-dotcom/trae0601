import { MessageSquare } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import TraceChain from '@/components/feedback/TraceChain';

export default function Feedback() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-broth-800 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-fire-500" />
          顾客反馈与追溯
        </h1>
        <p className="text-broth-500 mt-1">录入反馈信息并追溯对应熬制批次</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FeedbackForm />
        </div>
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-broth-800">反馈追溯链</h2>
          </div>
          <TraceChain />
        </div>
      </div>
    </div>
  );
}
