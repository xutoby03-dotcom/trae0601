import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Clock, CheckCircle, Inbox } from 'lucide-react';
import { AdminList } from '@/components/AdminList';
import { useFeedbackStore } from '@/store/useFeedbackStore';

export default function AdminPanel() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const { feedbacks } = useFeedbackStore();

  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;
  const totalCount = feedbacks.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <h1 className="text-lg font-bold">管理员面板</h1>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium transition-colors"
          >
            查看统计看板
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">{pendingCount}</div>
                <div className="text-sm text-slate-500">待处理反馈</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800">{totalCount}</div>
                <div className="text-sm text-slate-500">累计反馈</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTab('pending')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                tab === 'pending'
                  ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              待处理
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                tab === 'all'
                  ? 'text-teal-700 border-b-2 border-teal-700 bg-teal-50'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              全部记录
            </button>
          </div>
          <div className="p-4">
            <AdminList statusFilter={tab} />
          </div>
        </div>
      </main>
    </div>
  );
}
