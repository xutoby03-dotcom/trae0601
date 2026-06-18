import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Coffee } from 'lucide-react';
import { useBatchStore } from '../store/useBatchStore';
import { getTodayISO } from '../utils/dateUtils';

const commonFlavors = [
  '花香', '果香', '柑橘', '莓果', '焦糖', '坚果',
  '巧克力', '奶油', '茶感', '平衡', '醇厚', '明亮',
  '红糖', '杏仁', '可可', '烟熏', '柠檬', '黑醋栗',
];

const processMethods = [
  '水洗处理', '日晒处理', '蜜处理', '厌氧发酵', '湿刨法',
];

export default function AddBatch() {
  const navigate = useNavigate();
  const { addBatch } = useBatchStore();

  const [origin, setOrigin] = useState('');
  const [processMethod, setProcessMethod] = useState('水洗处理');
  const [roastDate, setRoastDate] = useState(getTodayISO());
  const [openDate, setOpenDate] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [suggestedDays, setSuggestedDays] = useState(7);
  const [initialWeight, setInitialWeight] = useState(200);
  const [lowThreshold, setLowThreshold] = useState(30);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [customFlavor, setCustomFlavor] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const toggleFlavor = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter((f) => f !== flavor));
    } else {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const addCustomFlavor = () => {
    if (customFlavor.trim() && !selectedFlavors.includes(customFlavor.trim())) {
      setSelectedFlavors([...selectedFlavors, customFlavor.trim()]);
      setCustomFlavor('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim()) return;

    addBatch({
      origin: origin.trim(),
      processMethod,
      roastDate,
      openDate: isOpened ? (openDate || getTodayISO()) : null,
      suggestedDays,
      initialWeight,
      currentWeight: initialWeight,
      lowThreshold,
      photo,
      flavorTags: selectedFlavors,
      notes: notes.trim() || undefined,
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-coffee-600 hover:text-coffee-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回看板</span>
        </button>

        <div className="card p-6 md:p-8">
          <h1 className="text-2xl font-bold text-coffee-900 font-serif mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sunset-400 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            添加新批次
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-text">袋身照片（可选）</label>
              <div className="flex items-start gap-4">
                {photo ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-coffee-100">
                    <img
                      src={photo}
                      alt="袋身照片"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-coffee-200 flex flex-col items-center justify-center cursor-pointer hover:border-coffee-400 hover:bg-cream-50 transition-all">
                    <Upload size={28} className="text-coffee-300 mb-1" />
                    <span className="text-xs text-coffee-400">上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="label-text">产区名称 *</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="input-field"
                placeholder="如：埃塞俄比亚 耶加雪菲"
                required
              />
            </div>

            <div>
              <label className="label-text">处理法</label>
              <div className="flex flex-wrap gap-2">
                {processMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setProcessMethod(method)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      processMethod === method
                        ? 'bg-coffee-800 text-white'
                        : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">烘焙日期</label>
                <input
                  type="date"
                  value={roastDate}
                  onChange={(e) => setRoastDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">初始重量 (克)</label>
                <input
                  type="number"
                  value={initialWeight}
                  onChange={(e) => setInitialWeight(Number(e.target.value))}
                  min={1}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isOpened
                      ? 'bg-coffee-700 border-coffee-700'
                      : 'border-coffee-300'
                  }`}
                >
                  {isOpened && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-coffee-700 font-medium">已开封</span>
              </label>
              <input
                type="checkbox"
                checked={isOpened}
                onChange={(e) => setIsOpened(e.target.checked)}
                className="hidden"
              />
            </div>

            {isOpened && (
              <div>
                <label className="label-text">开封日期</label>
                <input
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  placeholder="今天"
                  className="input-field"
                />
                <p className="text-xs text-coffee-400 mt-1">
                  不填则默认为今天
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">建议养豆天数</label>
                <input
                  type="number"
                  value={suggestedDays}
                  onChange={(e) => setSuggestedDays(Number(e.target.value))}
                  min={1}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">低余量阈值 (克)</label>
                <input
                  type="number"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(Number(e.target.value))}
                  min={1}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label-text">风味标签</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonFlavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => toggleFlavor(flavor)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedFlavors.includes(flavor)
                        ? 'bg-coffee-700 text-white'
                        : 'bg-cream-100 text-coffee-600 hover:bg-cream-200'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFlavor}
                  onChange={(e) => setCustomFlavor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFlavor())}
                  className="input-field flex-1"
                  placeholder="自定义风味..."
                />
                <button
                  type="button"
                  onClick={addCustomFlavor}
                  className="btn-secondary px-4"
                >
                  添加
                </button>
              </div>

              {selectedFlavors.length > 0 && (
                <div className="mt-3 p-3 bg-cream-50 rounded-xl">
                  <p className="text-xs text-coffee-500 mb-2">已选标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlavors.map((flavor) => (
                      <span
                        key={flavor}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-coffee-700 text-white rounded-full text-xs font-medium"
                      >
                        {flavor}
                        <button
                          type="button"
                          onClick={() => toggleFlavor(flavor)}
                          className="hover:text-coffee-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="label-text">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="添加一些备注信息..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!origin.trim()}
                className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Coffee size={18} />
                添加批次
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
