import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { BoxCategory, BoxStatus } from '@/types';
import { useBoxStore } from '@/store/useBoxStore';
import { BoxCard, BoxFilter, BoxForm } from '@/components/Box';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Empty from '@/components/ui/Empty';

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

export default function BoxList() {
  const location = useLocation();
  const { boxes, addBox } = useBoxStore();

  const [category, setCategory] = useState<BoxCategory | 'all'>('all');
  const [status, setStatus] = useState<BoxStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showFormDrawer, setShowFormDrawer] = useState(false);

  useEffect(() => {
    const state = location.state as { status?: BoxStatus } | null;
    if (state?.status) {
      setStatus(state.status);
    }
  }, [location.state]);

  const filteredBoxes = useMemo(() => {
    return boxes.filter((box) => {
      if (category !== 'all' && box.category !== category) return false;
      if (status !== 'all' && box.status !== status) return false;
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchSource = box.source.toLowerCase().includes(searchLower);
        const matchNotes = box.notes.toLowerCase().includes(searchLower);
        const matchSize = `${box.length}${box.width}${box.height}`.includes(search);
        if (!matchSource && !matchNotes && !matchSize) return false;
      }
      return true;
    });
  }, [boxes, category, status, search]);

  const handleClearFilters = () => {
    setCategory('all');
    setStatus('all');
    setSearch('');
  };

  const handleFormSubmit = (data: Parameters<typeof addBox>[0]) => {
    addBox(data);
    setShowFormDrawer(false);
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
          <h1 className="text-3xl font-bold text-foreground">📦 纸箱档案</h1>
          <p className="text-muted-foreground mt-1">
            共 {filteredBoxes.length} 个纸箱
          </p>
        </div>
        <Button onClick={() => setShowFormDrawer(true)} className="flex items-center gap-2">
          <Plus size={18} />
          新增纸箱
        </Button>
      </div>

      <BoxFilter
        category={category}
        status={status}
        search={search}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
        onClear={handleClearFilters}
      />

      <AnimatePresence mode="wait">
        {filteredBoxes.length > 0 ? (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredBoxes.map((box) => (
              <motion.div key={box.id} variants={item}>
                <BoxCard box={box} />
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
              icon={<span className="text-4xl">📦</span>}
              title="暂无纸箱"
              description="点击右上角添加按钮创建您的第一个纸箱档案"
              action={
                <Button onClick={() => setShowFormDrawer(true)} className="flex items-center gap-2">
                  <Plus size={16} />
                  添加纸箱
                </Button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={showFormDrawer}
        onClose={() => setShowFormDrawer(false)}
        title="新增纸箱"
        placement="right"
      >
        <BoxForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormDrawer(false)}
        />
      </Drawer>
    </motion.div>
  );
}
