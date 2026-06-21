import { useEffect, useState } from 'react';
import { FabricCard } from '@/components/FabricCard';
import { FilterPanel } from '@/components/FilterPanel';
import { PresetFilterTags } from '@/components/PresetFilterTags';
import { AddToBoardModal } from '@/components/AddToBoardModal';
import { useFabricStore } from '@/store/fabricStore';
import { useFilterStore } from '@/store/filterStore';
import { useBoardStore } from '@/store/boardStore';
import { filterFabrics } from '@/utils/filterEngine';
import type { Fabric } from '@/types';

export function FabricList() {
  const { fabrics, init: initFabrics } = useFabricStore();
  const { boards, init: initBoards, addFabricToBoard, addBoard } = useBoardStore();
  const { criteria, activePresetId, applyPreset, clearPreset, getPresets } = useFilterStore();
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    initFabrics();
  }, [initFabrics]);

  useEffect(() => {
    if (fabrics.length > 0) {
      initBoards(fabrics);
    }
  }, [fabrics.length, initBoards]);

  const filteredFabrics = filterFabrics(fabrics, criteria);
  const presets = getPresets();

  const handleAddToBoard = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setShowModal(true);
  };

  const handleConfirmAddToBoard = (boardId: string) => {
    if (selectedFabric) {
      addFabricToBoard(selectedFabric.id, boardId);
      setShowModal(false);
      setSelectedFabric(null);
    }
  };

  const handleCreateBoard = (name: string) => {
    const newBoard = addBoard({ name });
    if (selectedFabric) {
      addFabricToBoard(selectedFabric.id, newBoard.id);
    }
  };

  const getExistingBoardIds = (fabricId: string) => {
    return boards
      .filter((b) => useBoardStore.getState().isFabricInBoard(fabricId, b.id))
      .map((b) => b.id);
  };

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#8B5A3C] mb-2">面料触感索引库</h1>
          <p className="text-[#8B5A3C]/60">
            共 {fabrics.length} 款面料 · 筛选结果 {filteredFabrics.length} 款
          </p>
        </div>

        <PresetFilterTags
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={applyPreset}
          onClearPreset={clearPreset}
        />

        <div className="flex gap-8">
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          <main className="flex-1">
            {filteredFabrics.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#8B5A3C]/5 flex items-center justify-center">
                  <span className="text-3xl">🧵</span>
                </div>
                <h3 className="font-serif text-xl text-[#8B5A3C] mb-2">没有找到匹配的面料</h3>
                <p className="text-[#8B5A3C]/60 text-sm">尝试调整筛选条件，或新增一款面料</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFabrics.map((fabric) => (
                  <FabricCard
                    key={fabric.id}
                    fabric={fabric}
                    onAddToBoard={() => handleAddToBoard(fabric)}
                    isInBoard={getExistingBoardIds(fabric.id).length > 0}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedFabric && (
        <AddToBoardModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedFabric(null);
          }}
          boards={boards}
          onAddToBoard={handleConfirmAddToBoard}
          onCreateBoard={handleCreateBoard}
          fabricName={selectedFabric.name}
          existingBoardIds={getExistingBoardIds(selectedFabric.id)}
        />
      )}
    </div>
  );
}
