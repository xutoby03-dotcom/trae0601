import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Layers, Plus } from 'lucide-react';
import { TouchScoreSlider } from '@/components/TouchScoreSlider';
import { PhotoCompare } from '@/components/PhotoCompare';
import { AddToBoardModal } from '@/components/AddToBoardModal';
import { useFabricStore } from '@/store/fabricStore';
import { useBoardStore } from '@/store/boardStore';
import { SEASON_LABELS, PROPERTY_LABELS } from '@/types';
import type { TouchDimensions } from '@/types';

export function FabricDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fabrics, initialized: fabricsInitialized, getFabricById, deleteFabric, init: initFabrics } = useFabricStore();
  const { boards, init: initBoards, addFabricToBoard, addBoard, isFabricInBoard } = useBoardStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

  const fabric = id ? getFabricById(id) : undefined;

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

  if (!fabric) {
    return (
      <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-[#8B5A3C] mb-4">面料不存在</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#8B5A3C] text-white rounded-lg"
          >
            返回列表
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

  const properties = [
    { label: PROPERTY_LABELS.composition, value: fabric.composition },
    { label: PROPERTY_LABELS.weight, value: `${fabric.weight} g/m²` },
    { label: PROPERTY_LABELS.elasticity, value: `${fabric.elasticity}%` },
    { label: PROPERTY_LABELS.drape, value: `${fabric.drape}%` },
    { label: PROPERTY_LABELS.thickness, value: `${fabric.thickness}%` },
    { label: PROPERTY_LABELS.translucency, value: `${fabric.translucency}%` },
    { label: PROPERTY_LABELS.season, value: SEASON_LABELS[fabric.season] },
  ];

  const handleDelete = () => {
    if (id) {
      deleteFabric(id);
      navigate('/');
    }
  };

  const handleAddToBoard = (boardId: string) => {
    if (id) {
      addFabricToBoard(id, boardId);
      setShowModal(false);
    }
  };

  const handleCreateBoard = (name: string) => {
    const newBoard = addBoard({ name });
    if (id) {
      addFabricToBoard(id, newBoard.id);
    }
  };

  const getExistingBoardIds = () => {
    return boards.filter((b) => isFabricInBoard(fabric.id, b.id)).map((b) => b.id);
  };

  const boardsContainingFabric = boards.filter((b) => isFabricInBoard(fabric.id, b.id));

  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#8B5A3C]/70 hover:text-[#8B5A3C] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>返回面料列表</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <PhotoCompare
              photoSmooth={fabric.photoSmooth}
              photoWrinkled={fabric.photoWrinkled}
              fabricName={fabric.name}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(`/fabric/${fabric.id}/edit`)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[#8B5A3C]/20 text-[#8B5A3C] rounded-xl hover:bg-[#8B5A3C]/5 transition-colors"
              >
                <Edit2 size={18} />
                编辑面料
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#8B5A3C] to-[#3D5A45] text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                加入候选板
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 text-[#8B5A3C]/50 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {boardsContainingFabric.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-[#3D5A45]/10">
                <h4 className="text-sm font-medium text-[#3D5A45] mb-3 flex items-center gap-2">
                  <Layers size={16} />
                  已加入的候选板
                </h4>
                <div className="flex flex-wrap gap-2">
                  {boardsContainingFabric.map((board) => (
                    <span
                      key={board.id}
                      className="px-3 py-1.5 bg-[#3D5A45]/5 text-[#3D5A45] rounded-full text-sm"
                    >
                      {board.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-4xl text-[#8B5A3C] mb-2">{fabric.name}</h1>
            <p className="text-[#8B5A3C]/60 mb-6">{fabric.composition}</p>

            <div className="bg-white rounded-xl p-6 border border-[#8B5A3C]/10 mb-6">
              <h3 className="font-serif text-xl text-[#8B5A3C] mb-4">基本属性</h3>
              <div className="grid grid-cols-2 gap-4">
                {properties.map((prop) => (
                  <div key={prop.label} className="flex justify-between items-center py-2 border-b border-[#8B5A3C]/5 last:border-0">
                    <span className="text-sm text-[#8B5A3C]/60">{prop.label}</span>
                    <span className="text-sm font-medium text-[#8B5A3C]">{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#8B5A3C]/10 mb-6">
              <h3 className="font-serif text-xl text-[#8B5A3C] mb-4">触感评分</h3>
              <div className="grid grid-cols-4 gap-4">
                {touchDimensions.map((dim) => (
                  <TouchScoreSlider
                    key={dim}
                    label={touchLabels[dim]}
                    value={fabric[dim]}
                    readOnly
                  />
                ))}
              </div>
            </div>

            {fabric.notes && (
              <div className="bg-white rounded-xl p-6 border border-[#8B5A3C]/10">
                <h3 className="font-serif text-xl text-[#8B5A3C] mb-3">备注</h3>
                <p className="text-[#8B5A3C]/80 leading-relaxed">{fabric.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-serif text-xl text-[#8B5A3C] mb-2">确认删除</h3>
            <p className="text-[#8B5A3C]/60 mb-6">确定要删除「{fabric.name}」吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-[#8B5A3C]/70 hover:text-[#8B5A3C] hover:bg-[#8B5A3C]/5 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      <AddToBoardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        boards={boards}
        onAddToBoard={handleAddToBoard}
        onCreateBoard={handleCreateBoard}
        fabricName={fabric.name}
        existingBoardIds={getExistingBoardIds()}
      />
    </div>
  );
}
