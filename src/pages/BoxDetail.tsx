import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Droplets, Shirt, Edit, Trash2, 
  Package, Calendar, Plus, ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ClothingCard from '@/components/shared/ClothingCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useStore } from '@/store/useStore';
import { formatDate, formatDateFriendly, isMoisturePackExpired, isMoisturePackExpiringSoon, getDaysUntilExpiry } from '@/utils/date';
import { getBoxOccupancyRate } from '@/utils/helpers';

export default function BoxDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boxes = useStore((state) => state.boxes);
  const clothes = useStore((state) => state.clothes);
  const deleteBox = useStore((state) => state.deleteBox);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const box = useMemo(() => boxes.find(b => b.id === id), [boxes, id]);
  const boxClothes = useMemo(() => 
    clothes.filter(c => c.boxId === id && c.status === 'in_box'),
    [clothes, id]
  );

  if (!box) {
    return (
      <Layout title="箱子详情" showBack>
        <EmptyState
          icon={Package}
          title="箱子不存在"
          description="这个箱子可能已经被删除了"
        />
      </Layout>
    );
  }

  const occupancyRate = getBoxOccupancyRate(boxClothes.length, box.capacity);
  const moistureExpired = isMoisturePackExpired(box.moisturePackDate);
  const moistureExpiringSoon = isMoisturePackExpiringSoon(box.moisturePackDate);
  const daysLeft = getDaysUntilExpiry(box.moisturePackDate);

  const handleDelete = () => {
    if (id) {
      deleteBox(id);
      navigate('/boxes');
    }
  };

  const getMoistureStatus = () => {
    if (moistureExpired) {
      return { variant: 'danger' as const, text: '已过期', icon: AlertTriangle };
    }
    if (moistureExpiringSoon) {
      return { variant: 'warning' as const, text: `${daysLeft}天后到期`, icon: AlertTriangle };
    }
    return { variant: 'success' as const, text: '正常', icon: Droplets };
  };

  const moistureStatus = getMoistureStatus();

  return (
    <Layout title="箱子详情" showBack>
      <div className="space-y-4 -mx-4 px-4">
        <div 
          className="relative h-48 -mx-4 -mt-4 rounded-b-3xl overflow-hidden"
          style={{ backgroundColor: box.labelColor + '20' }}
        >
          {box.photo ? (
            <img 
              src={box.photo} 
              alt={box.code}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ 
                background: `linear-gradient(135deg, ${box.labelColor}40 0%, ${box.labelColor}10 100%)` 
              }}
            />
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <span 
                className="px-3 py-1.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: box.labelColor, color: 'white' }}
              >
                {box.code}
              </span>
              <Badge variant={moistureStatus.variant as any}>
                <moistureStatus.icon size={12} className="mr-1" />
                {moistureStatus.text}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-warm-500 text-sm mb-1">
              <MapPin size={16} />
              <span>位置</span>
            </div>
            <p className="font-medium text-warm-800">{box.location}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-warm-500 text-sm mb-1">
              <Shirt size={16} />
              <span>衣物数量</span>
            </div>
            <p className="font-medium text-warm-800">
              {boxClothes.length} / {box.capacity} 件
            </p>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-warm-700 font-medium">容量使用</span>
            <span className={`font-semibold ${
              occupancyRate >= 80 ? 'text-coral-600' : 'text-sage-600'
            }`}>
              {occupancyRate}%
            </span>
          </div>
          <ProgressBar value={boxClothes.length} max={box.capacity} size="lg" />
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              moistureExpired ? 'bg-coral-100' : moistureExpiringSoon ? 'bg-amber-100' : 'bg-sky-100'
            }`}>
              <Droplets size={20} className={
                moistureExpired ? 'text-coral-600' : moistureExpiringSoon ? 'text-amber-600' : 'text-sky-600'
              } />
            </div>
            <div>
              <h4 className="font-medium text-warm-800">防潮包</h4>
              <p className="text-sm text-warm-500">
                放置于 {formatDate(box.moisturePackDate, 'M月d日')}
              </p>
            </div>
          </div>
          {moistureExpired && (
            <p className="text-sm text-coral-600 mt-2">
              防潮包已过期，请及时更换！
            </p>
          )}
          {moistureExpiringSoon && (
            <p className="text-sm text-amber-600 mt-2">
              还有 {daysLeft} 天到期，建议准备更换
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/boxes/${id}/edit`)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Edit size={18} />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 btn-ghost text-coral-600 hover:bg-coral-50 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            删除
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-warm-800 flex items-center gap-2">
              <Shirt size={18} className="text-sage-500" />
              箱内衣物 ({boxClothes.length})
            </h3>
            <button
              onClick={() => navigate(`/clothes/new?boxId=${id}`)}
              className="text-sm text-sage-600 font-medium flex items-center gap-1"
            >
              添加 <Plus size={16} />
            </button>
          </div>
          {boxClothes.length > 0 ? (
            <div className="space-y-3">
              {boxClothes.map((clothing, index) => (
                <div key={clothing.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <ClothingCard clothing={clothing} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Shirt}
              title="箱子里还没有衣物"
              description="添加衣物到这个箱子里"
              action={
                <button
                  onClick={() => navigate(`/clothes/new?boxId=${id}`)}
                  className="btn-primary text-sm"
                >
                  添加衣物
                </button>
              }
            />
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-warm-800 mb-2">确认删除？</h3>
              <p className="text-warm-500 mb-6">
                删除箱子 {box.code} 后，箱内衣物将变为未归档状态，此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-coral-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-coral-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
