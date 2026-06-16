import { motion } from 'framer-motion';
import { Clock, MapPin, TrendingUp, Award } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import type { PickupPointStats } from '../../types';
import { Tag } from '../ui/Tag';

interface QueueAnalysisProps {
  pickupPointStats: PickupPointStats[];
  longestQueuePoint: PickupPointStats | null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs > 0 ? secs + '秒' : ''}`;
}

export function QueueAnalysis({ pickupPointStats, longestQueuePoint }: QueueAnalysisProps) {
  const maxWaitTime = Math.max(...pickupPointStats.map((s) => s.maxWaitTime), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-500/20">
                <Clock className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">排队分析</h3>
                <p className="text-sm text-gray-500">各取货点等待时间统计</p>
              </div>
            </div>
            {longestQueuePoint && (
              <Tag variant="gold" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                最长: {longestQueuePoint.name}
              </Tag>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {pickupPointStats.map((stat, index) => {
              const barWidth = (stat.maxWaitTime / maxWaitTime) * 100;
              const isLongest = longestQueuePoint?.id === stat.id;

              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={isLongest ? 'w-4 h-4 text-gold-400' : 'w-4 h-4 text-gray-500'} />
                      <span className="font-medium text-white">{stat.name}</span>
                      {isLongest && (
                        <Tag variant="gold" className="text-xs">
                          排队最久
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                        {stat.totalPickups} 人已领
                      </span>
                      <span className="text-gray-300">
                        平均 {formatDuration(stat.avgWaitTime)}
                      </span>
                      <span className="font-semibold text-accent-400">
                        最长 {formatDuration(stat.maxWaitTime)}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-lg ${
                        isLongest
                          ? 'bg-gradient-to-r from-gold-500 to-orange-500'
                          : 'bg-gradient-to-r from-primary-500 to-accent-500'
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs text-white/80 font-medium">
                        平均等待 {formatDuration(stat.avgWaitTime)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white font-display">
                {pickupPointStats.reduce((s, p) => s + p.totalPickups, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">总领取数</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-primary-400 font-display">
                {formatDuration(
                  Math.round(
                    pickupPointStats.reduce((s, p) => s + p.avgWaitTime * p.totalPickups, 0) /
                    Math.max(1, pickupPointStats.reduce((s, p) => s + p.totalPickups, 0))
                  )
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">整体平均等待</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-gold-400 font-display">
                {formatDuration(longestQueuePoint?.maxWaitTime || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">最长等待时间</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
