import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGearStore } from '../stores/useGearStore';
import { RainGearCard } from '../components/RainGearCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import type { LendDto, ReturnDto } from '../types';
import { LogOut, LogIn, User, MapPin, Clock, Sun, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDateTime, getDefaultReturnTime } from '../utils/date';

type Mode = 'lend' | 'return';

export function LendReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { gears, records, fetchAll, lendGear, returnGear, updateGear, loading } = useGearStore();
  const [mode, setMode] = useState<Mode>((searchParams.get('mode') as Mode) || 'lend');
  const [selectedGear, setSelectedGear] = useState<string | null>(searchParams.get('gearId'));
  const [showLendForm, setShowLendForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showDryConfirm, setShowDryConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [lendForm, setLendForm] = useState<LendDto>({
    borrower: '',
    destination: '',
    expectedReturnTime: getDefaultReturnTime(),
  });

  const [returnForm, setReturnForm] = useState<ReturnDto>({
    isDry: true,
    hasNewDamage: false,
    returnNote: '',
  });

  const [dryConfirmForm, setDryConfirmForm] = useState({
    hasNewDamage: false,
    damageNote: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const urlMode = searchParams.get('mode') as Mode;
    if (urlMode) {
      setMode(urlMode);
    }
    const gearId = searchParams.get('gearId');
    if (gearId && gears.length > 0) {
      setSelectedGear(gearId);
      const gear = gears.find((g) => g.id === gearId);
      if (gear?.status === 'drying') {
        setShowDryConfirm(true);
      } else if (urlMode === 'lend') {
        setShowLendForm(true);
      } else if (urlMode === 'return') {
        setShowReturnForm(true);
      }
    }
  }, [searchParams, gears]);

  const availableGears = gears.filter((g) => g.status === 'in_cabinet');
  const lentGears = gears.filter((g) => g.status === 'lent');
  const dryingGears = gears.filter((g) => g.status === 'drying');
  const returnDisplayGears = [...lentGears, ...dryingGears];
  const displayGears = mode === 'lend' ? availableGears : returnDisplayGears;

  const getActiveRecord = (gearId: string) => {
    return records.find((r) => r.gearId === gearId && r.status === 'active');
  };

  const validateLendForm = () => {
    const errors: Record<string, string> = {};
    if (!lendForm.borrower.trim()) errors.borrower = '请填写借用人';
    if (!lendForm.destination.trim()) errors.destination = '请填写目的地';
    if (!lendForm.expectedReturnTime) errors.expectedReturnTime = '请选择预计归还时间';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLend = async () => {
    if (!selectedGear || !validateLendForm()) return;

    const result = await lendGear(selectedGear, lendForm);
    if (result) {
      setSuccessMessage('借出登记成功！');
      setShowLendForm(false);
      setSelectedGear(null);
      setLendForm({ borrower: '', destination: '', expectedReturnTime: getDefaultReturnTime() });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleReturn = async () => {
    if (!selectedGear) return;

    const result = await returnGear(selectedGear, returnForm);
    if (result) {
      let message = '归还登记成功！';
      if (!returnForm.isDry) {
        message = '已标记为待晾干，晾干后请再次确认入柜。';
      }
      if (returnForm.hasNewDamage) {
        message = '归还登记成功！已标记为破损，请及时维修。';
      }
      setSuccessMessage(message);
      setShowReturnForm(false);
      setSelectedGear(null);
      setReturnForm({ isDry: true, hasNewDamage: false, returnNote: '' });
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDryConfirm = async () => {
    if (!selectedGear) return;

    const result = await updateGear(selectedGear, {
      status: 'in_cabinet',
      isDamaged: dryConfirmForm.hasNewDamage,
    });
    if (result) {
      let message = '入柜登记成功！雨具已归位。';
      if (dryConfirmForm.hasNewDamage) {
        message = '入柜登记成功！已标记为破损，请及时维修。';
      }
      setSuccessMessage(message);
      setShowDryConfirm(false);
      setSelectedGear(null);
      setDryConfirmForm({ hasNewDamage: false, damageNote: '' });
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/statistics');
      }, 2000);
    }
  };

  const selectedGearData = gears.find((g) => g.id === selectedGear);
  const activeRecord = selectedGear ? getActiveRecord(selectedGear) : null;

  if (loading && gears.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">借出归还</h1>
        <p className="text-slate-500">登记雨具的借出和归还</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200/50 flex animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => setMode('lend')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            mode === 'lend'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <LogOut className="w-5 h-5" />
          借出登记
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
            {availableGears.length}
          </span>
        </button>
        <button
          onClick={() => setMode('return')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            mode === 'return'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
              : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <LogIn className="w-5 h-5" />
          归还登记
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
            {lentGears.length + dryingGears.length}
          </span>
        </button>
      </div>

      {mode === 'lend' && activeRecord && selectedGearData && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
          <h3 className="font-semibold text-purple-800 mb-4">正在借出</h3>
          <div className="flex items-center gap-4">
            <img
              src={selectedGearData.photoUrl}
              alt={selectedGearData.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">{selectedGearData.name}</h4>
              <p className="text-sm text-slate-600 mt-1">
                借用人：{activeRecord.borrower} · 目的地：{activeRecord.destination}
              </p>
            </div>
            <StatusBadge status={selectedGearData.status} />
          </div>
        </div>
      )}

      {displayGears.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            {mode === 'lend' ? <LogOut className="w-8 h-8 text-slate-400" /> : <LogIn className="w-8 h-8 text-slate-400" />}
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            {mode === 'lend' ? '暂无可借出的雨具' : '暂无需要归还的雨具'}
          </h3>
          <p className="text-slate-500">
            {mode === 'lend' ? '所有雨具都已借出或待晾干' : '所有雨具都已归还'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
            {mode === 'lend' ? `可借出的雨具 (${displayGears.length})` : `借出中的雨具 (${displayGears.length})`}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayGears.map((gear, index) => {
              const record = getActiveRecord(gear.id);
              return (
                <div
                  key={gear.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div onClick={() => {
                    setSelectedGear(gear.id);
                    if (mode === 'lend') {
                      setShowLendForm(true);
                    } else if (gear.status === 'drying') {
                      setShowDryConfirm(true);
                    } else {
                      setShowReturnForm(true);
                    }
                  }}>
                    <RainGearCard
                      gear={gear}
                      selected={selectedGear === gear.id}
                      showFrequency
                    />
                  </div>
                  {mode === 'return' && gear.status === 'drying' && (
                    <div className="mt-2 p-3 bg-orange-50 rounded-xl text-sm">
                      <div className="flex items-center gap-2 text-orange-700 mb-1">
                        <Sun className="w-4 h-4" />
                        <span className="font-medium">待晾干</span>
                      </div>
                      <p className="text-orange-600 text-xs">晾干后点击确认入柜</p>
                    </div>
                  )}
                  {mode === 'return' && gear.status === 'lent' && !record && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl text-sm">
                      <div className="flex items-center gap-2 text-amber-700 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">无借出记录</span>
                      </div>
                      <p className="text-amber-600 text-xs">状态异常，点击查看详情</p>
                    </div>
                  )}
                  {record && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-xl text-sm">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <User className="w-4 h-4" />
                        <span>{record.borrower}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <MapPin className="w-4 h-4" />
                        <span>{record.destination}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        isOpen={showLendForm}
        onClose={() => {
          setShowLendForm(false);
          setSelectedGear(null);
          setFormErrors({});
        }}
        title="借出登记"
      >
        {selectedGearData && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <img
                src={selectedGearData.photoUrl}
                alt={selectedGearData.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-semibold text-slate-900">{selectedGearData.name}</h3>
                <p className="text-sm text-slate-600">{selectedGearData.location}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                借用人 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={lendForm.borrower}
                  onChange={(e) => setLendForm({ ...lendForm, borrower: e.target.value })}
                  placeholder="例如：爸爸、妈妈、孩子"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
                    formErrors.borrower ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  )}
                />
              </div>
              {formErrors.borrower && <p className="mt-1 text-sm text-red-500">{formErrors.borrower}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                目的地 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={lendForm.destination}
                  onChange={(e) => setLendForm({ ...lendForm, destination: e.target.value })}
                  placeholder="例如：公司、学校、超市"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
                    formErrors.destination ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  )}
                />
              </div>
              {formErrors.destination && <p className="mt-1 text-sm text-red-500">{formErrors.destination}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                预计归还时间 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="datetime-local"
                  value={lendForm.expectedReturnTime}
                  onChange={(e) => setLendForm({ ...lendForm, expectedReturnTime: e.target.value })}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
                    formErrors.expectedReturnTime ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  )}
                />
              </div>
              {formErrors.expectedReturnTime && <p className="mt-1 text-sm text-red-500">{formErrors.expectedReturnTime}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowLendForm(false);
                  setSelectedGear(null);
                  setFormErrors({});
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={handleLend} className="flex-1 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500">
                <LogOut className="w-4 h-4 mr-1.5" />
                确认借出
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showReturnForm}
        onClose={() => {
          setShowReturnForm(false);
          setSelectedGear(null);
        }}
        title="归还登记"
      >
        {selectedGearData && activeRecord && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <img
                src={selectedGearData.photoUrl}
                alt={selectedGearData.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{selectedGearData.name}</h3>
                <p className="text-sm text-slate-600">
                  借用人：{activeRecord.borrower} · {formatDateTime(activeRecord.lendTime)} 借出
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                是否已晾干？
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, isDry: true })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    returnForm.isDry
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">已晾干</span>
                  <span className="text-xs opacity-70">可以直接入柜</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, isDry: false })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    !returnForm.isDry
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <XCircle className="w-6 h-6" />
                  <span className="font-medium">未晾干</span>
                  <span className="text-xs opacity-70">需要先晾干</span>
                </button>
              </div>
              {!returnForm.isDry && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
                  <Sun className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-700">
                    湿雨具不能直接入柜，将标记为"待晾干"状态。晾干后请再次操作确认入柜。
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                是否有新的损坏？
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, hasNewDamage: false })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    !returnForm.hasNewDamage
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">无损坏</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReturnForm({ ...returnForm, hasNewDamage: true })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    returnForm.hasNewDamage
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-medium">有损坏</span>
                </button>
              </div>
              {returnForm.hasNewDamage && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    损坏说明
                  </label>
                  <textarea
                    value={returnForm.returnNote}
                    onChange={(e) => setReturnForm({ ...returnForm, returnNote: e.target.value })}
                    placeholder="请描述损坏情况..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReturnForm(false);
                  setSelectedGear(null);
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={handleReturn} className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500">
                <LogIn className="w-4 h-4 mr-1.5" />
                确认归还
              </Button>
            </div>
          </div>
        )}
        {selectedGearData && !activeRecord && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <img
                src={selectedGearData.photoUrl}
                alt={selectedGearData.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{selectedGearData.name}</h3>
                <p className="text-sm text-amber-700 mt-1">
                  状态为"借出中"，但未找到对应的借出记录
                </p>
              </div>
              <StatusBadge status={selectedGearData.status} />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">状态异常</p>
                <p className="text-sm text-amber-600 mt-1">
                  该雨具标记为借出中，但系统中找不到对应的借出记录。可能是数据不同步导致的。
                  你可以将其直接标记为"待晾干"（如果雨具是湿的），或"已入柜"（如果雨具已回到原位）。
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    if (!selectedGear) return;
                    await updateGear(selectedGear, { status: 'drying' });
                    setSuccessMessage('已标记为待晾干，晾干后请确认入柜。');
                    setShowReturnForm(false);
                    setSelectedGear(null);
                    setTimeout(() => {
                      setSuccessMessage(null);
                      navigate('/statistics');
                    }, 1500);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                >
                  <Sun className="w-4 h-4 mr-1.5" />
                  标记待晾干
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedGear) return;
                    await updateGear(selectedGear, { status: 'in_cabinet' });
                    setSuccessMessage('已标记为入柜，雨具归位完成。');
                    setShowReturnForm(false);
                    setSelectedGear(null);
                    setTimeout(() => {
                      setSuccessMessage(null);
                      navigate('/statistics');
                    }, 1500);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  <Package className="w-4 h-4 mr-1.5" />
                  直接入柜
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowReturnForm(false);
                    setSelectedGear(null);
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowReturnForm(false);
                    setSelectedGear(null);
                    navigate('/statistics');
                  }}
                  className="flex-1"
                >
                  返回统计页
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDryConfirm}
        onClose={() => {
          setShowDryConfirm(false);
          setSelectedGear(null);
        }}
        title="晾干确认入柜"
      >
        {selectedGearData && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <img
                src={selectedGearData.photoUrl}
                alt={selectedGearData.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{selectedGearData.name}</h3>
                <p className="text-sm text-slate-600">{selectedGearData.location}</p>
              </div>
              <StatusBadge status={selectedGearData.status} />
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <Sun className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">雨具已晾干</p>
                <p className="text-sm text-green-600 mt-1">
                  确认雨具已经晾干，可以放入柜中。请检查是否有损坏。
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                是否有损坏？
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDryConfirmForm({ ...dryConfirmForm, hasNewDamage: false })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    !dryConfirmForm.hasNewDamage
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">无损坏</span>
                  <span className="text-xs opacity-70">完好可正常使用</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDryConfirmForm({ ...dryConfirmForm, hasNewDamage: true })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    dryConfirmForm.hasNewDamage
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  )}
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-medium">有损坏</span>
                  <span className="text-xs opacity-70">需要维修</span>
                </button>
              </div>
              {dryConfirmForm.hasNewDamage && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    损坏说明
                  </label>
                  <textarea
                    value={dryConfirmForm.damageNote}
                    onChange={(e) => setDryConfirmForm({ ...dryConfirmForm, damageNote: e.target.value })}
                    placeholder="请描述损坏情况..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDryConfirm(false);
                  setSelectedGear(null);
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={handleDryConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">
                <Package className="w-4 h-4 mr-1.5" />
                确认入柜
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
