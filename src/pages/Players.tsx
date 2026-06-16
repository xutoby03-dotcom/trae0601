import { useState, useEffect } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import PlayerCard from '@/components/PlayerCard';
import Modal from '@/components/Modal';
import TagSelector from '@/components/TagSelector';
import { GENRES, TRIGGERS } from '@/types';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

const AVATARS = ['🌸', '🎭', '🦋', '⚡', '🌙', '🌟', '🎪', '🎨', '🎵', '📚', '🔮', '💫', '🔥', '❄️', '🌊', '🍀'];

const emptyPlayer: Omit<Player, 'id'> = {
  name: '',
  avatar: '🌸',
  gender: 'female',
  preferredGenres: [],
  triggers: [],
  emotionTolerance: 5,
  horrorTolerance: 5,
  willingToCrossdress: false,
  historicalOk: true
};

export default function Players() {
  const { players, addPlayer, updatePlayer, deletePlayer, loadPlayers } = usePlayerStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Omit<Player, 'id'>>(emptyPlayer);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData(emptyPlayer);
    setModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      avatar: player.avatar,
      gender: player.gender,
      preferredGenres: [...player.preferredGenres],
      triggers: [...player.triggers],
      emotionTolerance: player.emotionTolerance,
      horrorTolerance: player.horrorTolerance,
      willingToCrossdress: player.willingToCrossdress,
      historicalOk: player.historicalOk
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    if (editingPlayer) {
      updatePlayer(editingPlayer.id, formData);
    } else {
      addPlayer(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个玩家档案吗？')) {
      deletePlayer(id);
    }
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">玩家档案</h1>
          <p className="text-slate-400 text-sm">管理玩家偏好，智能匹配角色</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          <Plus size={18} />
          添加玩家
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="搜索玩家..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <div key={player.id} className="group">
            <PlayerCard
              player={player}
              onEdit={() => handleOpenEdit(player)}
              onDelete={() => handleDelete(player.id)}
            />
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
            <Users className="text-slate-600" size={32} />
          </div>
          <p className="text-slate-400 mb-2">
            {searchQuery ? '没有找到匹配的玩家' : '还没有玩家档案'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              点击添加第一个玩家
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlayer ? '编辑玩家' : '添加玩家'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">头像</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl transition-all duration-200',
                    formData.avatar === avatar
                      ? 'bg-purple-500/30 ring-2 ring-purple-500/50 scale-110'
                      : 'bg-slate-800/60 hover:bg-slate-700/60'
                  )}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入玩家姓名"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">性别</label>
            <div className="flex gap-2">
              {(['female', 'male', 'other'] as const).map(gender => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                    formData.gender === gender
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 border hover:border-slate-600/50'
                  )}
                >
                  {gender === 'female' ? '女' : gender === 'male' ? '男' : '其他'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              情感接受度: <span className="text-purple-400">{formData.emotionTolerance}/10</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.emotionTolerance}
              onChange={(e) => setFormData({ ...formData, emotionTolerance: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>铁石心肠</span>
              <span>泪点很低</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              恐怖接受度: <span className="text-cyan-400">{formData.horrorTolerance}/10</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.horrorTolerance}
              onChange={(e) => setFormData({ ...formData, horrorTolerance: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>胆小如鼠</span>
              <span>胆大如斗</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">偏好题材</label>
            <TagSelector
              tags={GENRES}
              selectedTags={formData.preferredGenres}
              onChange={(tags) => setFormData({ ...formData, preferredGenres: tags })}
              variant="success"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">雷点（不能接受的内容）</label>
            <TagSelector
              tags={TRIGGERS}
              selectedTags={formData.triggers}
              onChange={(tags) => setFormData({ ...formData, triggers: tags })}
              variant="danger"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.willingToCrossdress}
                  onChange={(e) => setFormData({ ...formData, willingToCrossdress: e.target.checked })}
                  className="sr-only"
                />
                <div className={cn(
                  'w-11 h-6 rounded-full transition-colors',
                  formData.willingToCrossdress ? 'bg-purple-500' : 'bg-slate-700'
                )} />
                <div className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  formData.willingToCrossdress ? 'translate-x-5' : 'translate-x-0'
                )} />
              </div>
              <span className="text-sm text-slate-300">愿意反串</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.historicalOk}
                  onChange={(e) => setFormData({ ...formData, historicalOk: e.target.checked })}
                  className="sr-only"
                />
                <div className={cn(
                  'w-11 h-6 rounded-full transition-colors',
                  formData.historicalOk ? 'bg-purple-500' : 'bg-slate-700'
                )} />
                <div className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  formData.historicalOk ? 'translate-x-5' : 'translate-x-0'
                )} />
              </div>
              <span className="text-sm text-slate-300">接受历史角色</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/60 text-slate-300 font-medium hover:bg-slate-700/60 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPlayer ? '保存修改' : '添加玩家'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
