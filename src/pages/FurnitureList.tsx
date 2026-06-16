import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FurnitureGrid, FurnitureFilter } from '@/components/furniture';
import { Button, Modal, Select } from '@/components/ui';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import type { Furniture, FurnitureStatus } from '@/types';
import { Plus, Edit3, Trash2, CheckSquare, Square, MoreVertical } from 'lucide-react';

const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'repairing', label: '维修中' },
  { value: 'lost', label: '已丢失' },
];

export default function FurnitureList() {
  const navigate = useNavigate();
  const { filteredFurniture, loading, fetchFurniture, updateFurniture, deleteFurniture } = useFurnitureStore();
  
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState<FurnitureStatus>('normal');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  useEffect(() => {
    if (!selectMode) {
      setSelectedIds([]);
    }
  }, [selectMode]);

  const handleItemClick = (furniture: Furniture) => {
    navigate(`/furniture/${furniture.id}`);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleBatchStatus = async () => {
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => updateFurniture(id, { status: newStatus })));
      setShowStatusModal(false);
      setSelectMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('批量修改状态失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deleteFurniture(id)));
      setShowDeleteModal(false);
      setSelectMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">桌椅档案</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectMode(!selectMode)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {selectMode ? (
                <CheckSquare className="h-5 w-5 text-primary-500" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate('/furniture/new')}
            >
              新增
            </Button>
          </div>
        </div>

        {selectMode && selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-primary-50 p-3">
            <span className="text-sm text-primary-700">
              已选择 <span className="font-semibold">{selectedIds.length}</span> 件
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<Edit3 className="h-4 w-4" />}
                onClick={() => setShowStatusModal(true)}
              >
                修改状态
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                删除
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {showFilter && <FurnitureFilter className="mb-4" />}
        
        <FurnitureGrid
          furniture={filteredFurniture}
          loading={loading}
          selectable={selectMode}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onItemClick={handleItemClick}
          filterNormal={false}
        />
      </div>

      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="批量修改状态"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              取消
            </Button>
            <Button loading={actionLoading} onClick={handleBatchStatus}>
              确认
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            将把选中的 <span className="font-medium text-gray-900">{selectedIds.length}</span> 件桌椅修改为：
          </p>
          <Select
            label="状态"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as FurnitureStatus)}
          />
        </div>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>
            <Button variant="secondary" loading={actionLoading} onClick={handleBatchDelete}>
              删除
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          确定要删除选中的 <span className="font-medium text-gray-900">{selectedIds.length}</span> 件桌椅吗？此操作不可恢复。
        </p>
      </Modal>
    </div>
  );
}
