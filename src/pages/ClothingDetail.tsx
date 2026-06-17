import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shirt, User, Calendar, Ruler, Tag, 
  Package, Edit, Trash2, Check, X,
  Archive, ArrowLeftRight
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { getSeasonLabel, getCategoryLabel } from '@/utils/helpers';
import { formatDate, formatDateFriendly } from '@/utils/date';

export default function ClothingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clothes = useStore((state) => state.clothes);
  const boxes = useStore((state) => state.boxes);
  const updateClothing = useStore((state) => state.updateClothing);
  const deleteClothing = useStore((state) => state.deleteClothing);
  const takeOutClothing = useStore((state) => state.takeOutClothing);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveBox, setShowMoveBox] = useState(false);

  const clothing = useMemo(() => clothes.find(c => c.id === id), [clothes, id]);
  const box = useMemo(() => 
    clothing?.boxId ? boxes.find(b => b.id === clothing.boxId) : undefined,
    [boxes, clothing?.boxId]
  );

  if (!clothing) {
    return (
      <Layout title="衣物详情" showBack>
        <EmptyState
          icon={Shirt}
          title="衣物不存在"
          description="这件衣物可能已经被删除了"
        />
      </Layout>
    );
  }

  const handleDelete = () => {
    if (id) {
      deleteClothing(id);
      navigate('/clothes');
    }
  };

  const handleTakeOut = () => {
    if (id) {
      takeOutClothing(id);
    }
  };

  const handleMoveToBox = (boxId: string) => {
    if (id) {
      updateClothing(id, { boxId, status: 'in_box' });
      setShowMoveBox(false);
    }
  };

  return (
    <Layout title="衣物详情" showBack>
      <div className="space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-warm-100">
          {clothing.photo ? (
            <img 
              src={clothing.photo} 
              alt={clothing.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt size={64} className="text-warm-300" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="primary">{clothing.owner}</Badge>
            <Badge variant="info">{getSeasonLabel(clothing.season)}</Badge>
          </div>
          {clothing.status === 'pending' && (
            <div className="absolute top-4 right-4">
              <Badge variant="warning">待处理</Badge>
            </div>
          )}
          {clothing.status === 'taken_out' && (
            <div className="absolute top-4 right-4">
              <Badge variant="info">已取出</Badge>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-bold text-warm-800 mb-2">{clothing.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">{getCategoryLabel(clothing.category)}</Badge>
            <Badge variant="default">{clothing.size}</Badge>
            {clothing.isVacuumPacked && (
              <Badge variant="info">
                <Archive size={12} className="mr-1" />
                真空压缩
              </Badge>
            )}
          </div>
          
          <div className="space-y-3 pt-3 border-t border-warm-100">
            <div className="flex items-center justify-between">
              <span className="text-warm-500 flex items-center gap-2">
                <User size={16} />
                归属人
              </span>
              <span className="font-medium text-warm-700">{clothing.owner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warm-500 flex items-center gap-2">
                <Ruler size={16} />
                尺码
              </span>
              <span className="font-medium text-warm-700">{clothing.size}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warm-500 flex items-center gap-2">
                <Calendar size={16} />
                季节
              </span>
              <span className="font-medium text-warm-700">{getSeasonLabel(clothing.season)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warm-500 flex items-center gap-2">
                <Tag size={16} />
                类别
              </span>
              <span className="font-medium text-warm-700">{getCategoryLabel(clothing.category)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warm-500 flex items-center gap-2">
                {clothing.isWashed ? <Check size={16} className="text-sage-500" /> : <X size={16} className="text-coral-500" />}
                洗晒状态
              </span>
              <span className={`font-medium ${clothing.isWashed ? 'text-sage-600' : 'text-coral-600'}`}>
                {clothing.isWashed ? '已洗干晒透' : '待清洗'}
              </span>
            </div>
            {clothing.lastWornDate && (
              <div className="flex items-center justify-between">
                <span className="text-warm-500 flex items-center gap-2">
                  <Calendar size={16} />
                  上次穿着
                </span>
                <span className="font-medium text-warm-700">
                  {formatDateFriendly(clothing.lastWornDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {box && (
          <div 
            className="card p-4 cursor-pointer card-hover"
            onClick={() => navigate(`/boxes/${box.id}`)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: box.labelColor + '20' }}
              >
                <Package size={20} style={{ color: box.labelColor }} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-warm-800">{box.code}</h4>
                <p className="text-sm text-warm-500">{box.location}</p>
              </div>
              <ArrowLeftRight size={18} className="text-warm-300" />
            </div>
          </div>
        )}

        {clothing.notes && (
          <div className="card p-4">
            <h4 className="font-medium text-warm-700 mb-2">备注</h4>
            <p className="text-warm-600 text-sm">{clothing.notes}</p>
          </div>
        )}

        <div className="space-y-3">
          {clothing.status === 'in_box' && (
            <button onClick={handleTakeOut} className="w-full btn-primary">
              取出使用
            </button>
          )}
          {clothing.status === 'taken_out' && (
            <button 
              onClick={() => setShowMoveBox(true)} 
              className="w-full btn-primary"
            >
              放回箱子
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/clothes/${id}/edit`)}
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
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-warm-800 mb-2">确认删除？</h3>
              <p className="text-warm-500 mb-6">
                删除「{clothing.name}」后无法恢复，确定要删除吗？
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

        {showMoveBox && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-warm-800 mb-4">选择箱子</h3>
              <div className="space-y-2">
                {boxes.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleMoveToBox(b.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-warm-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: b.labelColor + '20' }}
                    >
                      <span className="text-xs font-bold" style={{ color: b.labelColor }}>
                        {b.code}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-warm-800 text-sm">{b.location}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMoveBox(false)}
                className="w-full mt-4 btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
