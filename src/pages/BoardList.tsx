import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { BoardCard } from '@/components/BoardCard';
import { useBoardStore } from '@/store/boardStore';
import { useFabricStore } from '@/store/fabricStore';

export function BoardList() {
  const { boards, boardItems, init: initBoards, addBoard, deleteBoard } = useBoardStore();
  const { fabrics, initialized: fabricsInitialized, init: initFabrics } = useFabricStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [boardsInitialized, setBoardsInitialized] = useState(false);

  useEffect(() => {
    initFabrics();
  }, [initFabrics]);

  useEffect(() => {
    if (fabricsInitialized && fabrics.length > 0 && !boardsInitialized) {
      initBoards(fabrics);
      setBoardsInitialized(true);
    }
  }, [fabricsInitialized, fabrics.length, boardsInitialized, initBoards, fabrics]);

  const getFabricsForBoard = (boardId: string) => {
    const items = boardItems.filter((bi) => bi.boardId === boardId);
    return items
      .sort((a, b) => a.order - b.order)
      .map((item) => fabrics.find((f) => f.id === item.fabricId))
      .filter(Boolean);
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      addBoard({
        name: newBoardName.trim(),
        description: newBoardDesc.trim() || undefined,
      });
      setNewBoardName('');
      setNewBoardDesc('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('确定要删除这个候选板吗？')) {
      deleteBoard(boardId);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-[#8B5A3C] mb-2">款式候选板</h1>
            <p className="text-[#8B5A3C]/60">
              共 {boards.length} 个候选板 · 按款式管理候选面料
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-xl hover:shadow-lg hover:shadow-[#8B5A3C]/20 transition-all"
          >
            <Plus size={20} />
            创建候选板
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#8B5A3C]/5 flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="font-serif text-xl text-[#8B5A3C] mb-2">还没有候选板</h3>
            <p className="text-[#8B5A3C]/60 text-sm mb-6">
              创建一个候选板，开始为不同款式收集面料
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-[#8B5A3C] text-white rounded-lg"
            >
              创建第一个候选板
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                fabrics={getFabricsForBoard(board.id) as never[]}
                onDelete={(e) => handleDeleteBoard(board.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-serif text-xl text-[#8B5A3C] mb-4">创建新款候选板</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#8B5A3C] block mb-2">
                  款式名称 *
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="例如：2024春夏连衣裙系列"
                  className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#8B5A3C] block mb-2">
                  描述
                </label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="描述这个款式的设计方向..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F8F4ED] border-0 rounded-lg text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A45]/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newBoardName.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
