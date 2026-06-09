import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, Plus, Volume2 } from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { NOISE_TYPE_LABELS, STATUS_LABELS, type ComplaintStatus, type NoiseType } from '@/types';

const STATUS_TABS: ComplaintStatus[] = ['ongoing', 'pending', 'resolved', 'recurring'];

const NOISE_TYPE_BORDER_COLORS: Record<NoiseType, string> = {
  renovation: 'border-amber-500',
  singing: 'border-purple-500',
  speaker: 'border-rose-500',
  pet: 'border-sky-500',
  other: 'border-slate-500',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<ComplaintStatus>('ongoing');
  const complaints = useComplaintStore((s) => s.complaints);

  const filtered = complaints.filter((c) => c.status === activeTab);

  const countByStatus = (status: ComplaintStatus) =>
    complaints.filter((c) => c.status === status).length;

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className="flex-1 relative py-3 text-sm text-center"
            >
              <span className={activeTab === status ? 'text-teal-600 font-medium' : 'text-gray-500'}>
                {STATUS_LABELS[status]}
              </span>
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs bg-gray-100 text-gray-500">
                {countByStatus(status)}
              </span>
              {activeTab === status && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Volume2 className="w-12 h-12 mb-3" />
            <p className="text-sm">当前暂无{STATUS_LABELS[activeTab]}的投诉</p>
          </div>
        ) : (
          filtered.map((complaint) => (
            <Link
              key={complaint.id}
              to={`/complaint/${complaint.id}`}
              className={`block bg-white rounded-xl shadow-sm p-4 mb-3 hover:shadow-md transition cursor-pointer border-l-[3px] ${NOISE_TYPE_BORDER_COLORS[complaint.noiseType]}`}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{NOISE_TYPE_LABELS[complaint.noiseType]}</span>
                    {complaint.affectsRest && (
                      <span className="text-xs text-rose-500 font-medium">影响休息</span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{complaint.location}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{new Date(complaint.noiseTime).toLocaleString('zh-CN')}</span>
                    <span>{complaint.durationMinutes}分钟</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    {complaint.seconds.length}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link
        to="/complaint/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
