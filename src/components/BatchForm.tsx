import { useState, useEffect } from 'react';
import { X, Camera, Clock, Droplets, Leaf } from 'lucide-react';
import { Tea, BatchFormData } from '@/types';

interface BatchFormProps {
  teas: Tea[];
  onSubmit: (data: BatchFormData) => void;
  onClose: () => void;
}

export default function BatchForm({ teas, onSubmit, onClose }: BatchFormProps) {
  const [selectedTea, setSelectedTea] = useState<string>(teas[0]?.id || '');
  const [bucketNumber, setBucketNumber] = useState<number>(1);
  const [waterAmountMl, setWaterAmountMl] = useState<number>(5000);
  const [teaAmountG, setTeaAmountG] = useState<number>(25);
  const [startTime, setStartTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [operator, setOperator] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  useEffect(() => {
    const tea = teas.find((t) => t.id === selectedTea);
    if (tea) {
      const calculated = Math.round((waterAmountMl / 1000) * tea.teaToWaterRatio);
      setTeaAmountG(calculated);
    }
  }, [selectedTea, waterAmountMl, teas]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      teaId: selectedTea,
      bucketNumber,
      waterAmountMl,
      teaAmountG,
      startTime: new Date(startTime).toISOString(),
      operator,
      photoUrl,
    });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const selectedTeaData = teas.find((t) => t.id === selectedTea);
  const targetTime = selectedTeaData 
    ? new Date(new Date(startTime).getTime() + selectedTeaData.brewDurationMinutes * 60 * 1000)
    : null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 font-serif">新建冷泡茶批次</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Leaf className="w-4 h-4 inline mr-1 text-matcha-500" />
                  茶叶品种
                </label>
                <select
                  value={selectedTea}
                  onChange={(e) => setSelectedTea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                >
                  {teas.map((tea) => (
                    <option key={tea.id} value={tea.id}>
                      {tea.name}（建议浸泡{tea.brewDurationMinutes}分钟）
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    桶号
                  </label>
                  <input
                    type="number"
                    value={bucketNumber}
                    onChange={(e) => setBucketNumber(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Droplets className="w-4 h-4 inline mr-1 text-blue-400" />
                    水量 (ml)
                  </label>
                  <input
                    type="number"
                    value={waterAmountMl}
                    onChange={(e) => setWaterAmountMl(Number(e.target.value))}
                    step={500}
                    min={1000}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Leaf className="w-4 h-4 inline mr-1 text-matcha-500" />
                    投茶量 (g)
                  </label>
                  <input
                    type="number"
                    value={teaAmountG}
                    onChange={(e) => setTeaAmountG(Number(e.target.value))}
                    step={1}
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                  />
                  {selectedTeaData && (
                    <p className="text-xs text-gray-400 mt-1">
                      标准茶水比: {selectedTeaData.teaToWaterRatio}g/L
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1 text-amber-500" />
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  操作人
                </label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="请输入操作人姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-matcha-400 focus:ring-2 focus:ring-matcha-100 outline-none transition-all"
                />
              </div>
              
              {targetTime && (
                <div className="p-4 bg-matcha-50 rounded-xl">
                  <p className="text-sm text-matcha-600">
                    <span className="font-medium">预计过滤时间:</span>{' '}
                    {targetTime.toLocaleString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-matcha-500 mt-1">
                    浸泡时长: {selectedTeaData?.brewDurationMinutes} 分钟
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1 text-gray-500" />
                照片记录
              </label>
              <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50">
                {photoUrl ? (
                  <div className="relative w-full h-full">
                    <img src={photoUrl} alt="批次照片" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <Camera className="w-12 h-12 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400">点击上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                建议拍摄茶叶入桶后的照片留档
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-white bg-matcha-500 hover:bg-matcha-600 transition-colors font-medium shadow-md shadow-matcha-200"
            >
              开始浸泡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
