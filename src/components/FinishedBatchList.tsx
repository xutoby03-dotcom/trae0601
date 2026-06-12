import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Thermometer,
  Package,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import type { Batch } from '@/types';
import { useBatchStore } from '@/store/batchStore';
import { formatDateTime, formatDuration, isToday } from '@/utils/time';

const colorGradeMap = {
  light: { label: '偏浅', emoji: '🌤️', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  good: { label: '刚好', emoji: '✨', color: 'bg-green-100 text-green-800 border-green-300' },
  dark: { label: '偏深', emoji: '🌰', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  burnt: { label: '烤焦', emoji: '🔥', color: 'bg-red-100 text-red-800 border-red-300' },
};

interface FinishedBatchItemProps {
  batch: Batch;
  ovenName: string;
}

function FinishedBatchItem({ batch, ovenName }: FinishedBatchItemProps) {
  const [expanded, setExpanded] = useState(false);
  const grade = batch.colorGrade ? colorGradeMap[batch.colorGrade] : null;

  return (
    <div
      className="border border-copper-100 rounded-xl overflow-hidden bg-white hover:border-copper-300 transition-colors"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        {batch.finishPhoto ? (
          <img
            src={batch.finishPhoto}
            alt={batch.productName}
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-copper-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-copper-100 flex items-center justify-center shrink-0 text-copper-400">
            <ImageIcon className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-espresso-800 truncate">{batch.productName}</h4>
            {grade && (
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${grade.color}`}
              >
                {grade.emoji} {grade.label}
              </span>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-espresso-500">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {ovenName} · 第{batch.layer}层
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              出炉 {batch.finishTime ? formatDateTime(batch.finishTime) : '--'}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {batch.quantity}个
            </span>
            {(batch.lossQuantity ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-danger font-medium">
                <AlertTriangle className="w-3 h-3" />
                报损 {batch.lossQuantity}个
              </span>
            )}
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-espresso-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-espresso-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-copper-100 bg-copper-50/50">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-espresso-500 mb-1">目标时长</div>
              <div className="font-semibold text-espresso-700">
                {Math.round(batch.targetDuration / 60)} 分钟
              </div>
            </div>
            <div>
              <div className="text-xs text-espresso-500 mb-1">实际时长</div>
              <div
                className={`font-semibold ${
                  (batch.actualDuration || 0) * 60 > batch.targetDuration
                    ? 'text-danger'
                    : 'text-success'
                }`}
              >
                {batch.actualDuration ? formatDuration(batch.actualDuration) : '--'}
              </div>
            </div>
            <div>
              <div className="text-xs text-espresso-500 mb-1">烘烤温度</div>
              <div className="font-semibold text-espresso-700 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-warn" />
                {batch.temperature}°C
              </div>
            </div>
          </div>

          {batch.lossReason && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 inline mr-1.5" />
              报损原因：{batch.lossReason}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-espresso-500 mb-1.5">
                <Camera className="w-3.5 h-3.5" />
                入炉照片
              </div>
              {batch.entryPhoto ? (
                <img
                  src={batch.entryPhoto}
                  alt="入炉"
                  className="w-full aspect-video object-cover rounded-lg border border-copper-200"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg border border-dashed border-copper-300 bg-copper-50 flex items-center justify-center text-espresso-400 text-sm">
                  暂无照片
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-espresso-500 mb-1.5">
                <Camera className="w-3.5 h-3.5" />
                出炉照片
              </div>
              {batch.finishPhoto ? (
                <img
                  src={batch.finishPhoto}
                  alt="出炉"
                  className="w-full aspect-video object-cover rounded-lg border border-copper-200"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg border border-dashed border-copper-300 bg-copper-50 flex items-center justify-center text-espresso-400 text-sm">
                  暂无照片
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinishedBatchList() {
  const { batches, ovens } = useBatchStore();

  const finished = batches
    .filter((b) => b.status === 'finished' && isToday(b.startTime))
    .sort((a, b) => (b.finishTime || '').localeCompare(a.finishTime || ''));

  const getOvenName = (id: string) => ovens.find((o) => o.id === id)?.name || '--';

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-espresso-500 to-espresso-700 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-espresso-800">出炉记录</h3>
            <p className="text-xs text-espresso-500">今日已完成的批次，点击查看详情</p>
          </div>
        </div>
        <span className="text-sm font-medium text-espresso-600 bg-copper-100 px-3 py-1 rounded-full">
          {finished.length} 批
        </span>
      </div>

      {finished.length > 0 ? (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {finished.map((batch) => (
            <FinishedBatchItem
              key={batch.id}
              batch={batch}
              ovenName={getOvenName(batch.ovenId)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-espresso-400">
          <div className="text-4xl mb-2">🍪</div>
          <div className="text-sm">今天还没有出炉的批次</div>
        </div>
      )}
    </div>
  );
}
