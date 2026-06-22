import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Compass from './components/Compass';
import ObservationForm from './components/ObservationForm';
import RiskAlert from './components/RiskAlert';
import MovementPanel from './components/MovementPanel';
import RecordList from './components/RecordList';
import {
  LightningRecord,
  LightningType,
  BrightnessLevel,
  RainIntensity,
  CardinalDirection,
  estimateDistance,
  getRiskLevel,
} from './types';

const STORAGE_KEY = 'lightning_observation_records_v1';

const App: React.FC = () => {
  const [records, setRecords] = useState<LightningRecord[]>([]);

  const [observationPoint, setObservationPoint] = useState<string>('');
  const [viewDirection, setViewDirection] = useState<CardinalDirection>('S');
  const [lightningAzimuth, setLightningAzimuth] = useState<number | null>(null);
  const [lightningType, setLightningType] = useState<LightningType>('cloud-to-ground');
  const [brightness, setBrightness] = useState<BrightnessLevel>(3);
  const [thunderDelaySeconds, setThunderDelaySeconds] = useState<number | null>(null);
  const [rainIntensity, setRainIntensity] = useState<RainIntensity>('moderate');

  const [showFlash, setShowFlash] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecords(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load records from storage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save records to storage', e);
    }
  }, [records]);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const estimatedDistance = useMemo(() => {
    return thunderDelaySeconds !== null ? estimateDistance(thunderDelaySeconds) : null;
  }, [thunderDelaySeconds]);

  const isValid = useMemo(() => {
    return (
      observationPoint.trim() !== '' &&
      lightningAzimuth !== null &&
      thunderDelaySeconds !== null &&
      thunderDelaySeconds > 0
    );
  }, [observationPoint, lightningAzimuth, thunderDelaySeconds]);

  const latestRecord = useMemo(() => {
    if (records.length === 0) return null;
    return [...records].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [records]);

  const handleSubmit = useCallback(() => {
    if (!isValid || lightningAzimuth === null || thunderDelaySeconds === null) return;

    const dist = estimateDistance(thunderDelaySeconds);
    const risk = getRiskLevel(dist);

    const newRecord: LightningRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      observationPoint: observationPoint.trim(),
      viewDirection,
      lightningAzimuth,
      lightningType,
      brightness,
      thunderDelaySeconds,
      rainIntensity,
      estimatedDistanceKm: dist,
      riskLevel: risk,
    };

    setRecords(prev => [...prev, newRecord]);

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);

    setLightningAzimuth(null);
    setThunderDelaySeconds(null);
  }, [isValid, lightningAzimuth, thunderDelaySeconds, observationPoint, viewDirection, lightningType, brightness, rainIntensity]);

  const handleReset = useCallback(() => {
    setLightningAzimuth(null);
    setLightningType('cloud-to-ground');
    setBrightness(3);
    setThunderDelaySeconds(null);
    setRainIntensity('moderate');
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleDeleteMultiple = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setRecords(prev => prev.filter(r => !idSet.has(r.id)));
  }, []);

  const handleAzimuthSelect = useCallback((azimuth: number) => {
    setLightningAzimuth(azimuth);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {showFlash && (
        <div className="fixed inset-0 bg-yellow-200/30 pointer-events-none z-50 animate-flash" />
      )}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-storm-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-pulse">⛈️</div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    雷雨闪电观测站
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    记录闪电方位、雷声延迟，追踪雷雨移动，守护安全
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-700/50">
                  <span className="text-slate-500">当前时间</span>
                  <span className="text-slate-200 font-mono ml-2 font-medium">
                    {new Date().toLocaleString('zh-CN', { hour12: false })}
                  </span>
                </div>
                <div className="bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-700/50">
                  <span className="text-slate-500">已记录</span>
                  <span className="text-storm-400 font-bold ml-2 text-lg">{records.length}</span>
                  <span className="text-slate-500 ml-1">次</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ObservationForm
              observationPoint={observationPoint}
              setObservationPoint={setObservationPoint}
              viewDirection={viewDirection}
              setViewDirection={setViewDirection}
              lightningAzimuth={lightningAzimuth}
              setLightningAzimuth={setLightningAzimuth}
              lightningType={lightningType}
              setLightningType={setLightningType}
              brightness={brightness}
              setBrightness={setBrightness}
              thunderDelaySeconds={thunderDelaySeconds}
              setThunderDelaySeconds={setThunderDelaySeconds}
              rainIntensity={rainIntensity}
              setRainIntensity={setRainIntensity}
              onSubmit={handleSubmit}
              onReset={handleReset}
              estimatedDistance={estimatedDistance}
              isValid={isValid}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
                <span className="text-2xl">🧭</span>
                闪电方位罗盘
                {lightningAzimuth !== null && (
                  <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 ml-auto">
                    待记录: {lightningAzimuth}°
                  </span>
                )}
              </h2>
              <Compass
                records={records}
                viewDirection={viewDirection}
                onAzimuthSelect={handleAzimuthSelect}
              />
              <p className="text-xs text-slate-500 text-center mt-4 px-4">
                💡 在罗盘图上任意位置点击可快速设置闪电方位
              </p>
            </div>

            <RiskAlert latestRecord={latestRecord} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <MovementPanel records={records} />
          </div>
        </main>

        <section className="mt-6">
          <RecordList
            records={records}
            onDelete={handleDeleteRecord}
            onDeleteMultiple={handleDeleteMultiple}
          />
        </section>

        <footer className="mt-10 pb-6 text-center">
          <div className="card p-5">
            <div className="text-xs text-slate-500 space-y-1">
              <p>
                ⚡ <strong>数据说明</strong>：距离估算基于声速 343m/s（约 3 秒/公里），实际受温度、湿度、地形影响
              </p>
              <p>
                🛡️ <strong>安全第一</strong>：距离 {'< 1km'} 极度危险！立即进入建筑物内部，远离门窗和电器
              </p>
              <p>
                💾 记录自动保存在浏览器本地存储中，刷新页面不会丢失
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
