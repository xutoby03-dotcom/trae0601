import { useState } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, Zap, Repeat, Waves, Gauge, Star, Calendar } from 'lucide-react';
import { useTuneStore } from '@/store/useTuneStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import RatingStars from '@/components/RatingStars';
import { SNOW_CONDITION_LABELS } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import type { RideFeedback } from '@/types';

const emptyFeedback: Omit<RideFeedback, 'id'> = {
  tuneRecordId: '',
  boardId: '',
  date: new Date().toISOString().split('T')[0],
  runs: 5,
  gripScore: 7,
  edgeChangeScore: 7,
  chatterScore: 7,
  speedLossScore: 7,
  overallScore: 7,
  notes: '',
};

export default function FeedbackPage() {
  const { boards, tuneRecords, feedbacks, addFeedback, updateFeedback, deleteFeedback } = useTuneStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<RideFeedback | null>(null);
  const [formData, setFormData] = useState<Omit<RideFeedback, 'id'>>(emptyFeedback);
  const [filterBoard, setFilterBoard] = useState<string>('');

  const filteredFeedbacks = filterBoard
    ? feedbacks.filter((f) => f.boardId === filterBoard)
    : feedbacks;

  const sortedFeedbacks = [...filteredFeedbacks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getBoardName = (boardId: string) => {
    return boards.find((b) => b.id === boardId)?.name || '未知雪板';
  };

  const getTuneInfo = (tuneId: string) => {
    return tuneRecords.find((t) => t.id === tuneId);
  };

  const handleAdd = () => {
    setEditingFeedback(null);
    const latestTune = tuneRecords[0];
    setFormData({
      ...emptyFeedback,
      boardId: latestTune?.boardId || boards[0]?.id || '',
      tuneRecordId: latestTune?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (feedback: RideFeedback) => {
    setEditingFeedback(feedback);
    setFormData({
      tuneRecordId: feedback.tuneRecordId,
      boardId: feedback.boardId,
      date: feedback.date,
      runs: feedback.runs,
      gripScore: feedback.gripScore,
      edgeChangeScore: feedback.edgeChangeScore,
      chatterScore: feedback.chatterScore,
      speedLossScore: feedback.speedLossScore,
      overallScore: feedback.overallScore,
      notes: feedback.notes || '',
    });
    setIsModalOpen(true);
  };

  const updateOverall = (scores: { grip: number; edge: number; chatter: number; speedLoss: number }) => {
    const speedPositive = 11 - scores.speedLoss;
    const avg = Math.round((scores.grip + scores.edge + scores.chatter + speedPositive) / 4);
    setFormData((prev) => ({ ...prev, overallScore: avg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tuneRecordId) {
      alert('请选择调校记录');
      return;
    }
    const tune = tuneRecords.find((t) => t.id === formData.tuneRecordId);
    const data = {
      ...formData,
      boardId: tune?.boardId || formData.boardId,
    };
    if (editingFeedback) {
      updateFeedback(editingFeedback.id, data);
    } else {
      addFeedback(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条试滑反馈吗？')) {
      deleteFeedback(id);
    }
  };

  const scoreItems = [
    { key: 'gripScore', label: '抓雪', icon: Zap, color: 'text-yellow-400', desc: '刃咬住雪的能力（越高越好）', isNegative: false },
    { key: 'edgeChangeScore', label: '换刃', icon: Repeat, color: 'text-cyan-glow', desc: '换刃的顺畅度（越高越好）', isNegative: false },
    { key: 'chatterScore', label: '抖动', icon: Waves, color: 'text-purple-light', desc: '高速时的稳定度（越高越好）', isNegative: false },
    { key: 'speedLossScore', label: '速度损失', icon: Gauge, color: 'text-red-400', desc: '拖速严重程度（越低越好）', isNegative: true },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">试滑反馈</h1>
          <p className="text-sm text-slate-400 mt-1">记录每次调校后的试滑感受和评分</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterBoard}
            onChange={(e) => setFilterBoard(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-glow/50"
          >
            <option value="" className="bg-deep-navy">全部雪板</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id} className="bg-deep-navy">
                {board.name}
              </option>
            ))}
          </select>
          <Button onClick={handleAdd} disabled={tuneRecords.length === 0}>
            <Plus className="w-4 h-4" />
            新增反馈
          </Button>
        </div>
      </div>

      {sortedFeedbacks.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">还没有试滑反馈</h3>
          <p className="text-slate-400 text-sm mb-4">
            {tuneRecords.length === 0 ? '请先添加调校记录，再记录试滑反馈' : '记录你的第一次试滑感受吧'}
          </p>
          {tuneRecords.length > 0 && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              新增反馈
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFeedbacks.map((feedback) => {
            const tune = getTuneInfo(feedback.tuneRecordId);
            return (
              <Card key={feedback.id} hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                          {feedback.overallScore}
                        </span>
                        <span className="text-slate-500 text-sm">/ 10 综合评分</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{getBoardName(feedback.boardId)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(feedback.date)}
                        </span>
                        <span>·</span>
                        <span>{feedback.runs} 趟</span>
                      </div>
                    </div>
                  </div>

                  {tune && (
                    <div className="text-right">
                      <div className="text-sm text-slate-300">
                        {tune.sideEdgeAngle}° / {tune.baseEdgeAngle}°
                      </div>
                      <div className="text-xs text-slate-500">
                        {SNOW_CONDITION_LABELS[tune.snowCondition]}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(feedback)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(feedback.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {scoreItems.map((item) => {
                    const score = feedback[item.key];
                    const displayWidth = item.isNegative ? (11 - score) * 10 : score * 10;
                    return (
                      <div key={item.key} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm text-slate-300">{item.label}</span>
                          {item.isNegative && <span className="text-[10px] text-red-400">↓越低越好</span>}
                        </div>
                        <div className="text-xl font-bold text-white">{score}</div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              item.isNegative
                                ? 'bg-gradient-to-r from-red-500 to-orange-400'
                                : 'bg-gradient-to-r from-cyan-glow to-purple-glow'
                            )}
                            style={{ width: `${displayWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {feedback.notes && (
                  <p className="text-sm text-slate-400 border-t border-white/5 pt-3">
                    {feedback.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeedback ? '编辑试滑反馈' : '新增试滑反馈'}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              对应调校记录 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.tuneRecordId}
              onChange={(e) => {
                const tune = tuneRecords.find((t) => t.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  tuneRecordId: e.target.value,
                  boardId: tune?.boardId || prev.boardId,
                }));
              }}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              required
            >
              <option value="" className="bg-deep-navy">请选择调校记录</option>
              {[...tuneRecords]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tune) => (
                  <option key={tune.id} value={tune.id} className="bg-deep-navy">
                    {getBoardName(tune.boardId)} - {tune.sideEdgeAngle}°侧刃 - {formatDate(tune.date)} - {SNOW_CONDITION_LABELS[tune.snowCondition]}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">滑了几趟</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.runs}
                onChange={(e) => setFormData({ ...formData, runs: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">各项评分</h3>

            {scoreItems.map((item) => (
              <div key={item.key} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="text-xs text-slate-500">({item.desc})</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{formData[item.key]}</span>
                </div>
                <RatingStars
                  value={formData[item.key]}
                  max={10}
                  onChange={(value) => {
                    const newData = { ...formData, [item.key]: value };
                    setFormData(newData);
                    updateOverall({
                      grip: item.key === 'gripScore' ? value : formData.gripScore,
                      edge: item.key === 'edgeChangeScore' ? value : formData.edgeChangeScore,
                      chatter: item.key === 'chatterScore' ? value : formData.chatterScore,
                      speedLoss: item.key === 'speedLossScore' ? value : formData.speedLossScore,
                    });
                  }}
                  size="md"
                  color={item.color.replace('text-', 'text-')}
                />
              </div>
            ))}

            <div className="bg-gradient-to-r from-cyan-glow/10 to-purple-glow/10 rounded-xl p-4 border border-cyan-glow/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-white">综合评分</span>
                </div>
                <span className="text-3xl font-bold text-white">{formData.overallScore}</span>
              </div>
              <p className="text-xs text-slate-400">自动计算：抓雪+换刃+抖动+(11-速度损失) 的平均值</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">试滑感受</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors resize-none"
              rows={3}
              placeholder="记录这次试滑的具体感受，比如哪些地方好，哪些地方需要调整..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              {editingFeedback ? '保存修改' : '提交反馈'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
