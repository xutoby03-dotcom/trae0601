import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  Coins,
  MapPin,
  AlertTriangle,
  LogIn,
  LogOut,
  Star,
  FileText,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';
import SafetyBanner from '@/components/SafetyBanner';
import type { Skill } from '@/types';
import {
  THEME_TYPE_LABELS,
  DIFFICULTY_LABELS,
  HORROR_LEVEL_LABELS,
  SKILL_LABELS,
  TEAM_STATUS_LABELS,
} from '@/types';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTeam, joinTeam, leaveTeam } = useTeamStore();
  const team = getTeam(id || '');

  const [showJoinForm, setShowJoinForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [acceptHorror, setAcceptHorror] = useState(false);
  const [motionSickness, setMotionSickness] = useState(false);
  const [skill, setSkill] = useState<Skill>('both');
  const [budgetLimit, setBudgetLimit] = useState(200);

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-midnight-400 font-serif mb-4">未找到该组队</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          返回首页
        </button>
      </div>
    );
  }

  const remaining = team.totalPeople - team.members.length;
  const progress = (team.members.length / team.totalPeople) * 100;
  const isLocked = team.status === 'locked';
  const isCompleted = team.status === 'completed';
  const canJoin = !isLocked && !isCompleted && remaining > 0;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    joinTeam(team.id, {
      name: memberName.trim(),
      acceptHorror,
      motionSickness,
      skill,
      budgetLimit,
    });

    setShowJoinForm(false);
    setMemberName('');
    setAcceptHorror(false);
    setMotionSickness(false);
    setSkill('both');
    setBudgetLimit(200);
  };

  const handleLeave = (memberId: string) => {
    if (confirm('确定要退出该组队吗？')) {
      leaveTeam(team.id, memberId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-midnight-400 hover:text-gold-300 transition-colors mb-6 font-serif"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="card-dark p-6 md:p-8 mb-6 animate-fade-in-up">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-midnight-800 text-gold-300 border border-gold-600/30">
                {THEME_TYPE_LABELS[team.themeType]}
              </span>
              <span
                className={`badge border ${
                  isCompleted
                    ? 'bg-midnight-600 text-midnight-200 border-midnight-500'
                    : isLocked
                    ? 'bg-gold-900/50 text-gold-300 border-gold-600 animate-glow-pulse'
                    : 'bg-wine-900/50 text-wine-300 border-wine-600'
                }`}
              >
                {isLocked || isCompleted ? (
                  <>
                    {isCompleted ? <CheckCircle className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    {TEAM_STATUS_LABELS[team.status]}
                  </>
                ) : (
                  `缺 ${remaining} 人`
                )}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-gold-300 mb-2">{team.themeName}</h1>
            <p className="text-midnight-400 font-serif flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {team.shopName}
            </p>
          </div>

          <div className="flex gap-2">
            {!isCompleted && (
              <Link to={`/team/${team.id}/review`} className="btn-secondary flex items-center gap-2">
                <FileText className="w-4 h-4" />
                记录体验
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-midnight-800/50 rounded-lg p-4 border border-gold-600/10">
            <div className="flex items-center gap-2 text-midnight-400 text-sm font-serif mb-1">
              <Users className="w-4 h-4" />
              人数
            </div>
            <p className="font-display text-xl text-gold-300">
              {team.members.length}
              <span className="text-midnight-500 text-base">/{team.totalPeople}</span>
            </p>
          </div>
          <div className="bg-midnight-800/50 rounded-lg p-4 border border-gold-600/10">
            <div className="flex items-center gap-2 text-midnight-400 text-sm font-serif mb-1">
              <Coins className="w-4 h-4" />
              人均
            </div>
            <p className="font-display text-xl text-gold-300">¥{team.price}</p>
          </div>
          <div className="bg-midnight-800/50 rounded-lg p-4 border border-gold-600/10">
            <div className="flex items-center gap-2 text-midnight-400 text-sm font-serif mb-1">
              <Clock className="w-4 h-4" />
              时长
            </div>
            <p className="font-display text-xl text-gold-300">{team.duration}分</p>
          </div>
          <div className="bg-midnight-800/50 rounded-lg p-4 border border-gold-600/10">
            <div className="flex items-center gap-2 text-midnight-400 text-sm font-serif mb-1">
              <AlertTriangle className="w-4 h-4" />
              恐怖
            </div>
            <p className="font-display text-lg text-gold-300">{HORROR_LEVEL_LABELS[team.horrorLevel].split(' ')[1]}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-serif text-midnight-400">成团进度</span>
            <span className="text-sm font-serif text-gold-300">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-midnight-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                progress >= 100
                  ? 'bg-gradient-to-r from-gold-500 to-gold-400'
                  : 'bg-gradient-to-r from-wine-600 to-wine-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="badge bg-midnight-800/70 text-midnight-200 border border-gold-600/10">
            {DIFFICULTY_LABELS[team.difficulty]}
          </span>
          <span className="badge bg-midnight-800/70 text-midnight-200 border border-gold-600/10">
            {HORROR_LEVEL_LABELS[team.horrorLevel]}
          </span>
          {team.review && (
            <span className="badge bg-gold-900/30 text-gold-300 border border-gold-600/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold-400" />
              评分 {team.review.rating}
            </span>
          )}
        </div>

        {team.availableTimes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gold-600/10">
            <p className="text-sm font-serif text-midnight-400 mb-2">可选时间：</p>
            <div className="flex flex-wrap gap-2">
              {team.availableTimes.map((time) => (
                <span
                  key={time}
                  className="px-3 py-1.5 rounded-lg bg-midnight-800/60 text-gold-200 font-serif text-sm border border-gold-600/10"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <SafetyBanner />

      <div className="card-dark p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-gold-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            已报名成员 ({team.members.length}/{team.totalPeople})
          </h2>
          {canJoin && !showJoinForm && (
            <button onClick={() => setShowJoinForm(true)} className="btn-primary flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              我要报名
            </button>
          )}
        </div>

        {showJoinForm && canJoin && (
          <form onSubmit={handleJoin} className="mb-6 p-5 rounded-xl bg-midnight-800/40 border border-gold-600/20 animate-fade-in-up">
            <h3 className="font-serif text-gold-300 mb-4">填写报名信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-dark">你的昵称 *</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="输入昵称"
                  className="input-dark"
                  required
                />
              </div>
              <div>
                <label className="label-dark">预算上限 (元)</label>
                <input
                  type="number"
                  min="0"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-dark"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label-dark">擅长方向</label>
              <div className="grid grid-cols-3 gap-2">
                {(['puzzle', 'search', 'both'] as Skill[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={`px-3 py-2 rounded-lg font-serif text-sm transition-all duration-200 border ${
                      skill === s
                        ? 'bg-wine-800/60 text-gold-200 border-gold-500/50'
                        : 'bg-midnight-800/60 text-midnight-300 border-gold-600/10 hover:border-gold-600/30'
                    }`}
                  >
                    {SKILL_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptHorror}
                  onChange={(e) => setAcceptHorror(e.target.checked)}
                  className="w-4 h-4 rounded bg-midnight-800 border-gold-600/30 text-wine-600 focus:ring-gold-500"
                />
                <span className="font-serif text-sm text-midnight-300">能接受恐怖元素</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={motionSickness}
                  onChange={(e) => setMotionSickness(e.target.checked)}
                  className="w-4 h-4 rounded bg-midnight-800 border-gold-600/30 text-wine-600 focus:ring-gold-500"
                />
                <span className="font-serif text-sm text-midnight-300">容易晕暗/眩晕</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button type="submit" className="btn-gold">
                确认报名
              </button>
            </div>
          </form>
        )}

        {team.members.length === 0 ? (
          <p className="text-midnight-500 font-serif text-center py-8">暂无成员，快来第一个报名吧！</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-midnight-800/40 border border-gold-600/10 hover:border-gold-600/30 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center font-display text-gold-200 border border-gold-600/30 flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-gold-200 truncate">{member.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-xs text-midnight-400 font-serif">
                        {SKILL_LABELS[member.skill]}
                      </span>
                      {member.acceptHorror && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-wine-900/40 text-wine-300 font-serif">
                          不怕恐
                        </span>
                      )}
                      {member.motionSickness && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gold-900/30 text-gold-400 font-serif">
                          易晕
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-midnight-500 font-serif">¥{member.budgetLimit}</span>
                  {!isCompleted && (
                    <button
                      onClick={() => handleLeave(member.id)}
                      className="p-1.5 rounded-lg text-midnight-500 hover:text-wine-400 hover:bg-wine-900/30 transition-all"
                      title="退出"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {team.review && (
        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-xl text-gold-400 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            体验记录
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-midnight-400 font-serif text-sm">体验评分：</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < team.review!.rating ? 'text-gold-400 fill-gold-400' : 'text-midnight-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-midnight-300 font-serif text-sm">
              <span className="text-midnight-500">解谜MVP：</span>
              <span className="text-gold-300">{team.review.bestPuzzleSolver}</span>
            </p>
            <p className="text-midnight-300 font-serif text-sm">
              <span className="text-midnight-500">隐藏消费：</span>
              <span className={team.review.hiddenCost ? 'text-wine-400' : 'text-gold-400'}>
                {team.review.hiddenCost
                  ? `有${team.review.hiddenCostAmount ? ` ¥${team.review.hiddenCostAmount}` : ''}`
                  : '无'}
              </span>
            </p>
            {team.review.notes && (
              <p className="text-midnight-400 font-serif text-sm pt-2 border-t border-gold-600/10">
                {team.review.notes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
