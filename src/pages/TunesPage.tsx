import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, Thermometer, Droplets, MapPin, Calendar } from 'lucide-react';
import { useTuneStore } from '@/store/useTuneStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { SNOW_CONDITION_LABELS, WAX_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { TuneRecord, SnowCondition, WaxType } from '@/types';

const emptyRecord: Omit<TuneRecord, 'id'> = {
  boardId: '',
  baseEdgeAngle: 1,
  sideEdgeAngle: 89,
  waxTemp: -8,
  waxType: 'universal',
  snowCondition: 'groomed',
  snowTemp: -5,
  date: new Date().toISOString().split('T')[0],
  location: '',
  notes: '',
};

export default function TunesPage() {
  const { boards, tuneRecords, addTuneRecord, updateTuneRecord, deleteTuneRecord, getTuneFeedbacks } = useTuneStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TuneRecord | null>(null);
  const [formData, setFormData] = useState<Omit<TuneRecord, 'id'>>(emptyRecord);
  const [filterBoard, setFilterBoard] = useState<string>('');

  const filteredRecords = filterBoard
    ? tuneRecords.filter((r) => r.boardId === filterBoard)
    : tuneRecords;

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getBoardName = (boardId: string) => {
    return boards.find((b) => b.id === boardId)?.name || '未知雪板';
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      ...emptyRecord,
      boardId: boards[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: TuneRecord) => {
    setEditingRecord(record);
    setFormData({
      boardId: record.boardId,
      baseEdgeAngle: record.baseEdgeAngle,
      sideEdgeAngle: record.sideEdgeAngle,
      waxTemp: record.waxTemp,
      waxType: record.waxType,
      snowCondition: record.snowCondition,
      snowTemp: record.snowTemp,
      date: record.date,
      location: record.location,
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.boardId) {
      alert('请选择雪板');
      return;
    }
    if (editingRecord) {
      updateTuneRecord(editingRecord.id, formData);
    } else {
      addTuneRecord(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条调校记录吗？相关的试滑反馈也会被删除。')) {
      deleteTuneRecord(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">调校记录</h1>
          <p className="text-sm text-slate-400 mt-1">记录每次调校的刃角和打蜡参数</p>
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
          <Button onClick={handleAdd} disabled={boards.length === 0}>
            <Plus className="w-4 h-4" />
            新增调校
          </Button>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <Card className="text-center py-12">
          <Settings className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">还没有调校记录</h3>
          <p className="text-slate-400 text-sm mb-4">
            {boards.length === 0 ? '请先添加雪板，再记录调校' : '记录你的第一次调校吧'}
          </p>
          {boards.length > 0 && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              新增调校
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRecords.map((record) => {
            const feedbacks = getTuneFeedbacks(record.id);
            const avgScore = feedbacks.length > 0
              ? (feedbacks.reduce((s, f) => s + f.overallScore, 0) / feedbacks.length).toFixed(1)
              : null;
            return (
              <Card key={record.id} hover className="group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-white">
                        {record.sideEdgeAngle}° 侧刃
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-300">
                        {record.baseEdgeAngle}° 底刃
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-glow/20 text-cyan-glow">
                        {SNOW_CONDITION_LABELS[record.snowCondition]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Droplets className="w-4 h-4 text-purple-light" />
                        <span>{WAX_TYPE_LABELS[record.waxType]} {record.waxTemp}°C</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Thermometer className="w-4 h-4 text-blue-400" />
                        <span>雪温 {record.snowTemp}°C</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span>{record.location || '未记录'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        {getBoardName(record.boardId)}
                      </span>
                      {avgScore && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                          平均评分 {avgScore}/10
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {feedbacks.length} 次试滑
                      </span>
                    </div>

                    {record.notes && (
                      <p className="mt-3 text-sm text-slate-400 border-t border-white/5 pt-3">
                        {record.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? '编辑调校记录' : '新增调校记录'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              选择雪板 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.boardId}
              onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              required
            >
              <option value="" className="bg-deep-navy">请选择雪板</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id} className="bg-deep-navy">
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                侧刃角度
                <span className="ml-2 text-cyan-glow font-bold text-lg">
                  {formData.sideEdgeAngle}°
                </span>
              </label>
              <input
                type="range"
                min="85"
                max="90"
                step="0.5"
                value={formData.sideEdgeAngle}
                onChange={(e) => setFormData({ ...formData, sideEdgeAngle: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>85° (锋利)</span>
                <span>90° (钝)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                底刃角度
                <span className="ml-2 text-cyan-glow font-bold text-lg">
                  {formData.baseEdgeAngle}°
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.5"
                value={formData.baseEdgeAngle}
                onChange={(e) => setFormData({ ...formData, baseEdgeAngle: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0° (平)</span>
                <span>3° (斜)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">雪况</label>
              <select
                value={formData.snowCondition}
                onChange={(e) => setFormData({ ...formData, snowCondition: e.target.value as SnowCondition })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              >
                {Object.entries(SNOW_CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-deep-navy">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">雪温 (°C)</label>
              <input
                type="number"
                value={formData.snowTemp}
                onChange={(e) => setFormData({ ...formData, snowTemp: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">蜡的类型</label>
              <select
                value={formData.waxType}
                onChange={(e) => setFormData({ ...formData, waxType: e.target.value as WaxType })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              >
                {Object.entries(WAX_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-deep-navy">
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">打蜡温度 (°C)</label>
              <input
                type="number"
                value={formData.waxTemp}
                onChange={(e) => setFormData({ ...formData, waxTemp: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              />
            </div>
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
              <label className="block text-sm font-medium text-slate-300 mb-1">雪场</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors"
                placeholder="万龙滑雪场"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors resize-none"
              rows={3}
              placeholder="记录调校时的特殊情况..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              {editingRecord ? '保存修改' : '添加记录'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
