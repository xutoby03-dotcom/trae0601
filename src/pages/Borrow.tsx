import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, RotateCcw, Plus, Check } from 'lucide-react';
import type { BorrowStatus } from '@/types';
import { useBorrowStore } from '@/store/useBorrowStore';
import { useBoxStore } from '@/store/useBoxStore';
import { useFriendStore } from '@/store/useFriendStore';
import { ReservationCard, ReservationForm, ReturnCheckForm } from '@/components/Borrow';
import { getCategoryLabel, getBorrowStatusLabel } from '@/utils/condition';
import Drawer from '@/components/ui/Drawer';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

type TabType = BorrowStatus | 'all';

const tabs: Array<{ value: TabType; label: string }> = [
  { value: 'all', label: '全部记录' },
  { value: 'pending', label: '待领取' },
  { value: 'picked_up', label: '已领取' },
  { value: 'returned', label: '已归还' },
  { value: 'cancelled', label: '已取消' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface BoxStoreType {
  getState: () => {
    updateBoxStatus: (id: string, status: string) => void;
    incrementUsageCount: (id: string) => void;
    updateBox: (id: string, data: { scrapReason?: string }) => void;
  };
}

export default function Borrow() {
  const { borrowRecords, getRecordsByStatus, confirmPickup, cancelBorrow } = useBorrowStore();
  const { getBoxById } = useBoxStore();
  const { getFriendById } = useFriendStore();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showReservationDrawer, setShowReservationDrawer] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReturnCheckModal, setShowReturnCheckModal] = useState(false);
  const [selectedReturnRecordId, setSelectedReturnRecordId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return getRecordsByStatus(activeTab).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, getRecordsByStatus]);

  const pickedUpRecords = useMemo(() => {
    return borrowRecords.filter((r) => r.status === 'picked_up');
  }, [borrowRecords]);

  const handlePickup = (recordId: string) => {
    confirmPickup(recordId, useBoxStore as unknown as BoxStoreType);
  };

  const handleCancel = (recordId: string) => {
    cancelBorrow(recordId, useBoxStore as unknown as BoxStoreType);
  };

  const handleReturnCheck = (recordId: string) => {
    setSelectedReturnRecordId(recordId);
    setShowReturnModal(false);
    setShowReturnCheckModal(true);
  };

  const handleReturnCheckSubmit = () => {
    setShowReturnCheckModal(false);
    setSelectedReturnRecordId(null);
  };

  const handleReservationSubmit = () => {
    setShowReservationDrawer(false);
  };

  const tabCounts = useMemo(() => {
    return {
      all: borrowRecords.length,
      pending: borrowRecords.filter((r) => r.status === 'pending').length,
      picked_up: borrowRecords.filter((r) => r.status === 'picked_up').length,
      returned: borrowRecords.filter((r) => r.status === 'returned').length,
      cancelled: borrowRecords.filter((r) => r.status === 'cancelled').length,
    };
  }, [borrowRecords]);

  const renderReturnSelectList = () => {
    if (pickedUpRecords.length === 0) {
      return (
        <Empty
          title="暂无待归还记录"
          description="所有已领取的纸箱都已归还"
        />
      );
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {pickedUpRecords.map((record) => {
          const box = getBoxById(record.boxId);
          const friend = getFriendById(record.friendId);
          if (!box || !friend) return null;

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all',
                selectedReturnRecordId === record.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              )}
              onClick={() => setSelectedReturnRecordId(record.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      selectedReturnRecordId === record.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {selectedReturnRecordId === record.id && (
                      <Check size={14} className="text-primary-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{friend.name}</span>
                      <Badge variant="info">{getBorrowStatusLabel(record.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getCategoryLabel(box.category)} · {box.length}×{box.width}×{box.height}cm
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🔄 借还管理</h1>
          <p className="text-muted-foreground mt-1">
            共 {filteredRecords.length} 条记录
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowReservationDrawer(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            预约领取
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-2"
          >
            <RotateCcw size={18} />
            归还检查
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            <Badge variant={activeTab === tab.value ? 'default' : 'default'}>
              {tabCounts[tab.value]}
            </Badge>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {filteredRecords.length > 0 ? (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {filteredRecords.map((record) => (
              <motion.div key={record.id} variants={item}>
                <ReservationCard
                  record={record}
                  onPickup={handlePickup}
                  onCancel={handleCancel}
                  onReturnCheck={handleReturnCheck}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Empty
              icon={<CalendarCheck size={32} className="text-muted-foreground" />}
              title="暂无记录"
              description={`当前${tabs.find((t) => t.value === activeTab)?.label}下没有记录`}
              action={
                activeTab === 'all' || activeTab === 'pending' ? (
                  <Button
                    onClick={() => setShowReservationDrawer(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    新增预约
                  </Button>
                ) : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={showReservationDrawer}
        onClose={() => setShowReservationDrawer(false)}
        title="预约领取"
        placement="right"
      >
        <ReservationForm
          onSubmit={handleReservationSubmit}
          onCancel={() => setShowReservationDrawer(false)}
        />
      </Drawer>

      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="选择要归还的记录"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {renderReturnSelectList()}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => setShowReturnModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={() => selectedReturnRecordId && handleReturnCheck(selectedReturnRecordId)}
              disabled={!selectedReturnRecordId}
              className="flex-1"
            >
              开始检查
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showReturnCheckModal}
        onClose={() => {
          setShowReturnCheckModal(false);
          setSelectedReturnRecordId(null);
        }}
        title="归还检查"
        maxWidth="max-w-xl"
      >
        {selectedReturnRecordId && (
          <ReturnCheckForm
            recordId={selectedReturnRecordId}
            onSubmit={handleReturnCheckSubmit}
            onCancel={() => {
              setShowReturnCheckModal(false);
              setSelectedReturnRecordId(null);
            }}
          />
        )}
      </Modal>
    </motion.div>
  );
}
