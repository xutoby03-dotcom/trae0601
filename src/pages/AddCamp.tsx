import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampStore } from '@/store/campStore';
import type { WaterSource, ToiletType, PhoneSignal, RiskLevel, RiskItemKey } from '@/types';
import { RISK_ITEM_KEYS, RISK_ITEM_LABELS, WATER_SOURCE_LABELS, TOILET_LABELS, PHONE_SIGNAL_LABELS } from '@/types';
import { ArrowLeft, Check, Mountain, Droplets, Bath, Car, Flame, Signal, Cloud, Wind, MountainSnow, Waves, Bug, Dog, Flashlight, Route, Camera } from 'lucide-react';

const RISK_ICONS: Record<RiskItemKey, React.ReactNode> = {
  weatherRisk: <Cloud className="w-4 h-4" />,
  windRisk: <Wind className="w-4 h-4" />,
  rockfallRisk: <MountainSnow className="w-4 h-4" />,
  floodRisk: <Waves className="w-4 h-4" />,
  insectRisk: <Bug className="w-4 h-4" />,
  wildDogRisk: <Dog className="w-4 h-4" />,
  lightingRisk: <Flashlight className="w-4 h-4" />,
  escapeRisk: <Route className="w-4 h-4" />,
};

const waterSources: WaterSource[] = ['none', 'stream', 'lake', 'tap'];
const toiletTypes: ToiletType[] = ['none', 'simple', 'standard'];
const phoneSignals: PhoneSignal[] = ['none', 'weak', 'medium', 'strong'];
const riskLevels: RiskLevel[] = ['low', 'medium', 'high'];

const riskLevelConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  low: { label: '低', color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  medium: { label: '中', color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  high: { label: '高', color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

export default function AddCamp() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { addCamp, updateCamp, getCampById, getAssessmentByCampId } = useCampStore();

  const existingCamp = id ? getCampById(id) : undefined;
  const existingAssessment = id ? getAssessmentByCampId(id) : undefined;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(existingCamp?.name ?? '');
  const [location, setLocation] = useState(existingCamp?.location ?? '');
  const [altitude, setAltitude] = useState(existingCamp?.altitude ?? 0);
  const [waterSource, setWaterSource] = useState<WaterSource>(existingCamp?.waterSource ?? 'none');
  const [toilet, setToilet] = useState<ToiletType>(existingCamp?.toilet ?? 'none');
  const [parkingDistance, setParkingDistance] = useState(existingCamp?.parkingDistance ?? 0);
  const [fireAllowed, setFireAllowed] = useState(existingCamp?.fireAllowed ?? true);
  const [phoneSignal, setPhoneSignal] = useState<PhoneSignal>(existingCamp?.phoneSignal ?? 'medium');
  const [risks, setRisks] = useState<Record<RiskItemKey, RiskLevel>>(() => {
    if (existingAssessment) {
      const r = {} as Record<RiskItemKey, RiskLevel>;
      RISK_ITEM_KEYS.forEach((k) => { r[k] = existingAssessment[k]; });
      return r;
    }
    return {
      weatherRisk: 'low',
      windRisk: 'low',
      rockfallRisk: 'low',
      floodRisk: 'low',
      insectRisk: 'low',
      wildDogRisk: 'low',
      lightingRisk: 'low',
      escapeRisk: 'low',
    };
  });
  const [photos, setPhotos] = useState<string[]>(existingCamp?.photos ?? []);

  const steps = ['基本信息', '风险评估', '营地照片'];

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
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isEdit && id) {
      updateCamp(id, {
        name,
        location,
        altitude,
        waterSource,
        toilet,
        parkingDistance,
        fireAllowed,
        phoneSignal,
        photos,
      }, risks);
      navigate(`/camp/${id}`);
    } else {
      const campId = addCamp({
        name,
        location,
        altitude,
        waterSource,
        toilet,
        parkingDistance,
        fireAllowed,
        phoneSignal,
        photos,
      }, risks);
      navigate(`/camp/${campId}`);
    }
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
      <header className="border-b border-emerald-800/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-emerald-800/40 transition-colors text-emerald-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-emerald-100">{isEdit ? '编辑营地' : '添加营地'}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 flex-1 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-white/10 text-emerald-600'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-emerald-400 hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-emerald-600' : 'bg-emerald-800/50'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-1.5">营地名称 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 碧水湾营地"
                className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500/60 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-1.5">位置</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 四川省阿坝州理县"
                className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500/60 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-1.5">
                  <Mountain className="w-3.5 h-3.5" /> 海拔 (米)
                </label>
                <input
                  type="number"
                  value={altitude || ''}
                  onChange={(e) => setAltitude(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500/60 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-1.5">
                  <Car className="w-3.5 h-3.5" /> 停车距离 (米)
                </label>
                <input
                  type="number"
                  value={parkingDistance || ''}
                  onChange={(e) => setParkingDistance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500/60 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-2">
                <Droplets className="w-3.5 h-3.5" /> 水源
              </label>
              <div className="flex gap-2">
                {waterSources.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => setWaterSource(ws)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      waterSource === ws
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                        : 'bg-emerald-900/20 text-emerald-600 border border-emerald-800/30 hover:bg-emerald-900/40'
                    }`}
                  >
                    {WATER_SOURCE_LABELS[ws]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-2">
                <Bath className="w-3.5 h-3.5" /> 厕所
              </label>
              <div className="flex gap-2">
                {toiletTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setToilet(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      toilet === t
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                        : 'bg-emerald-900/20 text-emerald-600 border border-emerald-800/30 hover:bg-emerald-900/40'
                    }`}
                  >
                    {TOILET_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-2">
                <Signal className="w-3.5 h-3.5" /> 手机信号
              </label>
              <div className="flex gap-2">
                {phoneSignals.map((ps) => (
                  <button
                    key={ps}
                    onClick={() => setPhoneSignal(ps)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      phoneSignal === ps
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                        : 'bg-emerald-900/20 text-emerald-600 border border-emerald-800/30 hover:bg-emerald-900/40'
                    }`}
                  >
                    {PHONE_SIGNAL_LABELS[ps]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-2">
                <Flame className="w-3.5 h-3.5" /> 能否生火
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFireAllowed(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    fireAllowed
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                      : 'bg-emerald-900/20 text-emerald-600 border border-emerald-800/30 hover:bg-emerald-900/40'
                  }`}
                >
                  可生火
                </button>
                <button
                  onClick={() => setFireAllowed(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !fireAllowed
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-emerald-900/20 text-emerald-600 border border-emerald-800/30 hover:bg-emerald-900/40'
                  }`}
                >
                  禁止生火
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {RISK_ITEM_KEYS.map((key) => {
              const config = riskLevelConfig[risks[key]];
              return (
                <div key={key} className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 text-sm text-emerald-200">
                      {RISK_ICONS[key]}
                      <span className="font-medium">{RISK_ITEM_LABELS[key]}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {riskLevels.map((level) => {
                      const lc = riskLevelConfig[level];
                      return (
                        <button
                          key={level}
                          onClick={() => setRisks((prev) => ({ ...prev, [key]: level }))}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            risks[key] === level
                              ? `${lc.bg} ${lc.color} border ${lc.border}`
                              : 'bg-emerald-900/10 text-emerald-700 border border-transparent hover:bg-emerald-900/20'
                          }`}
                        >
                          {lc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-300 mb-2">
                <Camera className="w-3.5 h-3.5" /> 营地照片
              </label>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-emerald-700/30">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-emerald-700/40 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors bg-emerald-900/10">
                  <Camera className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-xs text-emerald-600">添加照片</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-emerald-800/30">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="px-4 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-800/40 transition-colors border border-emerald-700/30"
          >
            {step > 0 ? '上一步' : '取消'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEdit ? '保存修改' : '创建营地'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
