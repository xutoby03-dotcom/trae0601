import { useState } from 'react';
import { Flame, Ruler, Clock, User } from 'lucide-react';
import { GlassType, GLASS_TYPE_LABELS } from '@/utils/annealing';
import { useAnnealingStore } from '@/store/useAnnealingStore';

export default function WorkForm() {
  const [type, setType] = useState<GlassType>('soda-lime');
  const [maxThickness, setMaxThickness] = useState<string>('10');
  const [entryTime, setEntryTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );
  const [studentName, setStudentName] = useState<string>('');
  const [height, setHeight] = useState<string>('20');

  const { addWork, tryAddWork, currentSession } = useAnnealingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const work = {
      type,
      maxThickness: parseFloat(maxThickness) || 10,
      entryTime,
      studentName: studentName.trim(),
      height: parseFloat(height) || 20,
    };

    if (currentSession.status === 'running') {
      tryAddWork(work);
    } else {
      addWork(work);
    }

    setStudentName('');
    setHeight('20');
    setMaxThickness('10');
    setEntryTime(
      new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-5 h-5 text-furnace-glow" />
        <h2 className="font-display text-xl font-semibold text-amber-100">录入作品</h2>
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-300/70 mb-1">作品类型</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as GlassType)}
          className="w-full bg-furnace-dark/80 border border-furnace-ash/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-furnace-glow/50 focus:ring-1 focus:ring-furnace-glow/30 transition-all"
        >
          {Object.entries(GLASS_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-furnace-dark text-amber-100">
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-amber-300/70 mb-1">
            <Ruler className="w-3 h-3 inline mr-1" />最大厚度 (mm)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={maxThickness}
            onChange={(e) => setMaxThickness(e.target.value)}
            className="w-full bg-furnace-dark/80 border border-furnace-ash/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-furnace-glow/50 focus:ring-1 focus:ring-furnace-glow/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-300/70 mb-1">
            <Ruler className="w-3 h-3 inline mr-1" />高度 (cm)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full bg-furnace-dark/80 border border-furnace-ash/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-furnace-glow/50 focus:ring-1 focus:ring-furnace-glow/30 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-300/70 mb-1">
          <Clock className="w-3 h-3 inline mr-1" />入炉时间
        </label>
        <input
          type="time"
          value={entryTime}
          onChange={(e) => setEntryTime(e.target.value)}
          className="w-full bg-furnace-dark/80 border border-furnace-ash/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-furnace-glow/50 focus:ring-1 focus:ring-furnace-glow/30 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-300/70 mb-1">
          <User className="w-3 h-3 inline mr-1" />学生姓名
        </label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="输入学生姓名"
          className="w-full bg-furnace-dark/80 border border-furnace-ash/30 rounded-lg px-3 py-2 text-amber-100 text-sm placeholder:text-amber-300/30 focus:outline-none focus:border-furnace-glow/50 focus:ring-1 focus:ring-furnace-glow/30 transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-furnace-glow to-furnace-warm text-furnace-deeper font-semibold py-2.5 rounded-lg hover:from-furnace-warm hover:to-furnace-glow transition-all duration-300 shadow-lg shadow-furnace-glow/20 hover:shadow-furnace-glow/40 active:scale-[0.98]"
      >
        加入当前炉次
      </button>
    </form>
  );
}
