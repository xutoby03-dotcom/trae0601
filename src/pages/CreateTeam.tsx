import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, MapPin, Clock, Coins, Users } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';
import type { ThemeType, Difficulty, HorrorLevel } from '@/types';
import {
  THEME_TYPE_LABELS,
  DIFFICULTY_LABELS,
  HORROR_LEVEL_LABELS,
} from '@/types';

export default function CreateTeam() {
  const navigate = useNavigate();
  const { createTeam } = useTeamStore();

  const [shopName, setShopName] = useState('');
  const [themeName, setThemeName] = useState('');
  const [themeType, setThemeType] = useState<ThemeType>('horror');
  const [totalPeople, setTotalPeople] = useState(4);
  const [price, setPrice] = useState(150);
  const [duration, setDuration] = useState(90);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [horrorLevel, setHorrorLevel] = useState<HorrorLevel>('medium');
  const [timeInput, setTimeInput] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const addTime = () => {
    if (timeInput.trim() && !availableTimes.includes(timeInput.trim())) {
      setAvailableTimes([...availableTimes, timeInput.trim()]);
      setTimeInput('');
    }
  };

  const removeTime = (time: string) => {
    setAvailableTimes(availableTimes.filter((t) => t !== time));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !themeName.trim()) return;

    const newTeam = createTeam({
      shopName: shopName.trim(),
      themeName: themeName.trim(),
      themeType,
      totalPeople,
      price,
      duration,
      difficulty,
      horrorLevel,
      availableTimes,
    });

    navigate(`/team/${newTeam.id}`);
  };

  const OptionGroup = <T extends string>({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: T;
    onChange: (v: T) => void;
    options: Record<T, string>;
  }) => (
    <div>
      <label className="label-dark">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {(Object.entries(options) as [T, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`px-3 py-2.5 rounded-lg font-serif text-sm transition-all duration-200 border ${
              value === key
                ? 'bg-wine-800/60 text-gold-200 border-gold-500/50 shadow-gold-glow/30'
                : 'bg-midnight-800/60 text-midnight-300 border-gold-600/10 hover:border-gold-600/30 hover:text-gold-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-midnight-400 hover:text-gold-300 transition-colors mb-6 font-serif"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <h1 className="font-display text-3xl text-gold-400 mb-2">发起新组队</h1>
      <p className="text-midnight-400 font-serif mb-8">填写以下信息，召集你的密室伙伴</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-dark p-6 space-y-5 animate-fade-in-up">
          <div className="flex items-center gap-2 text-gold-400 font-display text-lg mb-2">
            <MapPin className="w-5 h-5" />
            基本信息
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-dark">店铺名称 *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="例如：谜境密室体验馆"
                className="input-dark"
                required
              />
            </div>
            <div>
              <label className="label-dark">主题名称 *</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="例如：幽冥客栈"
                className="input-dark"
                required
              />
            </div>
          </div>

          <OptionGroup
            label="主题类型"
            value={themeType}
            onChange={setThemeType}
            options={THEME_TYPE_LABELS}
          />
        </div>

        <div className="card-dark p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-gold-400 font-display text-lg mb-2">
            <Users className="w-5 h-5" />
            人数与费用
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="label-dark">总人数</label>
              <input
                type="number"
                min="2"
                max="20"
                value={totalPeople}
                onChange={(e) => setTotalPeople(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
                className="input-dark"
              />
            </div>
            <div>
              <label className="label-dark">人均价格 (元)</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight-500" />
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-dark pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label-dark">时长 (分钟)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight-500" />
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(30, parseInt(e.target.value) || 30))}
                  className="input-dark pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-dark p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-gold-400 font-display text-lg mb-2">
            ⚙️ 难度与恐怖
          </div>

          <OptionGroup
            label="难度等级"
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTY_LABELS}
          />

          <OptionGroup
            label="恐怖程度"
            value={horrorLevel}
            onChange={setHorrorLevel}
            options={HORROR_LEVEL_LABELS}
          />
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 text-gold-400 font-display text-lg mb-4">
            <Clock className="w-5 h-5" />
            可选时间
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTime())}
              placeholder="例如：2026-06-15 19:00"
              className="input-dark flex-1"
            />
            <button
              type="button"
              onClick={addTime}
              className="btn-secondary flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {availableTimes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-midnight-800 text-gold-200 font-serif text-sm border border-gold-600/20"
                >
                  {time}
                  <button
                    type="button"
                    onClick={() => removeTime(time)}
                    className="ml-1 hover:text-wine-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {availableTimes.length === 0 && (
            <p className="text-midnight-500 text-sm font-serif">暂未添加可选时间</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-gold">
            发起组队
          </button>
        </div>
      </form>
    </div>
  );
}
