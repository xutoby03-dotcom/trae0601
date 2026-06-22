import { useState } from 'react';
import { Settings2 } from 'lucide-react';

interface ParameterInputProps {
  onSubmit: (params: {
    pendulumLength: number;
    escapementPosition: number;
    windingDegree: number;
    testDuration: number;
    hourlyError: number;
    note?: string;
  }) => void;
  disabled?: boolean;
}

export default function ParameterInput({ onSubmit, disabled }: ParameterInputProps) {
  const [pendulumLength, setPendulumLength] = useState(100);
  const [escapementPosition, setEscapementPosition] = useState(0);
  const [windingDegree, setWindingDegree] = useState(80);
  const [testDuration, setTestDuration] = useState(1);
  const [hourlyError, setHourlyError] = useState(0);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ pendulumLength, escapementPosition, windingDegree, testDuration, hourlyError, note });
    setNote('');
  };

  const inputClass =
    'w-full bg-[#1A1612] border border-[rgba(212,168,71,0.25)] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D4A847] focus:ring-1 focus:ring-[rgba(212,168,71,0.3)] transition-colors placeholder:text-[rgba(245,240,232,0.3)]';
  const labelClass = 'block text-xs text-[rgba(212,168,71,0.7)] mb-1 font-serif tracking-wide';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 size={16} className="text-[#D4A847]" />
        <h3 className="text-sm font-serif text-[#D4A847] tracking-widest">调校参数录入</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>摆长 (mm)</label>
          <input
            type="number"
            step="0.1"
            value={pendulumLength}
            onChange={(e) => setPendulumLength(Number(e.target.value))}
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={labelClass}>擒纵叉位置 (°)</label>
          <input
            type="number"
            step="0.5"
            value={escapementPosition}
            onChange={(e) => setEscapementPosition(Number(e.target.value))}
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={labelClass}>上弦程度 (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={windingDegree}
            onChange={(e) => setWindingDegree(Number(e.target.value))}
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div>
          <label className={labelClass}>测试时长 (h)</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={testDuration}
            onChange={(e) => setTestDuration(Number(e.target.value))}
            className={inputClass}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>每小时误差 (s/h)</label>
        <input
          type="number"
          step="0.1"
          value={hourlyError}
          onChange={(e) => setHourlyError(Number(e.target.value))}
          className={inputClass}
          disabled={disabled}
        />
        <div className="flex gap-1 mt-1">
          {[-10, -5, -1, 0, 1, 5, 10].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setHourlyError(v)}
              className="flex-1 text-[10px] py-0.5 rounded bg-[rgba(212,168,71,0.1)] text-[rgba(212,168,71,0.6)] hover:bg-[rgba(212,168,71,0.2)] transition-colors"
              disabled={disabled}
            >
              {v > 0 ? `+${v}` : v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>备注</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="微调说明..."
          className={inputClass}
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#8B6914] to-[#D4A847] text-[#1A1612] font-serif text-sm font-semibold tracking-wider hover:from-[#D4A847] hover:to-[#8B6914] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[rgba(212,168,71,0.15)]"
      >
        记录本次调校
      </button>
    </form>
  );
}
