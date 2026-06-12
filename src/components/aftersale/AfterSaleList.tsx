import { AfterSale, Material } from '@/types';
import {
  getAfterSaleTypeText,
  getAfterSaleTypeColor,
  getSeverityColor,
  getAfterSaleStatusText,
  getAfterSaleStatusColor,
  formatDate,
} from '@/utils/helpers';
import Badge from '../common/Badge';
import { Clock, User, FileText, AlertTriangle } from 'lucide-react';

interface AfterSaleListProps {
  afterSales: AfterSale[];
  materials?: Material[];
  showMaterial?: boolean;
  onAfterSaleClick?: (afterSale: AfterSale) => void;
}

const AfterSaleList = ({
  afterSales,
  materials = [],
  showMaterial = true,
  onAfterSaleClick,
}: AfterSaleListProps) => {
  if (afterSales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">暂无售后工单</p>
      </div>
    );
  }

  const getMaterialName = (materialId: string): string => {
    const material = materials.find((m) => m.id === materialId);
    return material?.name || '未知材料';
  };

  const sortedAfterSales = [...afterSales].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedAfterSales.map((afterSale) => (
        <div
          key={afterSale.id}
          onClick={() => onAfterSaleClick?.(afterSale)}
          className={`p-4 bg-white rounded-xl border border-gray-200 transition-all duration-200 ${
            onAfterSaleClick
              ? 'cursor-pointer hover:shadow-md hover:border-gray-300'
              : ''
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge className={getAfterSaleTypeColor(afterSale.type)} size="sm">
                {getAfterSaleTypeText(afterSale.type)}
              </Badge>
              <Badge className={getSeverityColor(afterSale.severity)} size="sm">
                {afterSale.severity === 'low'
                  ? '轻微'
                  : afterSale.severity === 'medium'
                  ? '中等'
                  : '严重'}
              </Badge>
            </div>
            <Badge className={getAfterSaleStatusColor(afterSale.status)} size="sm">
              {getAfterSaleStatusText(afterSale.status)}
            </Badge>
          </div>

          {showMaterial && (
            <p className="font-medium text-gray-900 text-sm mb-2">
              {getMaterialName(afterSale.materialId)}
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {afterSale.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(afterSale.createdAt)}</span>
              </div>
              {afterSale.handler && (
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{afterSale.handler}</span>
                </div>
              )}
            </div>
          </div>

          {afterSale.solution && afterSale.status === 'resolved' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium mb-1">解决方案</p>
                  <p className="text-sm text-gray-600">{afterSale.solution}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AfterSaleList;
