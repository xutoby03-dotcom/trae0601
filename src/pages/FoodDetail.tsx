import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { AllergenBadge } from '../components/AllergenBadge';
import { CountdownTimer } from '../components/CountdownTimer';
import { DEPARTMENTS, CATEGORY_LABELS } from '../types';
import { formatDateTime, getRemainingTime } from '../utils/time';

export default function FoodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFoodById, claimFood, currentUserName, currentUserDept } = useFoodStore();
  
  const food = getFoodById(id || '');
  
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState(currentUserDept);
  const [claimerName, setClaimerName] = useState(currentUserName);
  const [pickupTime, setPickupTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!food) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-coffee-700 mb-2">食品不存在</h2>
          <p className="text-coffee-500 mb-4">该食品可能已被领完或已下架</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            返回大厅
          </button>
        </div>
      </div>
    );
  }

  const { isExpired } = getRemainingTime(food.endTime, food.edibleHours);
  const isUnavailable = isExpired || food.status === 'fully_claimed' || food.status === 'disposed';
  const hasImportantAllergens = food.allergens.some((a) => a === 'nuts' || a === 'dairy');

  const handleClaim = () => {
    setError('');
    
    if (!claimerName.trim()) {
      setError('请输入您的姓名');
      return;
    }
    if (!pickupTime) {
      setError('请选择取走时间');
      return;
    }
    if (quantity < 1 || quantity > food.remaining) {
      setError('认领数量不正确');
      return;
    }

    const success = claimFood(food.id, quantity, department, claimerName, pickupTime);
    
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError('认领失败，可能库存不足或已过期');
    }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-coffee-600 hover:text-coffee-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回认领大厅
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-80 bg-warm-100">
              <img
                src={food.photoUrl}
                alt={food.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-coffee-700">
                  {CATEGORY_LABELS[food.category]}
                </span>
                <span className={`px-4 py-1.5 backdrop-blur-sm rounded-full text-sm font-medium text-white ${
                  food.isOpened ? 'bg-amber-500/90' : 'bg-emerald-500/90'
                }`}>
                  {food.isOpened ? '已开封' : '未开封'}
                </span>
              </div>

              {isUnavailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {isExpired ? '已过期' : '已领完'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-coffee-800 mb-2">{food.name}</h1>
              <p className="text-coffee-500 mb-4">{food.description}</p>

              {food.allergens.length > 0 && (
                <div className="mb-4">
                  <AllergenBadge allergens={food.allergens} size="md" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-warm-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm text-coffee-500">剩余数量</div>
                    <div className="text-lg font-bold text-coffee-800">{food.remaining} 份</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-coffee-500">可食用剩余</div>
                    <div className="text-lg font-bold">
                      <CountdownTimer endTime={food.endTime} edibleHours={food.edibleHours} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-coffee-500">来源会议室</div>
                    <div className="text-sm font-semibold text-coffee-800">{food.meetingRoom}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-coffee-500">所属部门</div>
                    <div className="text-sm font-semibold text-coffee-800">{food.department}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-warm-100">
                <div className="text-sm text-coffee-500">
                  会议结束时间：{formatDateTime(food.endTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 h-fit sticky top-24">
            {showSuccess ? (
              <div className="text-center py-12 animate-bounce-subtle">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-coffee-800 mb-2">认领成功！</h2>
                <p className="text-coffee-500">请准时到茶水间取走您的美食</p>
                <p className="text-sm text-coffee-400 mt-2">正在返回大厅...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-coffee-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  立即认领
                </h2>

                {hasImportantAllergens && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-700 mb-1">过敏原警示</div>
                        <div className="text-sm text-red-600">
                          此食品含有
                          {food.allergens.filter((a) => a === 'nuts' || a === 'dairy').map((a) => {
                            const labels: Record<string, string> = { nuts: '坚果', dairy: '乳制品' };
                            return labels[a];
                          }).join('、')}
                          ，过敏体质者请勿食用！
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isUnavailable ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
                    <p className="text-coffee-500">
                      {isExpired ? '该食品已过期，无法认领' : '该食品已被领完'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-2">
                        认领数量
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-xl bg-warm-100 text-coffee-700 font-bold text-xl
                            hover:bg-warm-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-coffee-800 w-12 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(food.remaining, quantity + 1))}
                          className="w-10 h-10 rounded-xl bg-primary-500 text-white font-bold text-xl
                            hover:bg-primary-600 transition-colors"
                        >
                          +
                        </button>
                        <span className="text-sm text-coffee-500">
                          剩余 {food.remaining} 份
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        您的姓名
                      </label>
                      <input
                        type="text"
                        value={claimerName}
                        onChange={(e) => setClaimerName(e.target.value)}
                        className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                          text-coffee-800 transition-all"
                        placeholder="请输入您的姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        所属部门
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                          text-coffee-800 transition-all"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-coffee-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        取走时间
                      </label>
                      <input
                        type="datetime-local"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                          text-coffee-800 transition-all"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleClaim}
                      className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600
                        text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-200
                        hover:shadow-xl hover:shadow-primary-300 hover:from-primary-600 hover:to-primary-700
                        transition-all duration-300 active:scale-95"
                    >
                      确认认领
                    </button>

                    <p className="text-xs text-coffee-400 text-center">
                      认领后请准时取走，避免食物浪费 🙏
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
