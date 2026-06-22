import {
  List,
  Clock,
  Square,
  ArrowUpRight,
  Type,
  Trash2,
  Tag,
} from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import type { Annotation } from '@/types';
import { ERROR_TYPE_LABELS } from '@/types';
import { formatTimestamp } from '@/utils';

const typeIcons = {
  rect: Square,
  arrow: ArrowUpRight,
  text: Type,
};

export default function AnnotationList() {
  const {
    annotations,
    selectedAnnotationId,
    setSelectedAnnotation,
    deleteAnnotation,
    updateAnnotation,
  } = usePracticeStore();

  const sortedAnnotations = [...annotations].sort((a, b) => a.timestamp - b.timestamp);

  const groupedByErrorType = sortedAnnotations.reduce((acc, ann) => {
    const key = ann.errorType || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ann);
    return acc;
  }, {} as Record<string, Annotation[]>);

  return (
    <div className="card p-4 h-full flex flex-col">
      <h2 className="section-title">
        <List className="w-5 h-5 text-primary-600" />
        批注列表
        <span className="ml-auto text-xs font-normal text-gray-400">
          {annotations.length} 条
        </span>
      </h2>

      {sortedAnnotations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
          <List className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">暂无批注</p>
          <p className="text-xs mt-1">在视频画面上使用工具添加标注</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
          {Object.entries(groupedByErrorType).map(([errorType, anns]) => (
            <div key={errorType}>
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <Tag className="w-3 h-3 text-primary-500" />
                <span className="text-xs font-bold text-primary-700">
                  {ERROR_TYPE_LABELS[errorType as keyof typeof ERROR_TYPE_LABELS] || '其他'}
                </span>
                <span className="text-xs text-gray-400">({anns.length})</span>
              </div>
              <div className="space-y-1.5">
                {anns.map((ann) => {
                  const TypeIcon = typeIcons[ann.type] || Square;
                  const isSelected = selectedAnnotationId === ann.id;

                  return (
                    <div
                      key={ann.id}
                      onClick={() => setSelectedAnnotation(isSelected ? null : ann.id)}
                      className={`group p-2.5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50/60'
                          : 'border-transparent bg-gray-50/80 hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: ann.color + '20' }}
                        >
                          <TypeIcon
                            className="w-3.5 h-3.5"
                            style={{ color: ann.color }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-mono font-medium"
                              style={{ color: ann.color }}
                            >
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(ann.timestamp)}
                            </span>
                            {ann.type === 'text' && ann.text && (
                              <span className="text-xs text-gray-700 font-medium truncate">
                                "{ann.text}"
                              </span>
                            )}
                          </div>

                          {ann.type === 'rect' && (
                            <div className="text-xs text-gray-500">
                              框选区域 ({(ann.width! * 100).toFixed(0)}% × {(ann.height! * 100).toFixed(0)}%)
                            </div>
                          )}
                          {ann.type === 'arrow' && (
                            <div className="text-xs text-gray-500">
                              箭头指示
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('确定删除此批注？')) {
                              deleteAnnotation(ann.id);
                            }
                          }}
                          className="p-1 text-gray-300 hover:text-accent-red hover:bg-accent-red/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isSelected && ann.text && (
                        <div className="mt-2 pt-2 border-t border-gray-200/60">
                          <input
                            type="text"
                            value={ann.text}
                            onChange={(e) =>
                              updateAnnotation(ann.id, { text: e.target.value })
                            }
                            className="w-full text-sm px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedAnnotations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          {(['handShape', 'orientation', 'trajectory', 'expression'] as const).map((type) => {
            const count = groupedByErrorType[type]?.length || 0;
            if (count === 0) return null;
            return (
              <div
                key={type}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5"
              >
                <span className="text-gray-500">{ERROR_TYPE_LABELS[type]}</span>
                <span className="font-bold text-primary-600">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
