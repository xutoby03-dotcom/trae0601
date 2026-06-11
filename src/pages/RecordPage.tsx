import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Droplets, CircleDot, Zap, FileText, MapPin, Save } from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { calculateWaterConsumed, calculateReferenceWater, calculateStatus, getStatusLabel } from '@/utils/waterCalculator';
import { formatDateChinese } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';

export default function RecordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const { pet, records, addRecord, getRecordByDate, initDefaultPet } = usePetStore();
  
  const [date, setDate] = useState(dateParam);
  const [waterAdded, setWaterAdded] = useState<number>(250);
  const [waterRemaining, setWaterRemaining] = useState<number>(50);
  const [fountainOn, setFountainOn] = useState<boolean>(true);
  const [urineClumps, setUrineClumps] = useState<number>(3);
  const [abnormalities, setAbnormalities] = useState<string>('');
  const [bowlLocation, setBowlLocation] = useState<string>('');
  
  useEffect(() => {
    initDefaultPet();
  }, [initDefaultPet]);
  
  useEffect(() => {
    const existingRecord = getRecordByDate(date);
    if (existingRecord) {
      setWaterAdded(existingRecord.waterAdded);
      setWaterRemaining(existingRecord.waterRemaining);
      setFountainOn(existingRecord.fountainOn);
      setUrineClumps(existingRecord.urineClumps);
      setAbnormalities(existingRecord.abnormalities);
      setBowlLocation(existingRecord.bowlLocation);
    } else if (pet) {
      setBowlLocation(pet.bowlLocation);
    }
  }, [date, pet, getRecordByDate]);
  
  if (!pet) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  const waterConsumed = calculateWaterConsumed(waterAdded, waterRemaining);
  const referenceWater = calculateReferenceWater(pet.weight, pet.waterBaseCoefficient);
  const status = calculateStatus(waterConsumed, referenceWater);
  const percentage = Math.round((waterConsumed / referenceWater) * 100);
  
  const handleSave = () => {
    addRecord({
      date,
      waterAdded,
      waterRemaining,
      fountainOn,
      urineClumps,
      abnormalities,
      bowlLocation: bowlLocation || pet.bowlLocation,
    });
    navigate('/');
  };
  
  const allLocations = [...new Set([pet.bowlLocation, ...records.map(r => r.bowlLocation)])].filter(Boolean);
  
  return (
    <div className="pb-24 md:pb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">饮水记录</h1>
          <p className="text-sm text-gray-500">{formatDateChinese(date)}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">今日预估状态</span>
          <StatusBadge status={status} size="md" />
        </div>
        
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold text-gray-800">{waterConsumed}</span>
          <span className="text-gray-500 mb-1">ml 饮水</span>
        </div>
        
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'normal' ? 'bg-success-500' :
              status === 'low' ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">
          参考值 {referenceWater} ml · 完成 {percentage}%
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Droplets size={16} className="text-primary-500" />
              换水量 (ml)
            </label>
            <input
              type="number"
              value={waterAdded}
              onChange={(e) => setWaterAdded(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
            />
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Droplets size={16} className="text-secondary-500" />
              剩水量 (ml)
            </label>
            <input
              type="number"
              value={waterRemaining}
              onChange={(e) => setWaterRemaining(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <CircleDot size={16} className="text-primary-500" />
              尿团数量
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUrineClumps(Math.max(0, urineClumps - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 transition-colors"
              >
                -
              </button>
              <span className="flex-1 text-center text-2xl font-bold text-gray-800">{urineClumps}</span>
              <button
                onClick={() => setUrineClumps(urineClumps + 1)}
                className="w-10 h-10 rounded-xl bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-xl font-bold text-primary-600 transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">个</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Zap size={16} className="text-success-500" />
              饮水机
            </label>
            <button
              onClick={() => setFountainOn(!fountainOn)}
              className={`
                w-full py-3 rounded-xl font-medium transition-all
                ${fountainOn 
                  ? 'bg-success-100 text-success-600 border-2 border-success-200' 
                  : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                }
              `}
            >
              {fountainOn ? '已开启' : '已关闭'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin size={16} className="text-warning-500" />
            水盆位置
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {allLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => setBowlLocation(loc)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm transition-all
                  ${bowlLocation === loc
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {loc}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={bowlLocation}
            onChange={(e) => setBowlLocation(e.target.value)}
            placeholder="或输入新位置..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <FileText size={16} className="text-danger-500" />
            异常表现
          </label>
          <textarea
            value={abnormalities}
            onChange={(e) => setAbnormalities(e.target.value)}
            placeholder="如：喝水比平时少、频繁去猫砂盆、精神不振等..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-sm"
          />
        </div>
      </div>
      
      <div className="mt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
        <button
          onClick={handleSave}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          保存记录
        </button>
      </div>
    </div>
  );
}
