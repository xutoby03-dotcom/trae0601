import { useState } from 'react';
import { Plus, Edit2, Trash2, Mountain, Ruler, Calendar } from 'lucide-react';
import { useTuneStore } from '@/store/useTuneStore';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { BOARD_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import type { Snowboard } from '@/types';

const emptyBoard: Omit<Snowboard, 'id' | 'createdAt'> = {
  name: '',
  brand: '',
  model: '',
  length: 155,
  type: 'all-mountain',
  notes: '',
};

export default function BoardsPage() {
  const { boards, addBoard, updateBoard, deleteBoard, getBoardTuneRecords, getBoardFeedbacks } = useTuneStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Snowboard | null>(null);
  const [formData, setFormData] = useState<Omit<Snowboard, 'id' | 'createdAt'>>(emptyBoard);

  const handleAdd = () => {
    setEditingBoard(null);
    setFormData(emptyBoard);
    setIsModalOpen(true);
  };

  const handleEdit = (board: Snowboard) => {
    setEditingBoard(board);
    setFormData({
      name: board.name,
      brand: board.brand,
      model: board.model,
      length: board.length,
      type: board.type,
      notes: board.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBoard) {
      updateBoard(editingBoard.id, formData);
    } else {
      addBoard(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这块雪板吗？相关的调校记录和试滑反馈也会被删除。')) {
      deleteBoard(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">我的雪板</h1>
          <p className="text-sm text-slate-400 mt-1">管理你的滑雪板，记录每块板的调校历史</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加雪板
        </Button>
      </div>

      {boards.length === 0 ? (
        <Card className="text-center py-12">
          <Mountain className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">还没有雪板</h3>
          <p className="text-slate-400 text-sm mb-4">添加你的第一块雪板，开始记录调校吧</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            添加雪板
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => {
            const tuneCount = getBoardTuneRecords(board.id).length;
            const feedbackCount = getBoardFeedbacks(board.id).length;
            return (
              <Card key={board.id} hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-purple-glow/20 flex items-center justify-center">
                    <Mountain className="w-6 h-6 text-cyan-glow" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(board)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(board.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{board.name}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {board.brand} · {board.model}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {board.length}cm
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-glow/20 text-purple-light">
                    {BOARD_TYPE_LABELS[board.type]}
                  </span>
                </div>
                {board.notes && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{board.notes}</p>
                )}
                <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <span>{tuneCount} 次调校</span>
                  <span>{feedbackCount} 次试滑</span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {formatDate(board.createdAt)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBoard ? '编辑雪板' : '添加雪板'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              雪板名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors"
              placeholder="给你的雪板起个名字"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors"
                placeholder="Jones"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">型号</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors"
                placeholder="Stratos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">长度 (cm)</label>
              <input
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors"
                min={100}
                max={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Snowboard['type'] })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
              >
                {Object.entries(BOARD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-deep-navy">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-glow/50 transition-colors resize-none"
              rows={3}
              placeholder="一些关于这块板的备注..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button type="submit">
              {editingBoard ? '保存修改' : '添加雪板'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
