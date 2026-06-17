import React, { useState } from 'react';
import { MapPin, Calendar, Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Umbrella } from '@/types';
import { StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { formatRelativeTime, getDaysUntilExpiry, isExpiringSoon } from '@/utils/dateUtils';
import { STORAGE_PERIOD_DAYS } from '@/utils/constants';

interface UmbrellaCardProps {
  umbrella: Umbrella;
  onClaim?: () => void;
  showActions?: boolean;
  onView?: () => void;
}

export const UmbrellaCard: React.FC<UmbrellaCardProps> = ({
  umbrella,
  onClaim,
  showActions = true,
  onView,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const daysLeft = getDaysUntilExpiry(umbrella.foundTime, umbrella.storagePeriodDays);
  const isExpiring = isExpiringSoon(umbrella.foundTime, umbrella.storagePeriodDays);

  return (
    <>
      <div
        className={`
          group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
          transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5
          cursor-pointer
          ${isExpiring && umbrella.status === 'pending' ? 'ring-2 ring-red-400/50' : ''}
        `}
        onClick={() => onView ? onView() : setShowDetail(true)}
        style={{ animationDelay: `${Math.random() * 0.3}s` }}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={umbrella.canopyPhoto}
            alt={umbrella.color}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <StatusBadge status={umbrella.status} />
          </div>
          <div className="absolute top-3 right-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: umbrella.colorHex }}
              title={umbrella.color}
            />
          </div>
          {isExpiring && umbrella.status === 'pending' && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-1.5 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4" />
                {daysLeft > 0 ? `${daysLeft}天后到期` : '今日到期'}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">
              {umbrella.color}伞 · {umbrella.brand}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {umbrella.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4A90D9]" />
              <span className="truncate">
                {umbrella.foundLocation.building} {umbrella.foundLocation.area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4A90D9]" />
              <span>{formatRelativeTime(umbrella.foundTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#4A90D9]" />
              <span>存放格：{umbrella.storageCell}</span>
            </div>
          </div>

          {showActions && umbrella.status === 'pending' && (
            <Button
              className="w-full mt-4"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.();
              }}
            >
              申请认领
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="雨伞详情"
        size="lg"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">伞面照片</p>
                <img
                  src={umbrella.canopyPhoto}
                  alt="伞面"
                  className="w-full aspect-square object-cover rounded-xl"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">伞柄照片</p>
                <img
                  src={umbrella.handlePhoto}
                  alt="伞柄"
                  className="w-full aspect-square object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: umbrella.colorHex }}
                />
                <span className="font-medium">{umbrella.color}</span>
                <span className="text-gray-400">|</span>
                <span>{umbrella.brand}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {umbrella.features.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-gray-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{umbrella.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#4A90D9]/5 rounded-xl space-y-3">
              <h4 className="font-semibold text-[#4A90D9] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                拾获信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">拾获地点</span>
                  <span className="font-medium">
                    {umbrella.foundLocation.building} {umbrella.foundLocation.area}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">拾获时间</span>
                  <span className="font-medium">{formatRelativeTime(umbrella.foundTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">存放位置</span>
                  <span className="font-medium">{umbrella.storageCell}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl space-y-3">
              <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                保管期限
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">保管期</span>
                  <span className="font-medium">{STORAGE_PERIOD_DAYS}天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">剩余天数</span>
                  <span
                    className={`font-medium ${
                      daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-emerald-600'
                    }`}
                  >
                    {daysLeft > 0 ? `${daysLeft}天` : '已到期'}
                  </span>
                </div>
              </div>
            </div>

            {showActions && umbrella.status === 'pending' && (
              <Button className="w-full" size="lg" onClick={onClaim}>
                <CheckCircle className="w-5 h-5 mr-2" />
                申请认领
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
