import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { StatsCard, ConflictsBoard, PendingReturnsBoard, ScrappedBoard, UpcomingMovesBoard } from '@/components/Dashboard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const boxes = useBoxStore((state) => state.boxes);
  const borrowRecords = useBorrowStore((state) => state.borrowRecords);

  const { availableCount, reservedCount, pendingReturnCount, scrappedCount } = useMemo(() => {
    return {
      availableCount: boxes.filter((b) => b.status === 'available').length,
      reservedCount: boxes.filter((b) => b.status === 'reserved').length,
      pendingReturnCount: borrowRecords.filter((r) => r.status === 'picked_up').length,
      scrappedCount: boxes.filter((b) => b.status === 'scrapped').length,
    };
  }, [boxes, borrowRecords]);

  const handleStatsClick = (status: string) => {
    navigate('/boxes', { state: { status } });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground mb-2">📊 管理看板</h1>
        <p className="text-muted-foreground">欢迎使用纸箱回收分配系统</p>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <StatsCard
          title="可借用"
          value={availableCount}
          icon="📦"
          color="green"
          onClick={() => handleStatsClick('available')}
        />
        <StatsCard
          title="预约中"
          value={reservedCount}
          icon="📅"
          color="blue"
          onClick={() => handleStatsClick('reserved')}
        />
        <StatsCard
          title="待归还"
          value={pendingReturnCount}
          icon="⏰"
          color="orange"
          onClick={() => navigate('/borrow')}
        />
        <StatsCard
          title="报废箱"
          value={scrappedCount}
          icon="🗑️"
          color="red"
          onClick={() => handleStatsClick('scrapped')}
        />
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ConflictsBoard />
        <PendingReturnsBoard />
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ScrappedBoard />
        <UpcomingMovesBoard />
      </motion.div>
    </motion.div>
  );
}
