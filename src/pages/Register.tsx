import { useState, useRef } from 'react';
import { Camera, Trash2, Snowflake, Wine, Check, ArrowLeft } from 'lucide-react';
import { usePackageStore } from '@/store/usePackageStore';
import { DEPARTMENTS, COURIER_COMPANIES } from '@/types';

export default function Register() {
  const addPackage = usePackageStore((s) => s.addPackage);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [courierCompany, setCourierCompany] = useState(COURIER_COMPANIES[0]);
  const [customCourier, setCustomCourier] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [shelfLocation, setShelfLocation] = useState('');
  const [isFragile, setIsFragile] = useState(false);
  const [isColdChain, setIsColdChain] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientPhone.trim() || !pickupCode.trim()) return;

    addPackage({
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      department,
      courierCompany: courierCompany === '其他' ? customCourier.trim() : courierCompany,
      pickupCode: pickupCode.trim(),
      shelfLocation: shelfLocation.trim(),
      isFragile,
      isColdChain,
      photos,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);

    setRecipientName('');
    setRecipientPhone('');
    setPickupCode('');
    setShelfLocation('');
    setIsFragile(false);
    setIsColdChain(false);
    setPhotos([]);
    setCustomCourier('');
  };

  const finalCourier = courierCompany === '其他' ? customCourier : courierCompany;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/" className="w-8 h-8 rounded-lg bg-white border border-warm-300/60 flex items-center justify-center hover:bg-warm-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-warm-500" />
        </a>
        <h2 className="text-xl font-bold text-primary-800">录入包裹</h2>
      </div>

      {showSuccess && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center gap-3 animate-slide-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center animate-check-pop">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-emerald-700 text-sm font-medium">包裹录入成功！</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-warm-300/50 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-700 mb-1">基础信息</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">收件人姓名 *</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="输入姓名"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">手机号 *</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="11位手机号"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">部门</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm focus:border-primary-400"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">快递公司</label>
              <select
                value={courierCompany}
                onChange={(e) => setCourierCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm focus:border-primary-400"
              >
                {COURIER_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {courierCompany === '其他' && (
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">自定义快递公司</label>
              <input
                type="text"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                placeholder="输入快递公司名称"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">取件码 *</label>
              <input
                type="text"
                value={pickupCode}
                onChange={(e) => setPickupCode(e.target.value)}
                placeholder="输入取件码"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm font-mono placeholder:text-warm-400 focus:border-primary-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-500 mb-1.5">货架位置</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="如 A-01"
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-300/60 rounded-lg text-sm placeholder:text-warm-400 focus:border-primary-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-300/50 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-700">特殊标记</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsFragile(!isFragile)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all flex-1 ${
                isFragile
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-warm-300/60 bg-warm-50 text-warm-500 hover:border-orange-200'
              }`}
            >
              <Wine className="w-4 h-4" />
              <span className="text-sm font-medium">易碎</span>
            </button>
            <button
              type="button"
              onClick={() => setIsColdChain(!isColdChain)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all flex-1 ${
                isColdChain
                  ? 'border-ice-300 bg-ice-50 text-ice-700'
                  : 'border-warm-300/60 bg-warm-50 text-warm-500 hover:border-ice-200'
              }`}
            >
              <Snowflake className="w-4 h-4" />
              <span className="text-sm font-medium">冷藏</span>
            </button>
          </div>
          {isColdChain && (
            <p className="text-xs text-ice-600 bg-ice-50 rounded-lg px-3 py-2">
              ⚠ 冷藏件将在 4 小时后标记为超时，请优先提醒收件人取件
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-warm-300/50 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary-700">拍照存档</h3>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-warm-300/60">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-coral-500 text-white flex items-center justify-center hover:bg-coral-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-warm-300 flex flex-col items-center justify-center gap-1 text-warm-400 hover:border-primary-300 hover:text-primary-400 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="text-xs">添加</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={!recipientName.trim() || !recipientPhone.trim() || !pickupCode.trim() || !finalCourier.trim()}
          className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          提交录入
        </button>
      </form>
    </div>
  );
}
