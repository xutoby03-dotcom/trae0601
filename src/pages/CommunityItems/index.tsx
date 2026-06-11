import { useState, useMemo } from 'react';
import { useCommunityItemStore } from '../../store/useCommunityItemStore';
import type { CommunityItem, ItemStatus } from '../../types/communityItem';
import { StatusSection } from '../../components/communityItems/StatusSection';
import { StatsPanel } from '../../components/communityItems/StatsPanel';
import { AddItemModal } from '../../components/communityItems/AddItemModal';
import { BorrowItemModal } from '../../components/communityItems/BorrowItemModal';
import { ReturnItemModal } from '../../components/communityItems/ReturnItemModal';
import { DamageModal } from '../../components/communityItems/DamageModal';
import { ItemDetailModal } from '../../components/communityItems/ItemDetailModal';
import { Modal } from '../../components/Modal';
import type { BorrowRecord, DamageRecord } from '../../types/communityItem';

const statusOrder: ItemStatus[] = ['available', 'in_use', 'needs_cleaning', 'needs_repair'];

const CommunityItems = () => {
  const {
    items,
    borrowRecords,
    addItem,
    updateItem,
    deleteItem,
    borrowItem: borrowItemAction,
    returnItem,
    markCleaned,
    addDamageRecord,
  } = useCommunityItemStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommunityItem | null>(null);

  const [detailItem, setDetailItem] = useState<CommunityItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [borrowItem, setBorrowItemTarget] = useState<CommunityItem | null>(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  const [returnTarget, setReturnTarget] = useState<CommunityItem | null>(null);
  const [returnBorrowRecord, setReturnBorrowRecord] = useState<BorrowRecord | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  const [damageTarget, setDamageTarget] = useState<CommunityItem | null>(null);
  const [damageModalOpen, setDamageModalOpen] = useState(false);
  const [damageForceFill, setDamageForceFill] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<CommunityItem | null>(null);

  const groupedItems = useMemo(() => {
    const groups: Record<ItemStatus, CommunityItem[]> = {
      available: [],
      in_use: [],
      needs_cleaning: [],
      needs_repair: [],
    };
    items.forEach((item) => {
      groups[item.status].push(item);
    });
    return groups;
  }, [items]);

  const openBorrowModal = (item: CommunityItem) => {
    setBorrowItemTarget(item);
    setBorrowModalOpen(true);
    setDetailOpen(false);
  };

  const openReturnModal = (item: CommunityItem) => {
    const record = borrowRecords.find((b) => b.id === item.currentBorrowId) || null;
    setReturnTarget(item);
    setReturnBorrowRecord(record);
    setReturnModalOpen(true);
    setDetailOpen(false);
  };

  const handleMarkCleaned = (item: CommunityItem) => {
    markCleaned(item.id);
  };

  const openDamageModal = (item: CommunityItem, forceFill = false) => {
    setDamageTarget(item);
    setDamageForceFill(forceFill);
    setDamageModalOpen(true);
    setDetailOpen(false);
  };

  const openEditModal = (item: CommunityItem) => {
    setEditingItem(item);
    setAddModalOpen(true);
    setDetailOpen(false);
  };

  const confirmDelete = (item: CommunityItem) => {
    setDeleteConfirm(item);
    setDetailOpen(false);
  };

  const handleItemClick = (item: CommunityItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleAddOrEditItem = (
    data: Omit<CommunityItem, 'id' | 'createdAt' | 'status' | 'totalUsageCount'>
  ) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      setEditingItem(null);
    } else {
      addItem(data);
    }
  };

  const handleBorrowSubmit = (
    itemId: string,
    data: Omit<BorrowRecord, 'id' | 'itemId' | 'returned' | 'cleanedOnReturn' | 'undamagedOnReturn'>
  ) => {
    borrowItemAction(itemId, data);
  };

  const handleReturnSubmit = (
    borrowId: string,
    data: { cleanedOnReturn: boolean; undamagedOnReturn: boolean; returnNote?: string }
  ) => {
    returnItem(borrowId, data);
    if (!data.undamagedOnReturn && returnTarget) {
      setTimeout(() => {
        openDamageModal(returnTarget, true);
      }, 300);
    }
  };

  const handleDamageSubmit = (
    itemId: string,
    data: Omit<DamageRecord, 'id' | 'itemId' | 'reportedAt' | 'settled'>
  ) => {
    addDamageRecord(itemId, data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">🏠 公共物品公约</h2>
          <p className="text-gray-500">
            合租客厅公共物品管理 — 投影仪、空气炸锅、桌游等谁能用、坏了怎么算，一目了然
          </p>
        </div>
        <button
          className="btn btn-primary sm:w-auto w-full"
          onClick={() => {
            setEditingItem(null);
            setAddModalOpen(true);
          }}
        >
          <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加公共物品
        </button>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-3">📜 合租公共物品公约</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="font-semibold mb-1">1. 建档登记</p>
            <p className="text-white/80 text-xs">购买人、价格、存放位置、使用规矩、易损程度、照片一应俱全</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="font-semibold mb-1">2. 预约使用</p>
            <p className="text-white/80 text-xs">借用前约定时段，避免冲突；先约先得，集体优先</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="font-semibold mb-1">3. 完璧归赵</p>
            <p className="text-white/80 text-xs">归还时勾选清洁和完好状态，没清理的不回到可用</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="font-semibold mb-1">4. 损坏必究</p>
            <p className="text-white/80 text-xs">损坏挂责任人、赔付方案、是否结清，谁都别含糊</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {statusOrder.map((status) => (
            <StatusSection
              key={status}
              status={status}
              items={groupedItems[status]}
              onItemClick={handleItemClick}
              onBorrow={status === 'available' ? openBorrowModal : undefined}
              onReturn={status === 'in_use' ? openReturnModal : undefined}
              onMarkCleaned={status === 'needs_cleaning' ? handleMarkCleaned : undefined}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <StatsPanel />
          </div>
        </div>
      </div>

      <AddItemModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddOrEditItem}
        initialData={editingItem || undefined}
      />

      <BorrowItemModal
        open={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        item={borrowItem}
        onSubmit={handleBorrowSubmit}
      />

      <ReturnItemModal
        open={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        item={returnTarget}
        borrowRecord={returnBorrowRecord}
        onSubmit={handleReturnSubmit}
      />

      <DamageModal
        open={damageModalOpen}
        onClose={() => setDamageModalOpen(false)}
        item={damageTarget}
        onSubmit={handleDamageSubmit}
        forceFill={damageForceFill}
      />

      <ItemDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={detailItem}
        onBorrow={() => detailItem && openBorrowModal(detailItem)}
        onReturn={() => detailItem && openReturnModal(detailItem)}
        onMarkCleaned={() => detailItem && handleMarkCleaned(detailItem)}
        onReportDamage={() => detailItem && openDamageModal(detailItem)}
        onEdit={() => detailItem && openEditModal(detailItem)}
        onDelete={() => detailItem && confirmDelete(detailItem)}
      />

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除？"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>
              取消
            </button>
            <button
              className="btn btn-danger flex-1"
              onClick={() => {
                if (deleteConfirm) {
                  deleteItem(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              确认删除
            </button>
          </div>
        }
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-danger-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-gray-600">
            确定要删除「<span className="font-semibold">{deleteConfirm?.name}</span>」吗？
          </p>
          <p className="text-sm text-gray-400 mt-2">
            相关的借用记录和损坏记录也会一并删除，此操作不可撤销。
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityItems;
