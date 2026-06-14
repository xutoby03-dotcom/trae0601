import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { DeptUsage } from '@/types';

interface Props {
  data: DeptUsage[];
}

export default function DeptStats({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
      className="rounded-card bg-white shadow-card border border-neutral-100 p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-800">各部门用券统计</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Top {data.length} · 共 {total} 次使用</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-neutral-400">统计周期</div>
          <div className="text-xs font-semibold text-neutral-700">累计至今</div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-sm text-neutral-400">暂无数据</div>
      ) : (
        <ul className="space-y-3.5">
          {data.map((item, idx) => (
            <li key={item.deptId}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + idx * 0.05, ease: 'easeOut' }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-sm font-medium text-neutral-700 truncate group-hover:text-neutral-900 transition-colors">
                      {item.deptName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-[11px] text-neutral-400">
                      {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                    </span>
                    <span
                      className="font-mono text-sm font-bold tabular-nums"
                      style={{ color: item.color }}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{
                      duration: 0.9,
                      delay: 0.6 + idx * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${item.color}ee, ${item.color})`,
                    }}
                  />
                </div>
              </motion.div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
