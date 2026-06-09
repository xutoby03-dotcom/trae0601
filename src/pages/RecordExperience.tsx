import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampStore } from '@/store/campStore';
import type { ColdLevel } from '@/types';
import { ArrowLeft, Star } from 'lucide-react';

const coldLevels: { value: ColdLevel; label: string; desc: string; color: string; border: string }[] = [
  { value: 'none', label: '不冷', desc: '温度舒适，无需额外保暖', color: 'bg-emerald-500/20 text-emerald-300', border: 'border-emerald-500/30' },
  { value: 'mild', label: '有点冷', desc: '需要厚睡袋或加层衣物', color: 'bg-cyan-500/20 text-cyan-300', border: 'border-cyan-500/30' },
  { value: 'severe', label: '很冷', desc: '严重低温，睡袋不够暖', color: 'bg-blue-500/20 text-blue-300', border: 'border-blue-500/30' },
];

export default function RecordExperience() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addExperience } = useCampStore();

  const [coldLevel, setColdLevel] = useState<ColdLevel>('none');
  const [hasWaterPooling, setHasWaterPooling] = useState(false);
  const [noisyNeighbors, setNoisyNeighbors] = useState(false);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!id) return;
    addExperience({
      campId: id,
      coldLevel,
      hasWaterPooling,
      noisyNeighbors,
      rating,
      notes,
      date: new Date(date).getTime(),
    });
    navigate(`/camp/${id}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
      <header className="border-b border-emerald-800/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-emerald-800/40 transition-colors text-emerald-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-emerald-100">记录露营体验</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">露营日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 focus:outline-none focus:border-emerald-500/60 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">整体评分</label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} className="p-1">
                <Star className={`w-7 h-7 transition-colors ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-700 hover:text-amber-600'}`} />
              </button>
            ))}
            <span className="ml-2 text-sm text-emerald-400">{rating}/5</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">夜里冷不冷？</label>
          <div className="grid grid-cols-3 gap-3">
            {coldLevels.map((cl) => (
              <button
                key={cl.value}
                onClick={() => setColdLevel(cl.value)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  coldLevel === cl.value ? `${cl.color} ${cl.border}` : 'bg-emerald-900/15 text-emerald-600 border-emerald-800/20 hover:bg-emerald-900/25'
                }`}
              >
                <div className="text-sm font-medium mb-0.5">{cl.label}</div>
                <div className="text-xs opacity-70">{cl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">其他情况</label>
          <div className="space-y-2">
            <button
              onClick={() => setHasWaterPooling(!hasWaterPooling)}
              className={`w-full p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                hasWaterPooling
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-emerald-900/15 border-emerald-800/20 text-emerald-600 hover:bg-emerald-900/25'
              }`}
            >
              <span className="text-sm">有积水</span>
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                hasWaterPooling ? 'bg-cyan-500 border-cyan-500' : 'border-emerald-600/40'
              }`}>
                {hasWaterPooling && <span className="text-white text-xs">✓</span>}
              </div>
            </button>

            <button
              onClick={() => setNoisyNeighbors(!noisyNeighbors)}
              className={`w-full p-3 rounded-lg text-left transition-all border flex items-center justify-between ${
                noisyNeighbors
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-900/15 border-emerald-800/20 text-emerald-600 hover:bg-emerald-900/25'
              }`}
            >
              <span className="text-sm">邻居吵闹</span>
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                noisyNeighbors ? 'bg-amber-500 border-amber-500' : 'border-emerald-600/40'
              }`}>
                {noisyNeighbors && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-300 mb-2">体验备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="记录你的露营感受、遇到的问题、下次需要注意的事项..."
            className="w-full px-3 py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/30 text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500/60 text-sm resize-none"
          />
        </div>

        <div className="pt-4 border-t border-emerald-800/30">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            保存体验记录
          </button>
        </div>
      </div>
    </div>
  );
}
