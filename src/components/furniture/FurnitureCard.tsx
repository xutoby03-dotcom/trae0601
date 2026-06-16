import { Card, CardContent } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import type { Furniture } from '@/types';
import { MapPin, CheckCircle, Wrench, XCircle, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FurnitureCardProps {
  furniture: Furniture;
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
}

const areaLabels: Record<string, string> = {
  'outdoor-east': '东区',
  'outdoor-west': '西区',
  'outdoor-south': '南区',
  'outdoor-north': '北区',
};

const statusConfig = {
  normal: { variant: 'success' as const, label: '正常', icon: CheckCircle },
  repairing: { variant: 'warning' as const, label: '维修中', icon: Wrench },
  lost: { variant: 'danger' as const, label: '已丢失', icon: XCircle },
};

export default function FurnitureCard({
  furniture,
  selected = false,
  selectable = false,
  onClick,
}: FurnitureCardProps) {
  const status = statusConfig[furniture.status];
  const StatusIcon = status.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-primary-500 shadow-md',
        selectable && 'hover:ring-2 hover:ring-primary-300'
      )}
      onClick={onClick}
    >
      <div className="relative h-32 w-full overflow-hidden rounded-t-xl bg-gray-100">
        {furniture.photo ? (
          <img
            src={furniture.photo}
            alt={furniture.code}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge variant={status.variant} showIcon>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{furniture.code}</h4>
            {furniture.name && (
              <p className="text-sm text-gray-500">{furniture.name}</p>
            )}
          </div>
          {selected && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{areaLabels[furniture.area] || furniture.area}</span>
        </div>
      </CardContent>
    </Card>
  );
}
