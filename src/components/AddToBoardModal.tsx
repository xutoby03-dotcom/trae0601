import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { Board } from '@/types';

interface AddToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Board[];
  onAddToBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  fabricName: string;
  existingBoardIds: string[];
}

export function AddToBoardModal({
  isOpen,
  onClose,
  boards,
  onAddToBoard,
  onCreateBoard,
  fabricName,
  existingBoardIds,
}: AddToBoardModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  if (!isOpen) return null;

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim());
      setNewBoardName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#8B5A3C]/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-[#8B5A3C]">加入候选板</h3>
            <p className="text-sm text-[#8B5A3C]/60 mt-1">
              将「{fabricName}」加入款式候选板
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#8B5A3C]/50" />
          </button>
        </div>

        <div className="p-6">
          {showCreateForm ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#8B5A3C] block mb-2">
                  新款款式名称
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="例如：2024春夏连衣裙系列"
                  className="w-full px-4 py-2.5 bg-[#F8F4ED] border-0 rounded-lg text-sm text-[#8B5A3C] placeholder:text-[#8B5A3C]/40 focus:outline-none focus:ring-2 focus:ring-[#8B5A3C]/20"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 text-sm text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  创建并添加
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {boards.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#8B5A3C]/50 text-sm">暂无候选板</p>
                  </div>
                ) : (
                  boards.map((board) => {
                    const isAdded = existingBoardIds.includes(board.id);
                    return (
                      <button
                        key={board.id}
                        onClick={() => {
                          if (!isAdded) {
                            onAddToBoard(board.id);
                          }
                        }}
                        disabled={isAdded}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                          isAdded
                            ? 'bg-[#3D5A45]/5 cursor-not-allowed'
                            : 'bg-[#F8F4ED] hover:bg-[#8B5A3C]/10 cursor-pointer'
                        }`}
                      >
                        <div>
                          <h4 className={`font-medium ${isAdded ? 'text-[#3D5A45]' : 'text-[#8B5A3C]'}`}>
                            {board.name}
                          </h4>
                          {board.description && (
                            <p className="text-xs text-[#8B5A3C]/50 mt-1">{board.description}</p>
                          )}
                        </div>
                        {isAdded ? (
                          <div className="flex items-center gap-1 text-[#3D5A45]">
                            <Check size={18} />
                            <span className="text-sm">已添加</span>
                          </div>
                        ) : (
                          <Plus size={20} className="text-[#8B5A3C]/50" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mt-4 py-3 border-2 border-dashed border-[#8B5A3C]/20 rounded-xl text-[#8B5A3C]/70 hover:border-[#8B5A3C]/40 hover:text-[#8B5A3C] transition-colors text-sm font-medium"
              >
                + 创建新款款式候选板
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
