import React, { useState } from 'react';
import { useTeaStore } from '@/store/useTeaStore';
import { DetectionResult, Severity, DetectionType } from '@/types';
import { AlertTriangle, Info, AlertCircle, ChevronUp, ChevronDown, Eye } from 'lucide-react';

const DetectionPanel: React.FC = () => {
  const { detections, selectItem } = useTeaStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />;
      case 'info':
        return <Info size={16} className="text-blue-500 flex-shrink-0" />;
    }
  };

  const getTypeLabel = (type: DetectionType): string => {
    const labels: Record<DetectionType, string> = {
      occlusion: '遮挡',
      distance: '距离',
      handConflict: '左右手',
      balance: '均衡',
    };
    return labels[type];
  };

  const getTypeColor = (type: DetectionType): string => {
    const colors: Record<DetectionType, string> = {
      occlusion: 'bg-red-100 text-red-700',
      distance: 'bg-amber-100 text-amber-700',
      handConflict: 'bg-purple-100 text-purple-700',
      balance: 'bg-blue-100 text-blue-700',
    };
    return colors[type];
  };

  const handleItemClick = (itemIds: string[]) => {
    if (itemIds.length > 0) {
      selectItem(itemIds[0]);
    }
  };

  const errorCount = detections.filter((d) => d.severity === 'error').length;
  const warningCount = detections.filter((d) => d.severity === 'warning').length;
  const infoCount = detections.filter((d) => d.severity === 'info').length;

  return (
    <div className="bg-white border-t border-stone-200">
      <div
        className="flex items-center justify-between px-4 py-2 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-stone-700">智能检测</span>
          <div className="flex items-center gap-2 text-xs">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                <AlertCircle size={12} />
                {errorCount} 个问题
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                <AlertTriangle size={12} />
                {warningCount} 个提醒
              </span>
            )}
            {infoCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                <Info size={12} />
                {infoCount} 条建议
              </span>
            )}
            {detections.length === 0 && (
              <span className="text-stone-400">暂无检测结果</span>
            )}
          </div>
        </div>
        <button className="text-stone-400 hover:text-stone-600 transition-colors">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-h-48 overflow-y-auto">
          {detections.length === 0 ? (
            <div className="px-4 py-6 text-center text-stone-400 text-sm">
              添加器物后将自动检测布局问题
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {detections.map((detection) => (
                <DetectionItem
                  key={detection.id}
                  detection={detection}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface DetectionItemProps {
  detection: DetectionResult;
  onItemClick: (itemIds: string[]) => void;
}

const DetectionItem: React.FC<DetectionItemProps> = ({ detection, onItemClick }) => {
  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />;
      case 'info':
        return <Info size={16} className="text-blue-500 flex-shrink-0" />;
    }
  };

  const getTypeLabel = (type: DetectionType): string => {
    const labels: Record<DetectionType, string> = {
      occlusion: '遮挡',
      distance: '距离',
      handConflict: '左右手',
      balance: '均衡',
    };
    return labels[type];
  };

  const getTypeColor = (type: DetectionType): string => {
    const colors: Record<DetectionType, string> = {
      occlusion: 'bg-red-100 text-red-700',
      distance: 'bg-amber-100 text-amber-700',
      handConflict: 'bg-purple-100 text-purple-700',
      balance: 'bg-blue-100 text-blue-700',
    };
    return colors[type];
  };

  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5 hover:bg-stone-50 cursor-pointer transition-colors"
      onClick={() => onItemClick(detection.relatedItemIds)}
    >
      {getSeverityIcon(detection.severity)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`px-1.5 py-0.5 text-xs rounded ${getTypeColor(detection.type)}`}
          >
            {getTypeLabel(detection.type)}
          </span>
        </div>
        <p className="text-sm text-stone-700">{detection.message}</p>
      </div>
      <button
        className="text-stone-400 hover:text-stone-600 transition-colors p-1"
        onClick={(e) => {
          e.stopPropagation();
          onItemClick(detection.relatedItemIds);
        }}
      >
        <Eye size={14} />
      </button>
    </div>
  );
};

export default DetectionPanel;
