import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Calendar, FileText, Package, Truck } from 'lucide-react';
import { useMovePlanStore } from '@/store/useMovePlanStore';
import { useFriendStore } from '@/store/useFriendStore';
import { getDaysFromNow } from '@/utils/condition';
import { formatDate, formatDateCN, isToday, getUpcomingDays } from '@/utils/date';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import Avatar from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export default function UpcomingMovesBoard() {
  const movePlans = useMovePlanStore((state) => state.movePlans);
  const getFriendById = useFriendStore((state) => state.getFriendById);

  const upcomingMoves = useMemo(() => {
    const today = formatDate(new Date());
    const thresholdDate = getUpcomingDays(30);
    return movePlans
      .filter((plan) => plan.moveDate >= today && plan.moveDate <= thresholdDate)
      .sort((a, b) => new Date(a.moveDate).getTime() - new Date(b.moveDate).getTime());
  }, [movePlans]);

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr)) return { label: '今天', color: 'danger' as const };
    const daysUntil = getDaysFromNow(dateStr);
    if (daysUntil <= 0) return null;
    if (daysUntil === 1) return { label: '明天', color: 'warning' as const };
    if (daysUntil <= 7) return { label: `${daysUntil}天后`, color: 'info' as const };
    return { label: `${daysUntil}天后`, color: 'default' as const };
  };

  const getBoxCountHint = (notes: string) => {
    if (!notes) return null;
    const match = notes.match(/(\d+)\s*(个|箱|纸箱)/);
    if (match) {
      return `需要约 ${match[1]} 个纸箱`;
    }
    return null;
  };

  if (upcomingMoves.length === 0) {
    return (
      <Card title="最近搬家清单">
        <Empty
          icon={<Truck size={32} className="text-muted-foreground" />}
          title="最近没有朋友要搬家"
          description="未来30天内暂无搬家计划"
        />
      </Card>
    );
  }

  return (
    <Card title="最近搬家清单">
      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

        <div className="space-y-6">
          {upcomingMoves.map((move, index) => {
            const friend = getFriendById(move.friendId);
            const dateLabel = getDateLabel(move.moveDate);
            const boxHint = getBoxCountHint(move.notes);

            return (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative pl-14"
              >
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />

                <div className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={friend?.avatar}
                        alt={friend?.name}
                        fallback={friend?.name?.charAt(0) || '?'}
                        size="lg"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-lg">
                            {friend?.name || '未知朋友'}
                          </span>
                          <Badge variant={dateLabel.color}>
                            <Calendar size={12} className="mr-1" />
                            {dateLabel.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {formatDateCN(move.moveDate)}
                        </div>
                      </div>
                    </div>

                    {boxHint && (
                      <Badge variant="warning" className="flex-shrink-0">
                        <Package size={12} className="mr-1" />
                        {boxHint}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-background rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {move.fromCommunity}
                      </span>
                    </div>

                    <div className="flex-shrink-0 px-2">
                      <ArrowRight size={18} className="text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin size={16} className="text-red-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {move.toCommunity}
                      </span>
                    </div>
                  </div>

                  {move.notes && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{move.notes}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
