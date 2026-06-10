import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Droplets, Ruler, WashingMachine, FileText, Image as ImageIcon } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { CATEGORY_LABELS, GROUP_LABELS } from '@/types';
import { formatDateChinese, getDaysUntilNextClean, getNextCleanDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItemById, getPlansByItemId, getItemStatusGroup } = useCleaningStore();

  const item = id ? getItemById(id) : undefined;
  const plans = id ? getPlansByItemId(id) : [];
  const statusGroup = item ? getItemStatusGroup(item) : 'completed';

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">物品不存在</p>
          <Link to="/items" className="text-blue-600 text-sm mt-2 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntilNextClean(item.lastCleanDate, item.suggestedCycleDays);

  const statusColor: Record<string, string> = {
    needClean: 'bg-red-100 text-red-600',
    scheduled: 'bg-blue-100 text-blue-600',
    drying: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-green-100 text-green-600',
  };

  const activePlan = plans.find((p) => p.status !== 'completed');
  const completedPlans = plans.filter((p) => p.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">物品详情</h1>
          <Link to={`/items/${item.id}/edit`} className="p-1 -mr-1">
            <Edit className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.room}</p>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              statusColor[statusGroup]
            )}>
              {GROUP_LABELS[statusGroup]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">类型</p>
                <p className="text-sm font-medium text-gray-900">
                  {CATEGORY_LABELS[item.category]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Ruler className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">材质</p>
                <p className="text-sm font-medium text-gray-900">
                  {item.material || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <WashingMachine className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">可机洗</p>
                <p className="text-sm font-medium text-gray-900">
                  {item.canMachineWash ? '是' : '否'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">清洗周期</p>
                <p className="text-sm font-medium text-gray-900">
                  {item.suggestedCycleDays} 天
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <h3 className="font-semibold text-gray-900 mb-3">清洗状态</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">上次清洗</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDateChinese(item.lastCleanDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">下次建议清洗</span>
              <span className={cn(
                'text-sm font-medium',
                daysUntil <= 7 ? 'text-red-600' : 'text-gray-900'
              )}>
                {formatDateChinese(getNextCleanDate(item.lastCleanDate, item.suggestedCycleDays))}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {daysUntil < 0
                  ? `已逾期 ${Math.abs(daysUntil)} 天，建议尽快清洗`
                  : daysUntil === 0
                    ? '今天就该清洗了'
                    : `还有 ${daysUntil} 天需要清洗`}
              </p>
            </div>
          </div>
        </div>

        {item.photos.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">清洗照片</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {item.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`照片${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {item.notes && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">注意事项</h3>
            </div>
            <p className="text-sm text-gray-600">{item.notes}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">清洗历史</h3>
            <span className="text-sm text-gray-500">共 {completedPlans.length} 次</span>
          </div>
          {completedPlans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">暂无清洗记录</p>
          ) : (
            <div className="space-y-3">
              {completedPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="block p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {plan.endDate && formatDateChinese(plan.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        花费 ¥{plan.cost}
                      </p>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      已完成
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!activePlan && (
          <Link
            to={`/plans/new/${item.id}`}
            className="flex items-center justify-center gap-2 w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建清洗计划
          </Link>
        )}

        {activePlan && (
          <Link
            to={`/plans/${activePlan.id}`}
            className="flex items-center justify-center gap-2 w-full mt-6 bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            查看进行中的清洗计划
          </Link>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
