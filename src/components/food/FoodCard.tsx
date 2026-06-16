import { useState } from 'react';
import { Scissors, ChefHat, Trash2, Edit3, Package, Calendar, Receipt, Clock, Sparkles } from 'lucide-react';
import type { FoodItem, FoodStatus } from '@/types';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { DiscardModal } from './DiscardModal';
import { DeductModal } from './DeductModal';
import { FoodFormModal } from './FoodFormModal';
import { useFoodStore } from '@/store/useFoodStore';
import {
  getFoodStatus,
  getExpiryProgress,
  getCountdownText,
  getStatusLabel,
  getRemainingText,
  formatMoney,
} from '@/utils/food';
import { formatDateFull } from '@/utils/date';
import { STORAGE_ZONE_LABEL, STORAGE_ZONE_EMOJI } from '@/utils/constants';
import { clsx } from 'clsx';

interface FoodCardProps {
  food: FoodItem;
  onClick?: () => void;
  compact?: boolean;
  borderStyle?: 'accent' | 'status' | 'default';
}

const statusLeftBar: Record<FoodStatus, string> = {
  fresh: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-orange-500',
  expired: 'bg-red-500',
};

export function FoodCard({ food, onClick, compact, borderStyle = 'accent' }: FoodCardProps) {
  const status = getFoodStatus(food);
  const progress = getExpiryProgress(food);
  const countdown = getCountdownText(food);
  const [showDetail, setShowDetail] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [showDeduct, setShowDeduct] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const markOpened = useFoodStore((s) => s.markOpened);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
    else setShowDetail(true);
  };

  const handleOpen = () => {
    markOpened(food.id);
  };

  if (compact) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={clsx(
            'relative flex items-center gap-4 p-4 rounded-2xl border-l-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 bg-white',
            statusLeftBar[status]
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            {food.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 truncate">{food.name}</h3>
              {food.openedAt && <Badge variant="info" size="sm">已开封</Badge>}
              <Badge variant={status === 'expired' ? 'danger' : status === 'danger' ? 'warning' : status === 'warning' ? 'warning' : 'success'} size="sm" pulse={status === 'danger'}>
                {getStatusLabel(status)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {getRemainingText(food)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {countdown}
              </span>
            </div>
          </div>
        </div>
        <FoodDetailModal
          open={showDetail}
          onClose={() => setShowDetail(false)}
          food={food}
          onOpen={handleOpen}
          onDeduct={() => setShowDeduct(true)}
          onDiscard={() => setShowDiscard(true)}
          onEdit={() => setShowEdit(true)}
        />
        <DiscardModal open={showDiscard} onClose={() => setShowDiscard(false)} food={food} />
        <DeductModal open={showDeduct} onClose={() => setShowDeduct(false)} food={food} />
        <FoodFormModal open={showEdit} onClose={() => setShowEdit(false)} editFood={food} onSuccess={() => setShowEdit(false)} />
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={clsx(
          'relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300',
          'hover:shadow-xl hover:-translate-y-1 bg-white overflow-hidden group',
          borderStyle === 'accent' && status !== 'fresh'
            ? `border-l-4 ${status === 'expired' ? 'border-l-red-500 border-red-200 bg-red-50/30' : status === 'danger' ? 'border-l-orange-500 border-orange-200 bg-orange-50/30' : 'border-l-amber-500 border-amber-200 bg-amber-50/30'}`
            : 'border-slate-100 hover:border-emerald-200'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform">
              {food.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{food.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-400">{food.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">
                  {STORAGE_ZONE_EMOJI[food.zone]} {STORAGE_ZONE_LABEL[food.zone]}
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant={status === 'expired' ? 'danger' : status === 'danger' ? 'warning' : status === 'warning' ? 'warning' : 'success'}
            pulse={status === 'danger'}
          >
            {getStatusLabel(status)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Package className="w-4 h-4" />
              <span>剩余</span>
            </div>
            <span className="font-medium text-slate-700">{getRemainingText(food)}</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>保质期</span>
              </div>
              <span className={clsx(
                'text-sm font-semibold',
                status === 'expired' ? 'text-red-600' : status === 'danger' ? 'text-orange-600' : status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
              )}>
                {countdown}
              </span>
            </div>
            <ProgressBar value={progress} status={status} />
          </div>
        </div>

        {food.openedAt && (
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-orange-50 text-orange-700 text-xs">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>已开封，开封后倒计时中</span>
          </div>
        )}

        {(status === 'danger' || status === 'expired') && (
          <div className="absolute top-0 right-0 w-24 h-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br opacity-5 pointer-events-none"
               style={{ background: status === 'expired' ? '#ef4444' : '#f97316' }} />
        )}
      </div>

      <FoodDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        food={food}
        onOpen={handleOpen}
        onDeduct={() => setShowDeduct(true)}
        onDiscard={() => setShowDiscard(true)}
        onEdit={() => setShowEdit(true)}
      />
      <DiscardModal open={showDiscard} onClose={() => setShowDiscard(false)} food={food} />
      <DeductModal open={showDeduct} onClose={() => setShowDeduct(false)} food={food} />
      <FoodFormModal open={showEdit} onClose={() => setShowEdit(false)} editFood={food} onSuccess={() => setShowEdit(false)} />
    </>
  );
}

interface FoodDetailModalProps {
  open: boolean;
  onClose: () => void;
  food: FoodItem;
  onOpen: () => void;
  onDeduct: () => void;
  onDiscard: () => void;
  onEdit: () => void;
}

function FoodDetailModal({ open, onClose, food, onOpen, onDeduct, onDiscard, onEdit }: FoodDetailModalProps) {
  const status = getFoodStatus(food);
  const progress = getExpiryProgress(food);
  const countdown = getCountdownText(food);

  return (
    <Modal open={open} onClose={onClose} size="md" title={`${food.emoji} ${food.name}`}>
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-5xl flex-shrink-0">
            {food.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={status === 'expired' ? 'danger' : status === 'danger' ? 'warning' : status === 'warning' ? 'warning' : 'success'} pulse={status === 'danger'}>
                {getStatusLabel(status)}
              </Badge>
              <Badge variant="info">{food.category}</Badge>
              <Badge variant="purple">
                {STORAGE_ZONE_EMOJI[food.zone]} {STORAGE_ZONE_LABEL[food.zone]}
              </Badge>
              {food.openedAt && <Badge variant="warning">已开封</Badge>}
            </div>
            <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {countdown}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Package className="w-3.5 h-3.5" />
              库存数量
            </div>
            <p className="text-lg font-semibold text-slate-800">{getRemainingText(food)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Receipt className="w-3.5 h-3.5" />
              小票金额
            </div>
            <p className="text-lg font-semibold text-slate-800">{formatMoney(food.price)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              买入日期
            </div>
            <p className="text-sm font-semibold text-slate-800">{formatDateFull(food.purchaseDate)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {food.openedAt ? '开封日期' : '保质期至'}
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {food.openedAt ? formatDateFull(food.openedAt) : formatDateFull(food.expiryDate)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">保质期进度</span>
            <span className="text-sm font-semibold text-amber-600">{Math.round(100 - progress)}% 剩余</span>
          </div>
          <ProgressBar value={progress} status={status} />
        </div>

        {food.notes && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1.5">📝 备注</p>
            <p className="text-sm text-slate-700">{food.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 pt-2">
          {!food.openedAt ? (
            <button
              onClick={onOpen}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all hover:-translate-y-0.5 border border-orange-100"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-orange-700">开封</span>
            </button>
          ) : (
            <button
              disabled
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 opacity-60 border border-slate-100"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-300 text-white flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-500">已开封</span>
            </button>
          )}
          <button
            onClick={onDeduct}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all hover:-translate-y-0.5 border border-emerald-100"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-700">做饭扣减</span>
          </button>
          <button
            onClick={onEdit}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 transition-all hover:-translate-y-0.5 border border-sky-100"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-sky-700">编辑</span>
          </button>
          <button
            onClick={onDiscard}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 transition-all hover:-translate-y-0.5 border border-red-100"
          >
            <div className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-red-700">丢弃</span>
          </button>
        </div>

        <Button variant="secondary" onClick={onClose} fullWidth>
          关闭
        </Button>
      </div>
    </Modal>
  );
}
