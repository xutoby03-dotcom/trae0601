import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, X, GripVertical, Trash2, Plus } from 'lucide-react';
import { PhotoCompare } from '@/components/PhotoCompare';
import { TouchScoreSlider } from '@/components/TouchScoreSlider';
import { useBoardStore } from '@/store/boardStore';
import { useFabricStore } from '@/store/fabricStore';
import type { Fabric, TouchDimensions, BoardItem } from '@/types';
import { SEASON_LABELS } from '@/types';

export function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { boards, boardItems, init: initBoards, getBoardById, getBoardItemsByBoardId, removeFabricFromBoard, reorderBoardItems } = useBoardStore();
  const { fabrics, initialized: fabricsInitialized, init: initFabrics } = useFabricStore();
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
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
          <h1 className="font-serif text-4xl text-[#8B5A3C] mb-2">{board.name}</h1>
          {board.description && (
            <p className="text-[#8B5A3C]/60">{board.description}</p>
          )}
          <p className="text-[#8B5A3C]/50 text-sm mt-2">
            {fabricsWithItems.length} 款候选面料 · 可拖拽排序
          </p>
        </div>

        {fabricsWithItems.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {fabricsWithItems.map(({ fabric, item }, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#8B5A3C]/10 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex items-stretch">
                  <div className="flex flex-col items-center justify-center px-4 border-r border-[#8B5A3C]/10 bg-[#F8F4ED]/50">
                    <GripVertical size={20} className="text-[#8B5A3C]/30 mb-2" />
                    <button
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                      className="text-[#8B5A3C]/40 hover:text-[#8B5A3C] disabled:opacity-30 p-1"
                    >
                      ↑
                    </button>
                    <span className="text-xs font-medium text-[#8B5A3C]/50 my-1">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === fabricsWithItems.length - 1}
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
                              onClick={() => handleRemove(item.id)}
                              className="p-2 text-[#8B5A3C]/30 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                        {fabric.notes && (
                          <p className="mt-4 text-sm text-[#8B5A3C]/60 italic">
                            {fabric.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
