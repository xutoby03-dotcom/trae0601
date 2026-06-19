import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Scale, Ruler, Repeat } from 'lucide-react';
import type { Box } from '@/types';
import { getCategoryLabel, getStatusLabel, getStatusColor } from '@/utils/condition';
import Badge from '@/components/ui/Badge';

interface BoxCardProps {
  box: Box;
}

export default function BoxCard({ box }: BoxCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/boxes/${box.id}`);
  };

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer group"
      whileHover={{ y: -6, boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
    >
      <div className="relative h-48 bg-muted/50 flex items-center justify-center overflow-hidden">
        {box.photo ? (
          <img
            src={box.photo}
            alt={`纸箱 ${box.id}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`text-6xl ${box.photo ? 'hidden' : ''}`}>📦</div>
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(box.status)}>
            {getStatusLabel(box.status)}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="info">{getCategoryLabel(box.category)}</Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ruler size={16} />
          <span>{box.length} × {box.width} × {box.height} cm</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Scale size={16} />
          <span>承重 {box.loadCapacity} kg</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Repeat size={16} />
          <span>已使用 {box.usageCount} 次</span>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground truncate">
            <span className="text-foreground font-medium">来源：</span>
            {box.source}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
