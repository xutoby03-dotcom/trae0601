import { useState } from 'react';
import { Clock, Cog } from 'lucide-react';
import { useCalibrationStore } from '@/store/calibrationStore';
import ParameterInput from '@/components/ParameterInput';
import OscillationCurve from '@/components/OscillationCurve';
import AnomalyPanel from '@/components/AnomalyPanel';
import AdjustmentComparison from '@/components/AdjustmentComparison';
import StabilityReport from '@/components/StabilityReport';

export default function CalibrationPage() {
  const { session, report, activeRecordId, createSession, addRecord, setActiveRecord, generateReport, resetSession } =
    useCalibrationStore();
  const [clockName, setClockName] = useState('');
  const [clockModel, setClockModel] = useState('');

  const activeRecord = session?.records.find((r) => r.id === activeRecordId) || session?.records[session.records.length - 1];
  const currentAnomalies = session?.anomalies.filter((a) => a.recordId === (activeRecord?.id || '')) || [];

  const handleNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockName.trim()) return;
    createSession(clockName.trim(), clockModel.trim());
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0D0B08] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[rgba(212,168,71,0.3)] mb-4 bg-[rgba(212,168,71,0.05)]">
              <Clock size={36} className="text-[#D4A847]" />
            </div>
            <h1 className="text-3xl font-serif text-[#D4A847] tracking-[0.2em] mb-2">擒纵节拍调校</h1>
            <p className="text-sm text-[rgba(245,240,232,0.35)] font-serif">机械钟走时精度记录系统</p>
          </div>

          <form onSubmit={handleNewSession} className="space-y-4 bg-[#1A1612] rounded-xl p-6 border border-[rgba(212,168,71,0.15)]">
            <div>
              <label className="block text-xs text-[rgba(212,168,71,0.7)] mb-1 font-serif tracking-wide">钟表名称 *</label>
              <input
                type="text"
                value={clockName}
                onChange={(e) => setClockName(e.target.value)}
                placeholder="如：上海7120台钟"
                className="w-full bg-[#0D0B08] border border-[rgba(212,168,71,0.25)] rounded-lg px-3 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A847] focus:ring-1 focus:ring-[rgba(212,168,71,0.3)] placeholder:text-[rgba(245,240,232,0.2)]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-[rgba(212,168,71,0.7)] mb-1 font-serif tracking-wide">机芯型号</label>
              <input
                type="text"
                value={clockModel}
                onChange={(e) => setClockModel(e.target.value)}
                placeholder="如：统一机芯"
                className="w-full bg-[#0D0B08] border border-[rgba(212,168,71,0.25)] rounded-lg px-3 py-2.5 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A847] focus:ring-1 focus:ring-[rgba(212,168,71,0.3)] placeholder:text-[rgba(245,240,232,0.2)]"
              />
            </div>
            <button
              type="submit"
              disabled={!clockName.trim()}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#8B6914] to-[#D4A847] text-[#1A1612] font-serif text-sm font-semibold tracking-wider hover:from-[#D4A847] hover:to-[#8B6914] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[rgba(212,168,71,0.15)]"
            >
              开始调校
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-[rgba(245,240,232,0.15)]">
              <Cog size={10} className="inline mr-1" />
              滴答之间，毫厘必争
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B08] text-[#F5F0E8]">
      <header className="sticky top-0 z-20 bg-[rgba(13,11,8,0.92)] backdrop-blur-md border-b border-[rgba(212,168,71,0.12)]">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-[#D4A847]" />
            <div>
              <h1 className="text-sm font-serif text-[#D4A847] tracking-widest">{session.clockName}</h1>
              {session.clockModel && (
                <p className="text-[10px] text-[rgba(245,240,232,0.3)]">{session.clockModel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[rgba(245,240,232,0.3)]">
            <span>{session.records.length} 次调校</span>
            <span>·</span>
            <span>{session.anomalies.length} 项异常</span>
            <span>·</span>
            <span>{new Date(session.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <ParameterInput onSubmit={(params) => addRecord(params)} />
            </div>

            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <StabilityReport
                report={report}
                onGenerate={generateReport}
                onReset={resetSession}
                recordCount={session.records.length}
              />
            </div>
          </aside>

          <section className="lg:col-span-6 space-y-4">
            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#D4A847] animate-pulse" />
                <h2 className="text-sm font-serif text-[#D4A847] tracking-widest">滴答间隔摆动曲线</h2>
              </div>
              <div className="h-[300px]">
                <OscillationCurve
                  ticks={activeRecord?.tickIntervals || []}
                  anomalies={currentAnomalies}
                />
              </div>
            </div>

            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <AdjustmentComparison records={session.records} />
            </div>
          </section>

          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <AnomalyPanel anomalies={currentAnomalies} />
            </div>

            {session.records.length > 1 && (
              <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
                <h3 className="text-xs font-serif text-[rgba(212,168,71,0.6)] tracking-wider mb-3">历史记录</h3>
                <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {session.records.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveRecord(r.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                        activeRecordId === r.id
                          ? 'bg-[rgba(212,168,71,0.12)] text-[#D4A847]'
                          : 'text-[rgba(245,240,232,0.4)] hover:bg-[rgba(212,168,71,0.05)]'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>第{i + 1}次</span>
                        <span className="font-mono">{r.hourlyError > 0 ? '+' : ''}{r.hourlyError.toFixed(1)}s/h</span>
                      </div>
                      <div className="text-[10px] text-[rgba(245,240,232,0.2)] mt-0.5">
                        {new Date(r.recordTime).toLocaleTimeString('zh-CN')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#1A1612] rounded-xl p-4 border border-[rgba(212,168,71,0.12)]">
              <h3 className="text-xs font-serif text-[rgba(212,168,71,0.6)] tracking-wider mb-2">当前参数</h3>
              {activeRecord ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[rgba(245,240,232,0.35)]">摆长</span>
                    <span className="font-mono text-[rgba(245,240,232,0.6)]">{activeRecord.pendulumLength}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(245,240,232,0.35)]">擒纵叉位</span>
                    <span className="font-mono text-[rgba(245,240,232,0.6)]">{activeRecord.escapementPosition}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(245,240,232,0.35)]">上弦程度</span>
                    <span className="font-mono text-[rgba(245,240,232,0.6)]">{activeRecord.windingDegree}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(245,240,232,0.35)]">测试时长</span>
                    <span className="font-mono text-[rgba(245,240,232,0.6)]">{activeRecord.testDuration}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(245,240,232,0.35)]">每小时误差</span>
                    <span className={`font-mono ${Math.abs(activeRecord.hourlyError) < 1 ? 'text-emerald-400' : Math.abs(activeRecord.hourlyError) > 5 ? 'text-[#C44536]' : 'text-[#D4A847]'}`}>
                      {activeRecord.hourlyError > 0 ? '+' : ''}{activeRecord.hourlyError.toFixed(1)}s/h
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-[rgba(245,240,232,0.2)]">尚未录入参数</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
