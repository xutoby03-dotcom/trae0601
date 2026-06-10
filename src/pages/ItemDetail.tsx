import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Minus,
  Plus,
  MapPin,
  Calendar,
  History,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus, getExpiryBadgeClass } from '../store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_TEXT_COLORS,
  FreezerPosition,
} from '../types';
import { differenceInDays, parseISO, format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function ItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    items,
    records,
    layout,
    consumeQuantity,
    movePosition,
    deleteItem,
    markExpired,
    addToEatList,
    removeFromEatList,
    toEatList,
  } = useFreezerStore();

  const item = items.find((it) => it.id === id);
  const [consumeAmount, setConsumeAmount] = useState<number>(1);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [tempPosition, setTempPosition] = useState<FreezerPosition | null>(null);

  const isInToEat = toEatList.includes(id || '');

  const itemRecords = useMemo(
    () =>
      records
        .filter((r) => r.itemId === id)
        .sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime())
        .slice(0, 20),
    [records, id]
  );

  const sameNameItems = useMemo(() => {
    if (!item) return [];
    return items
      .filter(
        (it) => it.name === item.name && it.id !== item.id
      )
      .sort((a, b) => parseISO(a.purchaseDate).getTime() - parseISO(b.purchaseDate).getTime());
  }, [items, item]);

  if (!item) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-xl font-bold text-gray-700 mb-2">找不到这个食材</div>
        <div className="text-sm text-gray-500 mb-6">可能已经被吃完或删除了</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-freezer-accent text-white rounded-xl font-medium"
        >
          回到冷冻地图
        </button>
      </div>
    );
  }

  const status = getExpiryStatus(item.expiryDate);
  const badgeClass = getExpiryBadgeClass(status);
  const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());

  const handleConsume = () => {
    if (consumeAmount <= 0 || consumeAmount > item.quantity) return;
    consumeQuantity(item.id, consumeAmount);
    setConsumeAmount(1);
    if (consumeAmount >= item.quantity) {
      navigate('/');
    }
  };

  const handleMove = () => {
    if (tempPosition) {
      movePosition(item.id, tempPosition);
      setShowMoveModal(false);
      setTempPosition(null);
    }
  };

  const handleDelete = () => {
    if (confirm(`确定要删除「${item.name}」吗？此操作无法撤销。`)) {
      deleteItem(item.id);
      navigate('/');
    }
  };

  const handleMarkExpired = () => {
    if (confirm(`确定将「${item.name}」标记为过期丢弃吗？`)) {
      markExpired(item.id);
      navigate('/');
    }
  };

  const toggleToEat = () => {
    if (isInToEat) {
      removeFromEatList(item.id);
    } else {
      addToEatList(item.id);
    }
  };

  return (
    <div className="fade-in max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleToEat}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isInToEat
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {isInToEat ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {isInToEat ? '已在待吃' : '加到待吃'}
          </button>
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
        </div>
      </div>

      <div
        className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
          status === 'urgent' || status === 'expired' ? 'ring-2 ring-expiring-urgent/30' : ''
        }`}
      >
        <div className="md:flex">
          <div className={`md:w-72 ${CATEGORY_COLORS[item.category]} p-6 md:p-8 text-white`}>
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.name}
                className="w-full aspect-square rounded-xl object-cover shadow-lg mb-4"
              />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-white/20 flex items-center justify-center text-6xl mb-4 backdrop-blur-sm">
                🧊
              </div>
            )}
            <div className="text-xs opacity-80 font-medium">{CATEGORY_LABELS[item.category]}</div>
            <h1 className="text-2xl font-bold mt-1">{item.name}</h1>
            <div className="mt-2 text-4xl font-bold">
              {item.quantity}
              <span className="text-lg font-normal opacity-90 ml-1">{item.unit}</span>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                {daysLeft < 0
                  ? `已过期 ${-daysLeft} 天`
                  : daysLeft === 0
                  ? '今天到期 ⚠️'
                  : `还剩 ${daysLeft} 天`}
              </span>
              {item.isPackaged && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  📦 已分装
                </span>
              )}
              {item.isOpened && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  📂 已开封
                </span>
              )}
            </div>

            {(status === 'urgent' || status === 'expired') && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  status === 'expired' ? 'bg-gray-100' : 'bg-red-50'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    status === 'expired' ? 'text-gray-500' : 'text-expiring-urgent'
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`text-sm font-bold ${
                      status === 'expired' ? 'text-gray-700' : 'text-expiring-urgent'
                    }`}
                  >
                    {status === 'expired' ? '已过期，请尽快处理！' : '即将过期，优先食用！'}
                  </div>
                  <button
                    onClick={handleMarkExpired}
                    className="mt-2 text-xs font-medium text-gray-600 hover:text-gray-800 underline"
                  >
                    标记为过期丢弃
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  购买日期
                </div>
                <div className="font-bold text-gray-800">
                  {format(parseISO(item.purchaseDate), 'yyyy年M月d日')}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {formatDistanceToNow(parseISO(item.purchaseDate), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  保质期至
                </div>
                <div className="font-bold text-gray-800">
                  {format(parseISO(item.expiryDate), 'yyyy年M月d日')}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  冷冻 {differenceInDays(parseISO(item.expiryDate), parseISO(item.purchaseDate))} 天
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  存放位置
                </div>
                <div className="font-bold text-gray-800">
                  {layout.drawerNames[item.position.drawer]} · 第{item.position.cell + 1}格
                </div>
                <button
                  onClick={() => {
                    setTempPosition(item.position);
                    setShowMoveModal(true);
                  }}
                  className="text-[11px] text-freezer-accent font-medium mt-0.5 hover:underline inline-flex items-center gap-0.5"
                >
                  移动位置 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="text-xs text-gray-500 mb-1">💰 购入</div>
                <div className="font-bold text-gray-800">
                  {item.price ? `¥${item.price}` : '未记录'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {item.price
                    ? `约¥${(item.price / item.quantity).toFixed(2)}/${item.unit}`
                    : ''}
                </div>
              </div>
            </div>

            {item.note && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xs text-amber-700 font-medium mb-1">📝 备注</div>
                <div className="text-sm text-amber-900">{item.note}</div>
              </div>
            )}

            <div className="pt-2">
              <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                🛒 取用食材
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() =>
                      setConsumeAmount((v) => Math.max(0.5, Math.min(item.quantity - 0.5, v - 1)))
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="0.5"
                    max={item.quantity}
                    step="0.5"
                    value={consumeAmount}
                    onChange={(e) => setConsumeAmount(Number(e.target.value))}
                    className="w-20 h-12 text-center text-xl font-bold bg-white border-x border-gray-200 outline-none"
                  />
                  <button
                    onClick={() =>
                      setConsumeAmount((v) => Math.max(1, Math.min(item.quantity, v + 1)))
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <span className="text-gray-500 font-medium">/ {item.quantity} {item.unit}</span>
                <button
                  onClick={handleConsume}
                  disabled={consumeAmount <= 0 || consumeAmount > item.quantity}
                  className="ml-auto px-6 py-3 rounded-xl bg-freezer-accent text-white font-bold shadow-md hover:shadow-lg hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  确认取用
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                {[1, 2, item.quantity / 2, item.quantity]
                  .filter((v, i, arr) => arr.indexOf(v) === i && v > 0 && v <= item.quantity)
                  .map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setConsumeAmount(Number(v.toFixed(1)))}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      {v === item.quantity ? '全部用完' : `${v}${item.unit}`}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sameNameItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
              ⚡
            </div>
            <div>
              <div className="font-bold text-gray-800">先入先出 (FIFO) 提醒</div>
              <div className="text-xs text-gray-500">以下是更早购入的同款，建议优先吃</div>
            </div>
          </div>
          <div className="space-y-2">
            {sameNameItems.map((si) => {
              const siDays = differenceInDays(parseISO(si.expiryDate), new Date());
              const siStatus = getExpiryStatus(si.expiryDate);
              return (
                <div
                  key={si.id}
                  onClick={() => navigate(`/item/${si.id}`)}
                  className="flex items-center justify-between p-3 bg-white/70 rounded-xl hover:bg-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center font-bold text-amber-700">
                      {si.quantity}
                      <span className="text-[10px] ml-0.5">{si.unit}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {layout.drawerNames[si.position.drawer]} · 第{si.position.cell + 1}格
                      </div>
                      <div className="text-[11px] text-gray-500">
                        购买于 {format(parseISO(si.purchaseDate), 'M月d日')}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getExpiryBadgeClass(
                      siStatus
                    )}`}
                  >
                    {siDays < 0 ? `过期${-siDays}天` : `剩${siDays}天`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {itemRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-400" />
            <div className="font-bold text-gray-800">取用 / 变动记录</div>
          </div>
          <div className="space-y-2">
            {itemRecords.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                      r.reason === 'used'
                        ? 'bg-green-100'
                        : r.reason === 'expired'
                        ? 'bg-gray-200'
                        : 'bg-blue-100'
                    }`}
                  >
                    {r.reason === 'used' ? '🍽️' : r.reason === 'expired' ? '🗑️' : '↔️'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {r.reason === 'used'
                        ? `取用 ${r.quantity}${r.unit}`
                        : r.reason === 'expired'
                        ? '标记过期丢弃'
                        : r.note?.split('移到')[0] || '移动位置'}
                    </div>
                    {r.note && r.reason !== 'moved' && (
                      <div className="text-[11px] text-gray-500 mt-0.5">{r.note}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {format(new Date(r.consumedAt), 'M月d日 HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pb-4">
        <button
          onClick={handleDelete}
          className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          删除此食材
        </button>
      </div>

      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-gray-800">📍 移动到新位置</div>
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setTempPosition(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">选择抽屉层</div>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: layout.drawers }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setTempPosition({ drawer: i, cell: tempPosition?.cell || 0 })
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        tempPosition?.drawer === i
                          ? 'bg-freezer-accent text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {layout.drawerNames[i]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">选择格子</div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${layout.cellsPerDrawer}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: layout.cellsPerDrawer }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setTempPosition({ drawer: tempPosition?.drawer || 0, cell: i })
                      }
                      className={`aspect-square rounded-xl text-sm font-bold transition-all ${
                        tempPosition?.cell === i
                          ? 'bg-freezer-accent text-white shadow-md'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setTempPosition(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMove}
                disabled={
                  !tempPosition ||
                  (tempPosition.drawer === item.position.drawer &&
                    tempPosition.cell === item.position.cell)
                }
                className="flex-1 py-2.5 rounded-xl bg-freezer-accent text-white font-bold shadow-md hover:bg-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认移动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
