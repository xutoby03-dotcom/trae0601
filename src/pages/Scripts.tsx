import { useState, useEffect } from 'react';
import { Plus, BookOpen, Search, X, PlusCircle, Trash2 } from 'lucide-react';
import { useScriptStore } from '@/store/useScriptStore';
import ScriptCard from '@/components/ScriptCard';
import Modal from '@/components/Modal';
import TagSelector from '@/components/TagSelector';
import { GENRES, TRIGGERS } from '@/types';
import type { Script, Character } from '@/types';
import { cn } from '@/lib/utils';

const emptyScript: Omit<Script, 'id'> = {
  title: '',
  playerCount: 6,
  duration: 240,
  store: '',
  price: 158,
  genre: '推理',
  cover: '📖',
  characters: []
};

const emptyCharacter: Omit<Character, 'id'> = {
  name: '',
  description: '',
  gender: 'other',
  tags: [],
  isEdge: false,
  isRomanceLead: false,
  isHorrorFocus: false,
  genre: '推理'
};

const COVERS = ['📖', '🌫️', '🌸', '👻', '🎭', '🔍', '⚔️', '🏰', '🚀', '🎪', '🌙', '🌟'];

export default function Scripts() {
  const { scripts, addScript, updateScript, deleteScript, addCharacter, updateCharacter, deleteCharacter, loadScripts } = useScriptStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState<Omit<Script, 'id'>>(emptyScript);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [charFormData, setCharFormData] = useState<Omit<Character, 'id'>>(emptyCharacter);
  const [charModalOpen, setCharModalOpen] = useState(false);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const handleOpenAdd = () => {
    setEditingScript(null);
    setFormData(emptyScript);
    setModalOpen(true);
  };

  const handleOpenEdit = (script: Script) => {
    setEditingScript(script);
    setFormData({
      title: script.title,
      playerCount: script.playerCount,
      duration: script.duration,
      store: script.store,
      price: script.price,
      genre: script.genre,
      cover: script.cover || '📖',
      characters: [...script.characters]
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    
    if (editingScript) {
      updateScript(editingScript.id, formData);
    } else {
      addScript(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个剧本吗？所有相关角色都会被删除。')) {
      deleteScript(id);
    }
  };

  const handleAddCharacter = () => {
    setEditingCharIndex(null);
    setCharFormData({ ...emptyCharacter, genre: formData.genre });
    setCharModalOpen(true);
  };

  const handleEditCharacter = (index: number) => {
    setEditingCharIndex(index);
    setCharFormData({ ...formData.characters[index] });
    setCharModalOpen(true);
  };

  const handleDeleteCharacter = (index: number) => {
    const newChars = formData.characters.filter((_, i) => i !== index);
    setFormData({ ...formData, characters: newChars });
  };

  const handleSaveCharacter = () => {
    if (!charFormData.name.trim()) return;
    
    let newChars: Character[];
    if (editingCharIndex !== null) {
      newChars = formData.characters.map((c, i) =>
        i === editingCharIndex ? { ...c, ...charFormData } : c
      );
    } else {
      const newChar: Character = {
        ...charFormData,
        id: `char-temp-${Date.now()}`
      };
      newChars = [...formData.characters, newChar];
    }
    setFormData({ ...formData, characters: newChars });
    setCharModalOpen(false);
  };

  const filteredScripts = scripts.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">剧本管理</h1>
          <p className="text-slate-400 text-sm">录入剧本信息和角色介绍</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          <Plus size={18} />
          添加剧本
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="搜索剧本或题材..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredScripts.map((script) => (
          <div key={script.id} className="group">
            <ScriptCard
              script={script}
              onEdit={() => handleOpenEdit(script)}
              onDelete={() => handleDelete(script.id)}
            />
          </div>
        ))}
      </div>

      {filteredScripts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
            <BookOpen className="text-slate-600" size={32} />
          </div>
          <p className="text-slate-400 mb-2">
            {searchQuery ? '没有找到匹配的剧本' : '还没有录入剧本'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              点击添加第一个剧本
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingScript ? '编辑剧本' : '添加剧本'}
        className="max-w-2xl"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">封面表情</label>
            <div className="flex flex-wrap gap-2">
              {COVERS.map(cover => (
                <button
                  key={cover}
                  type="button"
                  onClick={() => setFormData({ ...formData, cover })}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl transition-all duration-200',
                    formData.cover === cover
                      ? 'bg-purple-500/30 ring-2 ring-purple-500/50 scale-110'
                      : 'bg-slate-800/60 hover:bg-slate-700/60'
                  )}
                >
                  {cover}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">剧本名称</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入剧本名称"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">题材</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">玩家人数</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.playerCount}
                onChange={(e) => setFormData({ ...formData, playerCount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">时长（分钟）</label>
              <input
                type="number"
                min="30"
                step="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">价格（元）</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">店家</label>
              <input
                type="text"
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                placeholder="输入剧本店名称"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">
                角色列表 ({formData.characters.length}/{formData.playerCount})
              </label>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
              >
                <PlusCircle size={16} />
                添加角色
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {formData.characters.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">还没有添加角色</p>
              ) : (
                formData.characters.map((char, index) => (
                  <div
                    key={char.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-lg">
                        {char.gender === 'male' ? '👨' : char.gender === 'female' ? '👩' : '🧑'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{char.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {char.isRomanceLead && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">情感</span>
                          )}
                          {char.isHorrorFocus && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">恐怖</span>
                          )}
                          {char.isEdge && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-600/50 text-slate-400">边缘</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditCharacter(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCharacter(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              disabled={!formData.title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingScript ? '保存修改' : '添加剧本'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={charModalOpen}
        onClose={() => setCharModalOpen(false)}
        title={editingCharIndex !== null ? '编辑角色' : '添加角色'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">角色姓名</label>
            <input
              type="text"
              value={charFormData.name}
              onChange={(e) => setCharFormData({ ...charFormData, name: e.target.value })}
              placeholder="输入角色姓名"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">角色性别</label>
            <div className="flex gap-2">
              {(['female', 'male', 'other'] as const).map(gender => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setCharFormData({ ...charFormData, gender })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                    charFormData.gender === gender
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
            <label className="block text-sm font-medium text-slate-300 mb-2">角色简介</label>
            <textarea
              value={charFormData.description}
              onChange={(e) => setCharFormData({ ...charFormData, description: e.target.value })}
              placeholder="输入角色简介..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">角色标签</label>
            <TagSelector
              tags={[...GENRES, ...TRIGGERS.slice(0, 10)]}
              selectedTags={charFormData.tags}
              onChange={(tags) => setCharFormData({ ...charFormData, tags })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
              <input
                type="checkbox"
                checked={charFormData.isRomanceLead}
                onChange={(e) => setCharFormData({ ...charFormData, isRomanceLead: e.target.checked })}
                className="rounded text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-slate-300">情侣线</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
              <input
                type="checkbox"
                checked={charFormData.isHorrorFocus}
                onChange={(e) => setCharFormData({ ...charFormData, isHorrorFocus: e.target.checked })}
                className="rounded text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-300">恐怖核心</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
              <input
                type="checkbox"
                checked={charFormData.isEdge}
                onChange={(e) => setCharFormData({ ...charFormData, isEdge: e.target.checked })}
                className="rounded text-slate-500 focus:ring-slate-500"
              />
              <span className="text-sm text-slate-300">边缘位</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCharModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/60 text-slate-300 font-medium hover:bg-slate-700/60 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveCharacter}
              disabled={!charFormData.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存角色
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
