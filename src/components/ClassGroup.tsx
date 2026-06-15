import { useState } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { ExchangeRequest } from '@/types';
import ExchangeRequestCard from './ExchangeRequestCard';

interface ClassGroupProps {
  className: string;
  requests: ExchangeRequest[];
  onConfirm: (request: ExchangeRequest) => void;
  onMarkManual: (request: ExchangeRequest) => void;
  defaultOpen?: boolean;
}

export default function ClassGroup({
  className,
  requests,
  onConfirm,
  onMarkManual,
  defaultOpen = true,
}: ClassGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const manualCount = requests.filter((r) => r.status === 'manual').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-800">{className}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>共 {requests.length} 条需求</span>
              {pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {pendingCount} 待处理
                </span>
              )}
              {manualCount > 0 && (
                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                  {manualCount} 待人工
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((request) => (
              <ExchangeRequestCard
                key={request.id}
                request={request}
                onConfirm={onConfirm}
                onMarkManual={onMarkManual}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
