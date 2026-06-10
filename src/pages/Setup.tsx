import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Scissors, Coffee, Wrench, Settings } from 'lucide-react';
import { useQueueStore } from '@/store/queueStore';
import { BusinessType, BUSINESS_TYPE_LABELS } from '@/types';

const businessOptions: { type: BusinessType; icon: React.ReactNode; desc: string }[] = [
  { type: 'haircut', icon: <Scissors className="w-8 h-8" />, desc: '理发店/美发店' },
  { type: 'milktea', icon: <Coffee className="w-8 h-8" />, desc: '奶茶店/饮品店' },
  { type: 'repair', icon: <Wrench className="w-8 h-8" />, desc: '手机维修/维修店' },
  { type: 'other', icon: <Store className="w-8 h-8" />, desc: '其他服务型店铺' },
];

const timeOptions = [10, 15, 20, 30, 45, 60];

export default function Setup() {
  const navigate = useNavigate();
  const { initializeQueue, queue } = useQueueStore();
  const [businessType, setBusinessType] = useState<BusinessType>('haircut');
  const [businessName, setBusinessName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = businessName.trim() || BUSINESS_TYPE_LABELS[businessType];
    initializeQueue(businessType, name, estimatedTime);
    navigate('/staff');
  };

  const handleSkip = () => {
    if (queue) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">排队取号墙</h1>
          <p className="text-white/60">设置店铺信息，开始数字化排队管理</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-8">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-4">
              选择店铺类型
            </label>
            <div className="grid grid-cols-2 gap-4">
              {businessOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setBusinessType(option.type)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    businessType === option.type
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className={`mb-3 ${
                    businessType === option.type ? 'text-primary-400' : 'text-white/60'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="font-semibold mb-1">
                    {BUSINESS_TYPE_LABELS[option.type]}
                  </div>
                  <div className="text-sm text-white/50">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              店铺名称（可选）
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="例如：小明理发店"
              className="input-field text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">
              预计单人服务时长
            </label>
            <div className="grid grid-cols-3 gap-3">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setEstimatedTime(time)}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    estimatedTime === time
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {time} 分钟
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {queue && (
              <button
                type="button"
                onClick={handleSkip}
                className="btn-secondary flex-1"
              >
                返回首页
              </button>
            )}
            <button type="submit" className="btn-primary flex-1">
              开始使用
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
