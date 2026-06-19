import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Droplets, CircleSlash, StickyNote, MoreHorizontal, Clock } from 'lucide-react';
import { useBoxStore } from '@/store/useBoxStore';
import { useBorrowStore } from '@/store/useBorrowStore';
import { getCategoryLabel } from '@/utils/condition';
import { formatDateCN } from '@/utils/date';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';
import type { Box, BorrowRecord } from '@/types';

interface ScrapReasonStats {
  damp: number;
  hole: number;
  tape: number;
  other: number;
}

const scrapReasonLabels: Record<keyof ScrapReasonStats, { label: string; icon: React.ReactNode; color: string }> = {
  damp: { label: '受潮报废', icon: <Droplets size={14} />, color: '#3b82f6' },
  hole: { label: '破洞报废', icon: <CircleSlash size={14} />, color: '#ef4444' },
  tape: { label: '胶带残留严重', icon: <StickyNote size={14} />, color: '#f59e0b' },
  other: { label: '其他原因', icon: <MoreHorizontal size={14} />, color: '#6b7280' },
};

export default function ScrappedBoard() {
  const boxes = useBoxStore((state) => state.boxes);
  const borrowRecords = useBorrowStore((state) => state.borrowRecords);

  const scrappedBoxes = useMemo(() => {
    return boxes.filter((b) => b.status === 'scrapped');
  }, [boxes]);

  const getScrapReason = (box: Box): keyof ScrapReasonStats => {
    const record = borrowRecords.find((r) => r.boxId === box.id && r.scrapReason);
    const reason = record?.scrapReason || '';
    if (reason.includes('受潮') || reason.includes('湿') || reason.includes('damp')) return 'damp';
    if (reason.includes('破洞') || reason.includes('损坏') || reason.includes('hole')) return 'hole';
    if (reason.includes('胶带') || reason.includes('tape')) return 'tape';
    return 'other';
  };

  const getScrapStats = (): ScrapReasonStats => {
    const stats: ScrapReasonStats = { damp: 0, hole: 0, tape: 0, other: 0 };
    scrappedBoxes.forEach((box) => {
      const reason = getScrapReason(box);
      stats[reason]++;
    });
    return stats;
  };

  const getRecentScrapped = (): Array<{ box: Box; record?: BorrowRecord }> => {
    return scrappedBoxes
      .map((box) => {
        const record = borrowRecords.find((r) => r.boxId === box.id && r.status === 'returned');
        return { box, record };
      })
      .sort((a, b) => {
        const dateA = a.record?.actualReturnDate || a.box.updatedAt;
        const dateB = b.record?.actualReturnDate || b.box.updatedAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  };

  const stats = getScrapStats();
  const recentScrapped = getRecentScrapped();
  const total = scrappedBoxes.length;

  const PieChart = () => {
    if (total === 0) return null;

    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#6b7280'];
    const values = [stats.damp, stats.hole, stats.tape, stats.other];
    const cumulativePercentages: number[] = [];
    let sum = 0;

    values.forEach((value) => {
      sum += value;
      cumulativePercentages.push((sum / total) * 100);
    });

    return (
      <div className="relative w-32 h-32 mx-auto">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(
              ${colors[0]} 0% ${cumulativePercentages[0]}%,
              ${colors[1]} ${cumulativePercentages[0]}% ${cumulativePercentages[1]}%,
              ${colors[2]} ${cumulativePercentages[1]}% ${cumulativePercentages[2]}%,
              ${colors[3]} ${cumulativePercentages[2]}% 100%
            )`,
          }}
        />
        <div className="absolute inset-3 bg-card rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">个已报废</div>
          </div>
        </div>
      </div>
    );
  };

  const BarChart = () => {
    if (total === 0) return null;

    const entries = Object.entries(stats) as [keyof ScrapReasonStats, number][];

    return (
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const config = scrapReasonLabels[key];
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1">
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
                <span className="font-medium text-foreground">
                  {count} 个 ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (total === 0) {
    return (
      <Card title="报废箱统计">
        <Empty
          icon={<Trash2 size={32} className="text-muted-foreground" />}
          title="暂无报废纸箱"
          description="所有纸箱都在正常使用中"
        />
      </Card>
    );
  }

  return (
    <Card title="报废箱统计">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">报废原因分布</h4>
          <PieChart />
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">分类统计</h4>
          <BarChart />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">最近报废 ({recentScrapped.length})</h4>
        <div className="space-y-2">
          {recentScrapped.map(({ box, record }, index) => {
            const reason = getScrapReason(box);
            const config = scrapReasonLabels[reason];
            const scrapDate = record?.actualReturnDate || box.updatedAt;

            return (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <span style={{ color: config.color }}>{config.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {getCategoryLabel(box.category)} · {box.length}×{box.width}×{box.height}cm
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{formatDateCN(scrapDate)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="default" color={config.color}>
                  {config.label}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
