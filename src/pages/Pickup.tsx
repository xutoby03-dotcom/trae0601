import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, Snowflake, Wine, AlertTriangle, User } from 'lucide-react';
import { usePackageStore } from '@/store/usePackageStore';
import { STATUS_LABELS } from '@/types';

export default function Pickup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pkg = usePackageStore((s) => s.packages.find((p) => p.id === id));
  const pickupPackage = usePackageStore((s) => s.pickupPackage);

  const [digits, setDigits] = useState(['', '', '', '']);
  const [tailVerified, setTailVerified] = useState(false);
  const [tailError, setTailError] = useState(false);
  const [signedBy, setSignedBy] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!pkg) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-warm-400" />
        </div>
        <p className="text-warm-500 text-sm mb-4">未找到该包裹</p>
        <Link to="/" className="text-sm text-primary-500 hover:underline">返回首页</Link>
      </div>
    );
  }

  if (pkg.status === 'picked_up') {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-check-pop">
          <Check className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-primary-800 mb-1">该包裹已签收</h3>
        {pkg.signedBy && (
          <p className="text-warm-500 text-sm mb-1">签收人：{pkg.signedBy}</p>
        )}
        <p className="text-warm-500 text-sm mb-4">
          {pkg.pickedUpAt && `签收时间: ${new Date(pkg.pickedUpAt).toLocaleString('zh-CN')}`}
        </p>
        <Link to="/" className="text-sm text-primary-500 hover:underline">返回首页</Link>
      </div>
    );
  }

  const handleDigitChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[idx] = val;
    setDigits(newDigits);
    setTailError(false);

    if (val && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      const phoneTail = newDigits.join('');
      const expectedTail = pkg.recipientPhone.slice(-4);
      if (phoneTail === expectedTail) {
        setTailVerified(true);
        setTimeout(() => nameInputRef.current?.focus(), 200);
      } else {
        setTailError(true);
        setTimeout(() => {
          setDigits(['', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 1200);
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    if (!tailVerified) return;
    if (!signedBy.trim()) {
      setShowNameError(true);
      return;
    }
    const phoneTail = digits.join('');
    const ok = pickupPackage(pkg.id, phoneTail, signedBy.trim());
    if (ok) setSuccess(true);
  };

  const resetTail = () => {
    setTailVerified(false);
    setDigits(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isOverdue = () => {
    const hours = (Date.now() - new Date(pkg.createdAt).getTime()) / 3600000;
    return pkg.isColdChain ? hours > 4 : hours > 48;
  };

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-check-pop">
          <Check className="w-9 h-9 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-primary-800 mb-2">签收成功！</h3>
        <p className="text-warm-500 text-sm mb-1">{signedBy} 已签收 {pkg.recipientName} 的包裹</p>
        <p className="text-warm-400 text-xs mb-6">{new Date().toLocaleString('zh-CN')}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-8 h-8 rounded-lg bg-white border border-warm-300/60 flex items-center justify-center hover:bg-warm-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-warm-500" />
        </Link>
        <h2 className="text-xl font-bold text-primary-800">取件签收</h2>
      </div>

      <div className={`bg-white rounded-xl border p-5 mb-6 ${
        pkg.isColdChain ? 'border-ice-300' : isOverdue() ? 'border-coral-300' : 'border-warm-300/50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold text-primary-800">{pkg.recipientName}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
            {pkg.department}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-warm-500">快递公司</span>
            <span className="text-primary-800 font-medium">{pkg.courierCompany}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-500">取件码</span>
            <span className="font-mono font-semibold text-primary-700">{pkg.pickupCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-500">货架位置</span>
            <span className="text-primary-800 font-medium">{pkg.shelfLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warm-500">状态</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-warm-100 text-warm-700 font-medium">
              {STATUS_LABELS[pkg.status]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {pkg.isColdChain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ice-50 text-ice-700 font-medium flex items-center gap-1">
              <Snowflake className="w-3 h-3" />
              冷藏件
            </span>
          )}
          {pkg.isFragile && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium flex items-center gap-1">
              <Wine className="w-3 h-3" />
              易碎
            </span>
          )}
          {isOverdue() && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-coral-50 text-coral-600 font-medium flex items-center gap-1 animate-pulse-slow">
              <AlertTriangle className="w-3 h-3" />
              超时
            </span>
          )}
        </div>

        {pkg.photos.length > 0 && (
          <div className="flex gap-2 mt-4">
            {pkg.photos.map((photo, idx) => (
              <img key={idx} src={photo} alt="" className="w-14 h-14 rounded-lg object-cover border border-warm-200" />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-warm-300/50 p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-primary-700">核验手机号尾号</h3>
            {tailVerified && (
              <button
                onClick={resetTail}
                type="button"
                className="text-xs text-primary-500 hover:underline"
              >
                重新输入
              </button>
            )}
          </div>
          <p className="text-xs text-warm-500 mb-4">请输入收件人手机号后4位进行身份核验</p>

          {!tailVerified ? (
            <>
              <div className="flex justify-center gap-3">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                      tailError
                        ? 'border-coral-400 bg-coral-50 text-coral-600'
                        : digit
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-warm-300 bg-warm-50 text-primary-700 focus:border-primary-400'
                    }`}
                  />
                ))}
              </div>

              {tailError && (
                <div className="text-center text-coral-600 text-sm font-medium animate-slide-in flex items-center justify-center gap-1.5 mt-3">
                  <X className="w-4 h-4" />
                  手机号尾号不匹配，请重新输入
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-emerald-700 font-medium">尾号核验通过</span>
            </div>
          )}
        </div>

        {tailVerified && (
          <div className="animate-slide-in border-t border-warm-200 pt-5">
            <label className="block text-sm font-semibold text-primary-700 mb-1">签收人姓名</label>
            <p className="text-xs text-warm-500 mb-3">请填写实际签收人的姓名</p>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <input
                ref={nameInputRef}
                type="text"
                value={signedBy}
                onChange={(e) => { setSignedBy(e.target.value); setShowNameError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="输入签收人姓名"
                className={`w-full pl-9 pr-3 py-2.5 bg-warm-50 border rounded-lg text-sm placeholder:text-warm-400 transition-colors ${
                  showNameError
                    ? 'border-coral-400 focus:border-coral-400'
                    : 'border-warm-300/60 focus:border-primary-400'
                }`}
              />
            </div>
            {showNameError && (
              <p className="text-coral-600 text-xs mt-1.5">请填写签收人姓名</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!signedBy.trim()}
              className="w-full mt-4 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认签收
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
