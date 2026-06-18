import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { FeedbackForm } from '@/components/FeedbackForm';

export default function FeedbackSubmit() {
  const [searchParams] = useSearchParams();
  const seatId = searchParams.get('seatId') || '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-teal-800 to-teal-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            to="/"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-lg font-bold">提交噪音反馈</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fadeIn">
          <FeedbackForm seatId={seatId} />
        </div>
      </main>
    </div>
  );
}
