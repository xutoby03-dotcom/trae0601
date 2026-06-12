import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBBQStore } from '@/store/useBBQStore';
import { STATUS_LIST } from '@/types';
import type { FoodItem } from '@/types';
import CategoryFilter from '@/components/CategoryFilter';
import StatusTabs from '@/components/StatusTabs';
import FoodCard from '@/components/FoodCard';
import ClaimModal from '@/components/ClaimModal';
import SubstituteModal from '@/components/SubstituteModal';
import ReceiptModal from '@/components/ReceiptModal';
import CostBar from '@/components/CostBar';

export default function FoodList() {
  const {
    items,
    participants,
    claimItem,
    markPurchased,
    uploadReceipt,
    markOutOfStock,
    addSubstitute,
    getTotalCost,
    getPerPersonCost,
  } = useBBQStore();

  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [activeStatus, setActiveStatus] = useState('未认领');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptMode, setReceiptMode] = useState<'purchased' | 'receipt-only'>('purchased');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [showReceiptDoneToast, setShowReceiptDoneToast] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const receiptItemId = searchParams.get('receiptItemId');

  useEffect(() => {
    if (receiptItemId) {
      const target = items.find((it) => it.id === receiptItemId);
      if (target) {
        setSelectedCategory('全部');
        setActiveStatus(target.status);
        setSelectedItem(target);
        setReceiptMode('receipt-only');
        setReceiptModalOpen(true);
      }
      const cleanParams = new URLSearchParams(searchParams);
      cleanParams.delete('receiptItemId');
      setSearchParams(cleanParams, { replace: true });
    }
  }, [receiptItemId, items]);

  const handleReceiptClose = () => {
    setReceiptModalOpen(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = selectedCategory === '全部' || item.category === selectedCategory;
      const statusMatch = item.status === activeStatus;
      return categoryMatch && statusMatch;
    });
  }, [items, selectedCategory, activeStatus]);

  const statusCounts = useMemo(() => {
    const categoryItems = selectedCategory === '全部'
      ? items
      : items.filter((item) => item.category === selectedCategory);
    const counts: Record<string, number> = {};
    STATUS_LIST.forEach((status) => {
      counts[status] = categoryItems.filter((item) => item.status === status).length;
    });
    return counts;
  }, [items, selectedCategory]);

  const handleClaim = (item: FoodItem) => {
    setSelectedItem(item);
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = (data: {
    buyer: string;
    actualQuantity: string;
    cost: number;
    estimatedArrival: string;
    receiptPhoto?: string;
  }) => {
    if (selectedItem) {
      claimItem(selectedItem.id, data);
    }
  };

  const handleMarkPurchased = (item: FoodItem) => {
    setSelectedItem(item);
    setReceiptMode('purchased');
    setReceiptModalOpen(true);
  };

  const handleReceiptSubmit = (receiptPhoto: string) => {
    if (selectedItem) {
      if (receiptMode === 'purchased') {
        markPurchased(selectedItem.id, receiptPhoto);
      } else {
        uploadReceipt(selectedItem.id, receiptPhoto);
        setShowReceiptDoneToast(true);
        setTimeout(() => setShowReceiptDoneToast(false), 5000);
      }
    }
  };

  const handleUploadReceipt = (item: FoodItem) => {
    setSelectedItem(item);
    setReceiptMode('receipt-only');
    setReceiptModalOpen(true);
  };

  const handleMarkOutOfStock = (item: FoodItem) => {
    markOutOfStock(item.id);
  };

  const handleSubstitute = (item: FoodItem) => {
    setSelectedItem(item);
    setSubstituteModalOpen(true);
  };

  const handleSubstituteSubmit = (data: {
    substituteName: string;
    substituteCost: number;
    substituteQuantity: string;
  }) => {
    if (selectedItem) {
      addSubstitute(selectedItem.id, {
        originalName: selectedItem.name,
        ...data,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F0] relative">
      {showReceiptDoneToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-2xl border border-[#5A8F5C]/30">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#5A8F5C]/15 text-[#5A8F5C] text-lg">✓</span>
            <span className="text-sm font-medium text-[#2D2A26]">小票上传成功</span>
            <Link
              to="/overview"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E8652E] text-white text-xs font-medium hover:bg-[#d4581f] transition-colors"
            >
              回总览
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <header className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2D2A26] font-display">🔥 周末烧烤派对</h1>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#E8652E]/10 text-xs text-[#E8652E] font-medium">
                本周六 18:00
              </span>
            </div>
            <Link
              to="/overview"
              className="px-3 py-1.5 rounded-full border border-[#E8652E]/30 text-xs text-[#E8652E] font-medium hover:bg-[#E8652E]/10 transition-colors"
            >
              总览 →
            </Link>
          </div>
        </header>

        <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        <StatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          counts={statusCounts}
        />

        <div className="px-4 pb-24 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <FoodCard
                item={item}
                onClaim={handleClaim}
                onMarkPurchased={handleMarkPurchased}
                onMarkOutOfStock={handleMarkOutOfStock}
                onSubstitute={handleSubstitute}
                onUploadReceipt={handleUploadReceipt}
              />
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#2D2A26]/30 text-sm">
              暂无食材
            </div>
          )}
        </div>
      </div>

      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSubmit={handleClaimSubmit}
        participants={participants}
      />

      <SubstituteModal
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
        onSubmit={handleSubstituteSubmit}
        itemName={selectedItem?.name ?? ''}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={handleReceiptClose}
        onSubmit={handleReceiptSubmit}
        itemName={selectedItem?.name ?? ''}
        mode={receiptMode}
      />

      <CostBar
        totalCost={getTotalCost()}
        perPersonCost={getPerPersonCost()}
        participantCount={participants.length}
      />
    </div>
  );
}
