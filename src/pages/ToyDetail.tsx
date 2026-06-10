import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Archive,
  AlertTriangle,
  Gift,
  Send,
  Package,
  Calendar,
  Tag,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { useToyStore } from '@/store/useToyStore';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  TAG_LABELS,
  TAG_COLORS,
  TOY_CATEGORIES,
} from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ToyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getToyById,
    changeToyStatus,
    addRotationRecord,
    getRecordsByToyId,
    updateToy,
    deleteToy,
    getPlayCount,
    getLastPlayTime,
  } = useToyStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<'take-out' | 'put-back' | null>(null);

  const toy = id ? getToyById(id) : undefined;
  const records = toy ? getRecordsByToyId(toy.id) : [];
  const playCount = toy ? getPlayCount(toy.id) : 0;
  const lastPlayTime = toy ? getLastPlayTime(toy.id) : null;

  if (!toy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <p className="text-gray-500 mb-4">找不到这个玩具</p>
          <Link to="/" className="text-primary-500 hover:text-primary-600">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTakeOut = () => {
    setPendingAction('take-out');
    setShowNoteInput(true);
  };

  const handlePutBack = () => {
    setPendingAction('put-back');
    setShowNoteInput(true);
  };

  const confirmAction = () => {
    if (!pendingAction || !toy) return;

    addRotationRecord(toy.id, pendingAction, note || undefined);

    if (pendingAction === 'take-out') {
      changeToyStatus(toy.id, 'playing');
    } else {
      changeToyStatus(toy.id, 'stored');
    }

    setShowNoteInput(false);
    setNote('');
    setPendingAction(null);
  };

  const handleMarkMissing = () => {
    updateToy(toy.id, { isMissingParts: !toy.isMissingParts });
  };

  const handleMarkGiving = () => {
    changeToyStatus(toy.id, 'giving');
  };

  const handleMarkAway = () => {
    changeToyStatus(toy.id, 'away');
  };

  const handleDelete = () => {
    deleteToy(toy.id);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-800">玩具详情</h1>
          <div className="flex items-center gap-1">
            <Link
              to={`/edit/${toy.id}`}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Edit size={18} className="text-gray-600" />
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* 玩具照片 */}
        <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-mint-100 rounded-3xl overflow-hidden mb-6 shadow-lg">
          {toy.photo ? (
            <img src={toy.photo} alt={toy.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              🧸
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium',
                STATUS_COLORS[toy.status]
              )}
            >
              {STATUS_LABELS[toy.status]}
            </span>
          </div>
          {toy.hasSmallParts && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldAlert size={14} />
              含小零件
            </div>
          )}
        </div>

        {/* 玩具名称 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{toy.name}</h2>
          <div className="flex flex-wrap gap-2">
            {toy.tags.map((tag) => (
              <span
                key={tag}
                className={cn('text-sm px-3 py-1 rounded-full', TAG_COLORS[tag])}
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        </div>

        {/* 玩具信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-primary-500" />
            基本信息
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">适合年龄</p>
                <p className="text-sm font-medium text-gray-700">{toy.ageRange}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center">
                <Tag size={18} className="text-mint-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">玩具类型</p>
                <p className="text-sm font-medium text-gray-700">{toy.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">存放位置</p>
                <p className="text-sm font-medium text-gray-700">{toy.storageBox}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <Gift size={18} className="text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">购买日期</p>
                <p className="text-sm font-medium text-gray-700">
                  {toy.purchaseDate || '未记录'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 玩耍统计 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary-500" />
            玩耍记录
          </h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{playCount}</p>
              <p className="text-xs text-gray-500 mt-1">玩耍次数</p>
            </div>
            <div className="flex-1 bg-mint-50 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-mint-700 mt-2">
                {lastPlayTime ? formatDate(lastPlayTime) : '暂无记录'}
              </p>
              <p className="text-xs text-gray-500 mt-1">上次玩耍</p>
            </div>
          </div>

          {/* 轮换历史时间线 */}
          {records.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {records.slice(0, 10).map((record, index) => (
                <div key={record.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        record.action === 'take-out' ? 'bg-mint-500' : 'bg-sky-500'
                      )}
                    />
                    {index < records.length - 1 && index < 9 && (
                      <div className="w-0.5 h-full bg-gray-200 absolute top-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-700">
                      {record.action === 'take-out' ? '🎮 拿出来玩' : '📦 收回箱子'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(record.timestamp)}
                    </p>
                    {record.note && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">
                        {record.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 备注输入弹窗 */}
        {showNoteInput && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-fade-in">
            <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                {pendingAction === 'take-out' ? '拿出来玩' : '收回箱子'}
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注（可选）"
                className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNote('');
                    setPendingAction(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmAction}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">确认删除</h3>
                <p className="text-gray-500 text-sm mt-2">
                  删除后将无法恢复，确定要删除这个玩具吗？
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 z-40">
        <div className="max-w-2xl mx-auto flex gap-2">
          {toy.status !== 'playing' && toy.status !== 'away' && (
            <button
              onClick={handleTakeOut}
              className="flex-1 flex items-center justify-center gap-2 bg-mint-500 hover:bg-mint-600 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <Play size={18} />
              拿出来玩
            </button>
          )}
          {toy.status === 'playing' && (
            <button
              onClick={handlePutBack}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <Archive size={18} />
              收回箱子
            </button>
          )}
          {toy.status !== 'away' && (
            <>
              <button
                onClick={handleMarkMissing}
                className={cn(
                  'flex items-center justify-center p-3 rounded-xl font-medium transition-colors',
                  toy.isMissingParts
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                )}
                title="标记缺件"
              >
                <AlertTriangle size={18} />
              </button>
              {toy.status !== 'giving' && (
                <button
                  onClick={handleMarkGiving}
                  className="flex items-center justify-center p-3 rounded-xl bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
                  title="准备送人"
                >
                  <Gift size={18} />
                </button>
              )}
              {toy.status === 'giving' && (
                <button
                  onClick={handleMarkAway}
                  className="flex items-center justify-center p-3 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title="确认送出"
                >
                  <Send size={18} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
