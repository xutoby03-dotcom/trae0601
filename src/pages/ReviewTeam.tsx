import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, DollarSign, Award, FileText } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';

export default function ReviewTeam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeam, addReview } = useTeamStore();
  const team = getTeam(id || '');

  const [rating, setRating] = useState(team?.review?.rating || 4);
  const [hoverRating, setHoverRating] = useState(0);
  const [bestPuzzleSolver, setBestPuzzleSolver] = useState(team?.review?.bestPuzzleSolver || '');
  const [hiddenCost, setHiddenCost] = useState(team?.review?.hiddenCost || false);
  const [hiddenCostAmount, setHiddenCostAmount] = useState(team?.review?.hiddenCostAmount || 0);
  const [notes, setNotes] = useState(team?.review?.notes || '');

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-midnight-400 font-serif mb-4">未找到该组队</p>
        <Link to="/" className="btn-primary">返回首页</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addReview(team.id, {
      rating,
      bestPuzzleSolver: bestPuzzleSolver.trim(),
      hiddenCost,
      hiddenCostAmount: hiddenCost ? hiddenCostAmount : undefined,
      notes: notes.trim(),
    });

    navigate(`/team/${team.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-midnight-400 hover:text-gold-300 transition-colors mb-6 font-serif"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="card-dark p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-600 to-gold-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-midnight-900" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-gold-400">记录体验</h1>
            <p className="text-midnight-400 font-serif text-sm">{team.themeName} · {team.shopName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <label className="label-dark flex items-center gap-2">
            <Star className="w-4 h-4" />
            体验评分
          </label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
                className="p-1 transition-transform duration-200 hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-200 ${
                    i < (hoverRating || rating)
                      ? 'text-gold-400 fill-gold-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                      : 'text-midnight-600'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 font-display text-2xl text-gold-300">{hoverRating || rating}.0</span>
          </div>
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <label className="label-dark flex items-center gap-2">
            <Award className="w-4 h-4" />
            谁最会解谜 (MVP)
          </label>
          {team.members.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {team.members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setBestPuzzleSolver(member.name)}
                  className={`px-4 py-3 rounded-lg font-serif text-sm transition-all duration-200 border flex items-center gap-2 ${
                    bestPuzzleSolver === member.name
                      ? 'bg-gold-900/40 text-gold-200 border-gold-500/50 shadow-gold-glow/30'
                      : 'bg-midnight-800/60 text-midnight-300 border-gold-600/10 hover:border-gold-600/30'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center text-xs font-display text-gold-200">
                    {member.name.charAt(0)}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={bestPuzzleSolver}
              onChange={(e) => setBestPuzzleSolver(e.target.value)}
              placeholder="输入成员名字"
              className="input-dark"
            />
          )}
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <label className="label-dark flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            是否有隐藏消费
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!hiddenCost}
                onChange={() => setHiddenCost(false)}
                className="w-4 h-4 bg-midnight-800 border-gold-600/30 text-gold-500 focus:ring-gold-500"
              />
              <span className="font-serif text-midnight-300">无隐藏消费</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={hiddenCost}
                onChange={() => setHiddenCost(true)}
                className="w-4 h-4 bg-midnight-800 border-gold-600/30 text-wine-500 focus:ring-wine-500"
              />
              <span className="font-serif text-midnight-300">有隐藏消费</span>
            </label>
          </div>
          {hiddenCost && (
            <div className="mt-4">
              <label className="label-dark text-sm">隐藏消费金额 (元)</label>
              <input
                type="number"
                min="0"
                value={hiddenCostAmount}
                onChange={(e) => setHiddenCostAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-dark max-w-xs"
              />
            </div>
          )}
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <label className="label-dark">体验备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="说说这次体验如何？有什么有趣的事情？"
            className="input-dark resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-gold">
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
