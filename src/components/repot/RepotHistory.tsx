import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Ruler,
  Scissors,
  Bug,
  Droplets,
  Flower2,
  Layers,
  Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { usePlantStore } from '../../store/plantStore';
import type { RepotRecord } from '../../types';

interface RepotHistoryProps {
  records: RepotRecord[];
}

export default function RepotHistory({ records }: RepotHistoryProps) {
  const getSoilMixById = usePlantStore((s) => s.getSoilMixById);
  const [expandedId, setExpandedId] = useState<string | null>(records[0]?.id || null);

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-forest-400 text-sm">
        暂无换盆记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const isExpanded = expandedId === record.id;
        const soilMix = getSoilMixById(record.soilMixId);

        return (
          <div key={record.id} className="card overflow-hidden animate-slide-up">
            <button
              onClick={() => setExpandedId(isExpanded ? null : record.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-clay-100 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-clay-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-forest-800">
                    {format(parseISO(record.date), 'yyyy年M月d日', { locale: zhCN })} 换盆
                  </p>
                  <p className="text-xs text-forest-500">
                    新盆 {record.newPotDiameterCm}cm · {soilMix?.name || '未知土壤'}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-forest-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-forest-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-cream-200 pt-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Ruler className="w-3 h-3" />
                      新盆尺寸
                    </div>
                    <p className="font-medium text-forest-800">{record.newPotDiameterCm} cm</p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Scissors className="w-3 h-3" />
                      是否修根
                    </div>
                    <p className="font-medium text-forest-800">
                      {record.rootPruned ? '已修根' : '未修根'}
                    </p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Droplets className="w-3 h-3" />
                      根系状态
                    </div>
                    <p className="font-medium text-forest-800">{record.rootCondition}</p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Flower2 className="w-3 h-3" />
                      底肥
                    </div>
                    <p className="font-medium text-forest-800">
                      {record.baseFertilizer || '无'}
                    </p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Bug className="w-3 h-3" />
                      虫害情况
                    </div>
                    <p className="font-medium text-forest-800">
                      {record.hadPests ? `有 (${record.pestType || '未说明'})` : '无'}
                    </p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Droplets className="w-3 h-3" />
                      烂根情况
                    </div>
                    <p className={`font-medium ${record.hadRootRot ? 'text-clay-700' : 'text-forest-800'}`}>
                      {record.hadRootRot ? '发现烂根' : '无烂根'}
                    </p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl md:col-span-2">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Layers className="w-3 h-3" />
                      土壤配比
                    </div>
                    <p className="font-medium text-forest-800">
                      {soilMix
                        ? `${soilMix.name}（颗粒${soilMix.granularRatio}% / 营养${soilMix.nutrientRatio}% / 珍珠岩${soilMix.perliteRatio}%${soilMix.otherIngredients ? ` / ${soilMix.otherIngredients}` : ''}）`
                        : '未记录'}
                    </p>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-forest-500 mb-1">
                      <Clock className="w-3 h-3" />
                      缓苗结束
                    </div>
                    <p className="font-medium text-forest-800">{record.recoveryEndDate}</p>
                  </div>
                </div>

                {record.notes && (
                  <div className="p-3 bg-leaf-50 rounded-xl border border-leaf-100">
                    <p className="text-xs text-leaf-600 font-medium mb-1">备注</p>
                    <p className="text-sm text-forest-700">{record.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
