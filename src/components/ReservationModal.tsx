import { useState } from 'react';
import { X, Clock, Users, Coffee, Phone, User, Gamepad2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { TableData } from '@shared/types';

interface ReservationModalProps {
  table: TableData;
  selectedDate: string;
  defaultStartTime?: string;
  onClose: () => void;
}

const GAME_TYPES = ['麻将', '扑克', '象棋', '围棋', '五子棋', '其他'];
const TEA_OPTIONS = ['不喝茶', '绿茶', '红茶', '菊花茶', '龙井茶', '普洱茶', '白开水'];

export default function ReservationModal({ table, selectedDate, defaultStartTime, onClose }: ReservationModalProps) {
  const createReservation = useStore(state => state.createReservation);
  const [formData, setFormData] = useState({
    gameType: '麻将',
    peopleCount: table.capacity,
    startTime: defaultStartTime || '09:00',
    endTime: defaultStartTime ? addHours(defaultStartTime, 2) : '11:00',
    contactName: '',
    contactPhone: '',
    teaRequirement: '不喝茶',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function addHours(timeStr: string, hours: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const newH = Math.min(h + hours, 22);
    return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await createReservation({
        tableId: table.id,
        gameType: formData.gameType,
        peopleCount: formData.peopleCount,
        startTime: `${selectedDate}T${formData.startTime}:00`,
        endTime: `${selectedDate}T${formData.endTime}:00`,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        teaRequirement: formData.teaRequirement,
      });

      if ('error' in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">预约成功！</h3>
          <p className="text-gray-500">桌位 {table.tableNumber} 已为您预留</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">预约桌位 {table.tableNumber}</h3>
            <p className="text-sm text-gray-500 mt-0.5">可坐 {table.capacity} 人 {table.isWindow && '· 靠窗'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={14} className="inline mr-1" />开始时间
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                min={table.openTime}
                max={table.closeTime}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={14} className="inline mr-1" />结束时间
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                min={formData.startTime}
                max={table.closeTime}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gamepad2 size={14} className="inline mr-1" />玩法
            </label>
            <div className="flex flex-wrap gap-2">
              {GAME_TYPES.map(game => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleInputChange('gameType', game)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.gameType === game
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={14} className="inline mr-1" />人数
            </label>
            <input
              type="number"
              min="1"
              max={table.capacity}
              value={formData.peopleCount}
              onChange={(e) => handleInputChange('peopleCount', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={14} className="inline mr-1" />联系人姓名
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="请输入您的称呼"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={14} className="inline mr-1" />联系电话
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="请输入手机号码"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Coffee size={14} className="inline mr-1" />茶水需求
            </label>
            <div className="flex flex-wrap gap-2">
              {TEA_OPTIONS.map(tea => (
                <button
                  key={tea}
                  type="button"
                  onClick={() => handleInputChange('teaRequirement', tea)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.teaRequirement === tea
                      ? 'bg-warm-300 text-warm-700 font-medium'
                      : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                  }`}
                >
                  {tea}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {submitting ? '提交中...' : '确认预约'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            温馨提示：请准时到店，超过15分钟未签到将自动释放桌位
          </p>
        </form>
      </div>
    </div>
  );
}
