import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { SecrecyLevel, SECRECY_LEVEL_META } from '../types';
import {
  Cake,
  Calendar,
  MapPin,
  Wallet,
  Shield,
  Users,
  UserPlus,
  X,
  Crown,
  Sparkles,
  PartyPopper,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { avatarColors } from '../utils';

export const CreatePlanForm: React.FC = () => {
  const createPlan = usePlanStore((s) => s.createPlan);
  const loadExamplePlan = usePlanStore((s) => s.loadExamplePlan);

  const [mainCharacter, setMainCharacter] = React.useState('');
  const [date, setDate] = React.useState('');
  const [meetingPoint, setMeetingPoint] = React.useState('');
  const [totalBudget, setTotalBudget] = React.useState('');
  const [secrecyLevel, setSecrecyLevel] = React.useState<SecrecyLevel>('normal');
  const [participants, setParticipants] = React.useState<{ name: string; isMainCharacter: boolean }[]>([]);
  const [newName, setNewName] = React.useState('');
  const [error, setError] = React.useState('');
  const [showExampleConfirm, setShowExampleConfirm] = React.useState(false);

  const addParticipant = () => {
    const name = newName.trim();
    if (!name) return;
    if (participants.some((p) => p.name === name)) {
      setError('这个人已经在名单里啦');
      setTimeout(() => setError(''), 2000);
      return;
    }
    setParticipants([...participants, { name, isMainCharacter: false }]);
    setNewName('');
  };

  const removeParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const toggleMainCharacter = (idx: number) => {
    setParticipants(
      participants.map((p, i) => ({ ...p, isMainCharacter: i === idx ? !p.isMainCharacter : false }))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParticipant();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCharacter.trim()) {
      setError('请填写主角名字哦');
      return;
    }
    if (!date) {
      setError('选个生日日期吧');
      return;
    }
    if (!meetingPoint.trim()) {
      setError('集合地点别忘了');
      return;
    }
    if (participants.length === 0) {
      setError('至少加一个参与人呀');
      return;
    }
    if (!participants.some((p) => p.isMainCharacter)) {
      setError('记得给某位参与人标上"主角"皇冠');
      return;
    }
    setError('');
    createPlan({
      mainCharacter: mainCharacter.trim(),
      date,
      meetingPoint: meetingPoint.trim(),
      totalBudget: Number(totalBudget) || 0,
      secrecyLevel,
      participants,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-hero rounded-3xl shadow-lg mb-4">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-slate2-800 tracking-wide mb-2">
            创建生日惊喜计划 🎂
          </h1>
          <p className="text-slate2-500">
            填好基本信息，大家一起偷偷搞事情 🤫
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-card p-6 md:p-8 border border-white animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Row 1: 主角 + 日期 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-coral-500" />
                寿星是谁？ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                placeholder="主角的名字"
                maxLength={20}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-mint-500" />
                生日日期 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Row 2: 集合点 + 预算 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-500" />
                集合地点 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="比如：XX餐厅3楼包厢"
                maxLength={50}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-cream-600" />
                总预算（元）
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate2-400">¥</span>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-coral-400 transition-colors font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 3: 保密等级 */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate2-700 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-500" />
              保密等级
            </label>
            <div className="flex flex-wrap gap-2">
              {(['normal', 'high', 'extreme'] as SecrecyLevel[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setSecrecyLevel(lv)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                    secrecyLevel === lv
                      ? `${SECRECY_LEVEL_META[lv].color} border-transparent scale-105 shadow-md`
                      : 'bg-white text-slate2-600 border-slate2-200 hover:border-slate2-300'
                  }`}
                >
                  <span className="mr-1">{SECRECY_LEVEL_META[lv].emoji}</span>
                  {SECRECY_LEVEL_META[lv].label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: 参与人 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate2-700 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-mint-500" />
              参与人列表 <span className="text-red-400">*</span>
              <span className="text-xs font-normal text-slate2-400 ml-1">
                记得给主角戴皇冠 👑
              </span>
            </label>

            {/* Add input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入名字后回车添加"
                maxLength={10}
                className="flex-1 px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-mint-400 transition-colors font-medium"
              />
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2.5 bg-mint-500 hover:bg-mint-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                添加
              </button>
            </div>

            {/* Participants list */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-slate2-50/50 rounded-xl border-2 border-dashed border-slate2-200">
              {participants.length === 0 ? (
                <span className="text-sm text-slate2-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  还没有参与人，快加几个吧
                </span>
              ) : (
                participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-1.5 bg-white rounded-full pl-1 pr-1.5 py-1 shadow-sm border border-slate2-200 hover:border-mint-300 transition-all"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate2-700">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleMainCharacter(idx)}
                      className={`p-0.5 rounded-full transition-all ${
                        p.isMainCharacter
                          ? 'text-yellow-500 scale-110'
                          : 'text-slate2-300 hover:text-yellow-500'
                      }`}
                      title={p.isMainCharacter ? '取消主角' : '设为主角'}
                    >
                      <Crown
                        className="w-4 h-4"
                        fill={p.isMainCharacter ? '#FBBF24' : 'none'}
                        strokeWidth={p.isMainCharacter ? 0 : 2}
                      />
                    </button>
                    {p.isMainCharacter && (
                      <span className="text-[10px] bg-cream-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">
                        主角
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeParticipant(idx)}
                      className="p-0.5 text-slate2-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="移除"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-coral-500 to-orange-400 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <PartyPopper className="w-5 h-5" />
            创建惊喜计划
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Example plan shortcut */}
          <div className="mt-4 text-center">
            {!showExampleConfirm ? (
              <button
                type="button"
                onClick={() => setShowExampleConfirm(true)}
                className="text-sm text-slate2-400 hover:text-purple-500 transition-colors flex items-center gap-1 mx-auto"
              >
                <Wand2 className="w-4 h-4" />
                想先看个示例效果？
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 animate-scale-in">
                <span>载入「小美生日」示例数据？</span>
                <button
                  type="button"
                  onClick={loadExamplePlan}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors"
                >
                  载入
                </button>
                <button
                  type="button"
                  onClick={() => setShowExampleConfirm(false)}
                  className="px-2 py-1 text-slate2-400 hover:text-slate2-600 text-xs"
                >
                  算了
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate2-400 mt-6">
          💝 数据会自动保存在你的浏览器里，放心填
        </p>
      </div>
    </div>
  );
};
