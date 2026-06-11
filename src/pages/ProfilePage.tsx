import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cat, Scale, Calendar, UtensilsCrossed, MapPin, FileText, Settings, Save } from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { calculateReferenceWater, WATER_PER_KG } from '@/utils/waterCalculator';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { pet, updatePet, initDefaultPet } = usePetStore();
  
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [foodType, setFoodType] = useState('');
  const [bowlLocation, setBowlLocation] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [waterBaseCoefficient, setWaterBaseCoefficient] = useState<number>(1.0);
  
  useEffect(() => {
    initDefaultPet();
  }, [initDefaultPet]);
  
  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setWeight(pet.weight);
      setAge(pet.age);
      setFoodType(pet.foodType);
      setBowlLocation(pet.bowlLocation);
      setHealthNotes(pet.healthNotes);
      setWaterBaseCoefficient(pet.waterBaseCoefficient);
    }
  }, [pet]);
  
  if (!pet) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  const referenceWater = calculateReferenceWater(weight, waterBaseCoefficient);
  const baseWater = weight * WATER_PER_KG;
  
  const handleSave = () => {
    updatePet({
      name,
      weight,
      age,
      foodType,
      bowlLocation,
      healthNotes,
      waterBaseCoefficient,
    });
    navigate('/');
  };
  
  const foodOptions = ['全价猫粮', '生骨肉', '主食罐头', '冻干', '混合喂养'];
  const locationOptions = ['客厅角落', '卧室门口', '厨房', '阳台', '卫生间'];
  
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
          <h1 className="text-xl font-bold text-gray-800">宠物档案</h1>
          <p className="text-sm text-gray-500">管理猫咪的基本信息</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Cat size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">猫咪名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Scale size={16} className="text-primary-500" />
              体重 (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
            />
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar size={16} className="text-secondary-500" />
              年龄 (岁)
            </label>
            <input
              type="number"
              step="0.5"
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg font-semibold"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <UtensilsCrossed size={16} className="text-success-500" />
            主食类型
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {foodOptions.map((food) => (
              <button
                key={food}
                onClick={() => setFoodType(food)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm transition-all
                  ${foodType === food
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {food}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            placeholder="或输入其他类型..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin size={16} className="text-warning-500" />
            饮水盆位置
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {locationOptions.map((loc) => (
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
            placeholder="或输入其他位置..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Settings size={16} className="text-primary-500" />
            饮水基准系数
          </label>
          
          <div className="bg-primary-50 rounded-xl p-4 mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-gray-600">当前参考饮水量</span>
              <span className="text-2xl font-bold text-primary-600">{referenceWater} ml</span>
            </div>
            <p className="text-xs text-gray-500">
              计算公式：{weight} kg × {WATER_PER_KG} ml × {waterBaseCoefficient.toFixed(1)} = {referenceWater} ml
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">0.7x</span>
              <span className="text-sm font-medium text-primary-600">{waterBaseCoefficient.toFixed(1)}x</span>
              <span className="text-sm text-gray-500">1.5x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={waterBaseCoefficient}
              onChange={(e) => setWaterBaseCoefficient(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>偏少调整</span>
              <span>标准</span>
              <span>偏多调整</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 mt-3">
            提示：默认每公斤体重每天需要约 {WATER_PER_KG} ml 水。可根据猫咪活动量、季节等因素调整基准。
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <FileText size={16} className="text-danger-500" />
            健康备注
          </label>
          <textarea
            value={healthNotes}
            onChange={(e) => setHealthNotes(e.target.value)}
            placeholder="记录猫咪的健康状况、疾病史、用药情况等..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none text-sm"
          />
        </div>
      </div>
      
      <div className="mt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <button
          onClick={handleSave}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          保存档案
        </button>
      </div>
    </div>
  );
}
