import {
  Phone,
  Tag,
  Camera,
  ArrowRight,
  User,
  GraduationCap,
  Shirt,
} from 'lucide-react';
import type { ExchangeRequest } from '@/types';
import { CLOTHING_TYPE_LABELS } from '@/types';
import { TagStatusBadge, RequestStatusBadge } from './StatusBadge';

interface ExchangeRequestCardProps {
  request: ExchangeRequest;
  onConfirm: (request: ExchangeRequest) => void;
  onMarkManual: (request: ExchangeRequest) => void;
}

export default function ExchangeRequestCard({
  request,
  onConfirm,
  onMarkManual,
}: ExchangeRequestCardProps) {
  const isTagIntact = request.tagStatus === 'intact';
  const isPending = request.status === 'pending';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        !isTagIntact && isPending
          ? 'border-orange-300 ring-1 ring-orange-100'
          : 'border-slate-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
              {request.studentName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">
                {request.studentName}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <GraduationCap className="w-3 h-3" />
                {request.className}
              </div>
            </div>
          </div>
          <RequestStatusBadge status={request.status} />
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500 mb-1">原尺码</div>
              <div className="text-xl font-bold text-slate-700">
                {request.originalSize}
              </div>
            </div>
            <div className="flex items-center justify-center px-2">
              <ArrowRight className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-center flex-1">
              <div className="text-xs text-slate-500 mb-1">想换尺码</div>
              <div className="text-xl font-bold text-blue-600">
                {request.targetSize}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Shirt className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {CLOTHING_TYPE_LABELS[request.clothingType]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <TagStatusBadge status={request.tagStatus} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{request.phone}</span>
          </div>
          {request.photoUrl && (
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-blue-500 cursor-pointer hover:underline">
                查看拍照凭证
              </span>
            </div>
          )}
        </div>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onConfirm(request)}
              disabled={!isTagIntact}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isTagIntact
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isTagIntact ? '确认调换' : '吊牌不完整'}
            </button>
            {!isTagIntact && (
              <button
                onClick={() => onMarkManual(request)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-all duration-200 active:scale-[0.98]"
              >
                登记人工处理
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
