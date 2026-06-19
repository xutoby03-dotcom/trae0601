import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BoxCategory, BoxStatus } from '@/types';
import { getCategoryLabel, getStatusLabel } from '@/utils/condition';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface BoxFilterProps {
  category: BoxCategory | 'all';
  status: BoxStatus | 'all';
  search: string;
  onCategoryChange: (category: BoxCategory | 'all') => void;
  onStatusChange: (status: BoxStatus | 'all') => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}

const categoryButtons: Array<{ value: BoxCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'large', label: '大件箱' },
  { value: 'wardrobe', label: '衣柜箱' },
  { value: 'book', label: '书箱' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'available', label: '可借用' },
  { value: 'reserved', label: '预约中' },
  { value: 'in_use', label: '使用中' },
  { value: 'need_repair', label: '待修复' },
  { value: 'scrapped', label: '报废' },
];

export default function BoxFilter({
  category,
  status,
  search,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  onClear,
}: BoxFilterProps) {
  const hasFilters = category !== 'all' || status !== 'all' || search.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        {categoryButtons.map((btn, index) => (
          <motion.button
            key={btn.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => onCategoryChange(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              category === btn.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="按来源、备注搜索..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={status}
            onChange={(value) => onStatusChange(value as BoxStatus | 'all')}
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onClear}
            className="flex items-center gap-2"
          >
            <X size={16} />
            清除筛选
          </Button>
        )}
      </div>
    </motion.div>
  );
}
