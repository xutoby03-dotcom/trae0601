import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, GripVertical, Trash2, Plus, Edit2, Check, AlertCircle } from 'lucide-react';
import { PhotoCompare } from '@/components/PhotoCompare';
import { TouchScoreSlider } from '@/components/TouchScoreSlider';
import { useBoardStore } from '@/store/boardStore';
import { useFabricStore } from '@/store/fabricStore';
import type { Fabric, TouchDimensions, BoardItem } from '@/types';
import { SEASON_LABELS } from '@/types';

export function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boards, boardItems, init: initBoards, getBoardById, getBoardItemsByBoardId, removeFabricFromBoard, reorderBoardItems, updateBoardItemNotes } = useBoardStore();
  const { fabrics, initialized: fabricsInitialized, init: initFabrics } = useFabricStore();
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [boardsInitialized, setBoardsInitialized] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [notesFilter, setNotesFilter] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    initFabrics();
  }, [initFabrics]);

  useEffect(() => {
    if (fabricsInitialized && fabrics.length > 0 && !boardsInitialized) {
      initBoards(fabrics);
      setBoardsInitialized(true);
    }
  }, [fabricsInitialized, fabrics.length, boardsInitialized, initBoards, fabrics]);

  const board = id ? getBoardById(id) : undefined;
  const items = id ? getBoardItemsByBoardId(id) : [];

  const fabricsWithItems: { fabric: Fabric; item: BoardItem }[] = items
    .map((item) => {
      const fabric = fabrics.find((f) => f.id === item.fabricId);
      return fabric ? { fabric, item } : null;
    })
    .filter(Boolean) as { fabric: Fabric; item: BoardItem }[];

  if (!fabricsInitialized || !boardsInitialized) {
    return (
      <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#8B5A3C]/20 border-t-[#8B5A3C] rounded-full animate-spin" />
          <p className="text-[#8B5A3C]/70">加载中...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-[#8B5A3C] mb-4">候选板不存在</h2>
          <div className="mb-4">
            <p className="text-[#8B5A3C]/50 text-sm mb-2">调试信息：</p>
            <p className="text-xs text-[#8B5A3C]/40">
              候选板数量: {boards.length} · 候选板条目: {boardItems.length}
            </p>
          </div>
          <button
            onClick={() => navigate('/boards')}
            className="px-6 py-2 bg-[#8B5A3C] text-white rounded-lg"
          >
            返回候选板列表
          </button>
        </div>
      </div>
    );
  }

  const filteredFabrics = notesFilter === 'pending'
    ? fabricsWithItems.filter(f => !f.item.notes)
    : fabricsWithItems;

  const touchDimensions: (keyof TouchDimensions)[] = ['softness', 'stiffness', 'roughness', 'coolness'];
  const touchLabels: Record<keyof TouchDimensions, string> = {
    softness: '柔软',
    stiffness: '挺括',
    roughness: '粗糙',
    coolness: '凉感',
  };

  const handleRemove = (itemId: string) => {
    if (window.confirm('确定要从候选板中移除这款面料吗？')) {
      removeFabricFromBoard(itemId);
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fabricsWithItems.length) return;
    const newOrder = [...fabricsWithItems];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    const itemIds = newOrder.map((fi) => fi.item.id);
    reorderBoardItems(board.id, itemIds);
  };

  const moveItemWithinVisible = (itemId: string, direction: 'up' | 'down') => {
    const filteredIndex = filteredFabrics.findIndex(fi => fi.item.id === itemId);
    if (direction === 'up' && filteredIndex <= 0) return;
    if (direction === 'down' && filteredIndex >= filteredFabrics.length - 1) return;

    const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1;
    const targetItem = filteredFabrics[targetFilteredIndex];

    const currentFullIndex = fabricsWithItems.findIndex(fi => fi.item.id === itemId);
    const targetFullIndex = fabricsWithItems.findIndex(fi => fi.item.id === targetItem.item.id);

    moveItem(currentFullIndex, targetFullIndex);
  };

  const handleStartEditNotes = (item: BoardItem) => {
    setEditingItemId(item.id);
    setEditingNotes(item.notes || '');
  };

  const handleSaveNotes = (itemId: string) => {
    updateBoardItemNotes(itemId, editingNotes.trim());
    setEditingItemId(null);
    setEditingNotes('');
  };

  const handleCancelEditNotes = () => {
    setEditingItemId(null);
    setEditingNotes('');
  };

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/boards')}
          className="flex items-center gap-2 text-[#8B5A3C]/70 hover:text-[#8B5A3C] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>返回候选板列表</span>
        </button>

        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-4xl text-[#8B5A3C]">{board.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#3D5A45]/10 rounded-full text-xs font-medium text-[#3D5A45] flex items-center gap-1.5">
                    <Check size={12} />
                    已填写 {fabricsWithItems.filter(f => f.item.notes).length}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    fabricsWithItems.filter(f => !f.item.notes).length > 0
                      ? 'bg-[#8B5A3C]/10 text-[#8B5A3C]'
                      : 'bg-[#8B5A3C]/5 text-[#8B5A3C]/40'
                  }`}>
                    <AlertCircle size={12} />
                    待补 {fabricsWithItems.filter(f => !f.item.notes).length}
                  </span>
                </div>
              </div>
              {board.description && (
                <p className="text-[#8B5A3C]/60 mt-2">{board.description}</p>
              )}
              <p className="text-[#8B5A3C]/50 text-sm mt-2">
                共 {fabricsWithItems.length} 款候选面料 · 可上下移动排序
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#8B5A3C]/10">
              <button
                onClick={() => setNotesFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  notesFilter === 'all'
                    ? 'bg-[#8B5A3C] text-white shadow-sm'
                    : 'text-[#8B5A3C]/60 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5'
                }`}
              >
                全部 {fabricsWithItems.length}
              </button>
              <button
                onClick={() => setNotesFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  notesFilter === 'pending'
                    ? 'bg-[#8B5A3C] text-white shadow-sm'
                    : 'text-[#8B5A3C]/60 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5'
                }`}
              >
                <AlertCircle size={14} />
                待补说明 {fabricsWithItems.filter(f => !f.item.notes).length}
              </button>
            </div>
          </div>
        </div>

        {filteredFabrics.length === 0 && fabricsWithItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#8B5A3C]/10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#8B5A3C]/5 flex items-center justify-center">
              <span className="text-3xl">🧵</span>
            </div>
            <h3 className="font-serif text-xl text-[#8B5A3C] mb-2">这个候选板还是空的</h3>
            <p className="text-[#8B5A3C]/60 text-sm mb-6">
              去面料库挑选合适的面料加入这里
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              浏览面料库
            </Link>
          </div>
        ) : filteredFabrics.length === 0 && notesFilter === 'pending' ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#3D5A45]/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3D5A45]/10 flex items-center justify-center">
              <Check size={28} className="text-[#3D5A45]" />
            </div>
            <h3 className="font-serif text-xl text-[#3D5A45] mb-2">太好了！全部填写完毕</h3>
            <p className="text-[#8B5A3C]/60 text-sm mb-4">
              所有候选面料的选样说明都已经填写完整
            </p>
            <button
              onClick={() => setNotesFilter('all')}
              className="px-5 py-2 bg-[#8B5A3C]/10 text-[#8B5A3C] rounded-lg hover:bg-[#8B5A3C]/20 transition-colors text-sm font-medium"
            >
              查看全部 {fabricsWithItems.length} 款面料
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFabrics.map(({ fabric, item }, filteredIndex) => {
              const hasNotes = !!item.notes;
              const originalIndex = fabricsWithItems.findIndex(fi => fi.item.id === item.id);
              const displayIndex = notesFilter === 'pending' ? filteredIndex + 1 : originalIndex + 1;
              const isAtTop = notesFilter === 'pending' ? filteredIndex <= 0 : originalIndex === 0;
              const isAtBottom = notesFilter === 'pending' ? filteredIndex >= filteredFabrics.length - 1 : originalIndex === fabricsWithItems.length - 1;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all relative ${
                    hasNotes
                      ? 'border border-[#8B5A3C]/10'
                      : 'border-2 border-[#8B5A3C]/30 ring-1 ring-[#8B5A3C]/10 bg-gradient-to-r from-[#8B5A3C]/[0.03] via-white to-white'
                  }`}
                >
                  {!hasNotes && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#8B5A3C] text-white rounded-full text-xs font-medium shadow-md">
                        <AlertCircle size={12} />
                        待补说明
                      </span>
                    </div>
                  )}
                  {!hasNotes && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5A3C] to-[#A67C52]" />
                  )}

                  <div className="flex items-stretch">
                    <div className={`flex flex-col items-center justify-center px-4 border-r ${
                      hasNotes ? 'border-[#8B5A3C]/10 bg-[#F8F4ED]/50' : 'border-[#8B5A3C]/15 bg-[#8B5A3C]/[0.04]'
                    }`}>
                      <GripVertical size={20} className={`mb-2 ${hasNotes ? 'text-[#8B5A3C]/30' : 'text-[#8B5A3C]/50'}`} />
                      <button
                        onClick={() => {
                          if (notesFilter === 'pending') {
                            moveItemWithinVisible(item.id, 'up');
                          } else {
                            moveItem(originalIndex, originalIndex - 1);
                          }
                        }}
                        disabled={isAtTop}
                        className="text-[#8B5A3C]/40 hover:text-[#8B5A3C] disabled:opacity-30 p-1"
                      >
                        ↑
                      </button>
                      <span className={`text-xs font-medium my-1 ${hasNotes ? 'text-[#8B5A3C]/50' : 'text-[#8B5A3C]/70'}`}>
                        {displayIndex}
                      </span>
                      <button
                        onClick={() => {
                          if (notesFilter === 'pending') {
                            moveItemWithinVisible(item.id, 'down');
                          } else {
                            moveItem(originalIndex, originalIndex + 1);
                          }
                        }}
                        disabled={isAtBottom}
                        className="text-[#8B5A3C]/40 hover:text-[#8B5A3C] disabled:opacity-30 p-1"
                      >
                        ↓
                      </button>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex gap-8">
                        <div className="w-48 h-48 flex-shrink-0">
                          <img
                            src={fabric.photoSmooth}
                            alt={fabric.name}
                            className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedFabric(fabric)}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Link
                                to={`/fabric/${fabric.id}`}
                                className="font-serif text-xl text-[#8B5A3C] hover:text-[#3D5A45] transition-colors"
                              >
                                {fabric.name}
                              </Link>
                              <p className="text-sm text-[#8B5A3C]/60 mt-1">{fabric.composition}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-[#8B5A3C]/10 rounded-full text-xs font-medium text-[#8B5A3C]">
                                {SEASON_LABELS[fabric.season]}
                              </span>
                              <button
                                onClick={() => handleStartEditNotes(item)}
                                className={`p-2 rounded-lg transition-colors ${
                                  hasNotes
                                    ? 'text-[#8B5A3C]/30 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5'
                                    : 'text-[#8B5A3C] hover:bg-[#8B5A3C]/10 animate-pulse'
                                }`}
                                title="编辑选样说明"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="p-2 text-[#8B5A3C]/30 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="移除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="text-center p-2 bg-[#F8F4ED] rounded-lg">
                              <div className="text-lg font-serif text-[#8B5A3C]">{fabric.weight}g</div>
                              <div className="text-xs text-[#8B5A3C]/50">克重</div>
                            </div>
                            <div className="text-center p-2 bg-[#F8F4ED] rounded-lg">
                              <div className="text-lg font-serif text-[#8B5A3C]">{fabric.elasticity}%</div>
                              <div className="text-xs text-[#8B5A3C]/50">弹力</div>
                            </div>
                            <div className="text-center p-2 bg-[#F8F4ED] rounded-lg">
                              <div className="text-lg font-serif text-[#8B5A3C]">{fabric.drape}%</div>
                              <div className="text-xs text-[#8B5A3C]/50">垂感</div>
                            </div>
                            <div className="text-center p-2 bg-[#F8F4ED] rounded-lg">
                              <div className="text-lg font-serif text-[#8B5A3C]">{fabric.thickness}%</div>
                              <div className="text-xs text-[#8B5A3C]/50">厚薄</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            {touchDimensions.map((dim) => (
                              <div key={dim} className="text-center">
                                <TouchScoreSlider
                                  label={touchLabels[dim]}
                                  value={fabric[dim]}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>

                          <div className={`mt-4 pt-4 border-t ${
                            hasNotes ? 'border-[#8B5A3C]/10' : 'border-[#8B5A3C]/20'
                          }`}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                                  hasNotes ? 'text-[#8B5A3C]/50' : 'text-[#8B5A3C] font-semibold'
                                }`}>
                                  <span className={`inline-block w-1 h-1 rounded-full ${
                                    hasNotes ? 'bg-[#3D5A45]/40' : 'bg-[#8B5A3C]'
                                  }`} />
                                  选样说明
                                  {!hasNotes && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-[#8B5A3C]/10 text-[#8B5A3C] rounded text-[10px] font-medium">
                                      待填写
                                    </span>
                                  )}
                                </div>
                                {editingItemId === item.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editingNotes}
                                      onChange={(e) => setEditingNotes(e.target.value)}
                                      placeholder="写一下为什么选这块面料，打算用在什么部位..."
                                      rows={3}
                                      className="w-full px-3 py-2 bg-[#F8F4ED] border border-[#8B5A3C]/20 rounded-lg text-sm text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20 focus:border-[#8B5A3C]/40 resize-none"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveNotes(item.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3D5A45] text-white rounded-lg text-xs font-medium hover:bg-[#3D5A45]/90 transition-colors"
                                      >
                                        <Check size={14} />
                                        保存
                                      </button>
                                      <button
                                        onClick={handleCancelEditNotes}
                                        className="px-3 py-1.5 text-[#8B5A3C]/60 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg text-xs transition-colors"
                                      >
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="group cursor-text"
                                    onClick={() => handleStartEditNotes(item)}
                                  >
                                    {item.notes ? (
                                      <p className="text-sm text-[#8B5A3C]/80 leading-relaxed group-hover:text-[#8B5A3C] transition-colors">
                                        {item.notes}
                                      </p>
                                    ) : (
                                      <div className="flex items-start gap-2 p-3 bg-[#8B5A3C]/[0.04] rounded-lg border border-dashed border-[#8B5A3C]/20">
                                        <AlertCircle size={16} className="text-[#8B5A3C]/50 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#8B5A3C]/60 italic flex items-center gap-1.5 group-hover:text-[#8B5A3C]/80 transition-colors">
                                          <span>待补选样说明 — 点击填写选样理由和用途</span>
                                          <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {fabric.notes && (
                            <p className="mt-3 text-xs text-[#8B5A3C]/40 italic">
                              面料备注：{fabric.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedFabric && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <button
            onClick={() => setSelectedFabric(null)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-3xl w-full">
            <PhotoCompare
              photoSmooth={selectedFabric.photoSmooth}
              photoWrinkled={selectedFabric.photoWrinkled}
              fabricName={selectedFabric.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}
