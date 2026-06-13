import React from 'react';
import {
  MapPin,
  User,
  Phone,
  FileText,
  Edit3,
  Trash2,
  Package,
} from 'lucide-react';
import type { Printer } from '../../shared/types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface PrinterCardProps {
  printer: Printer;
  onEdit?: (printer: Printer) => void;
  onDelete?: (printer: Printer) => void;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({
  printer,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { addConsumption } = useAppStore();

  const stockRatio = printer.currentStock / printer.minStock;
  const getStockStatus = () => {
    if (stockRatio <= 0.3) return { variant: 'danger' as const, label: '库存告急' };
    if (stockRatio <= 0.7) return { variant: 'warning' as const, label: '库存紧张' };
    return { variant: 'success' as const, label: '库存充足' };
  };

  const stockStatus = getStockStatus();

  const handleQuickConsume = async () => {
    const quantity = prompt('请输入领用数量：', '1');
    if (quantity && parseInt(quantity) > 0) {
      const department = prompt('请输入部门：', '行政部');
      const purpose = prompt('请输入用途：', '日常办公');
      const receiver = prompt('请输入领取人：', '');
      
      if (department && purpose && receiver) {
        await addConsumption({
          printerId: printer.id,
          department,
          quantity: parseInt(quantity),
          purpose,
          receiver,
        });
      }
    }
  };

  const defaultPhotoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('modern office printer in bright office environment')}&image_size=square`;
  const photoUrl = printer.photoUrl && printer.photoUrl.length > 0 
    ? (printer.photoUrl.startsWith('http') ? printer.photoUrl : `${printer.photoUrl}`)
    : defaultPhotoUrl;

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={photoUrl}
          alt={printer.location}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = defaultPhotoUrl;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge
          variant={stockStatus.variant}
          className="absolute top-4 right-4 px-3 py-1"
        >
          {stockStatus.label}
        </Badge>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white truncate">
            {printer.location}
          </h3>
          <p className="text-sm text-white/80">{printer.printerModel}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">{printer.paperSpec}</span>
          </div>
          <div className="flex items-center text-sm">
            <Package className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">最低 {printer.minStock} 包</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">当前库存</span>
            <span className="text-2xl font-bold font-mono">
              <span
                className={
                  stockStatus.variant === 'danger'
                    ? 'text-danger-500'
                    : stockStatus.variant === 'warning'
                    ? 'text-warning-500'
                    : 'text-success-500'
                }
              >
                {printer.currentStock}
              </span>
              <span className="text-sm text-gray-400 ml-1">包</span>
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                stockStatus.variant === 'danger'
                  ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : stockStatus.variant === 'warning'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-green-400 to-green-500'
              )}
              style={{
                width: `${Math.min(
                  (printer.currentStock / (printer.minStock * 2)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-700 font-medium">{printer.manager}</span>
          </div>
          {printer.managerPhone && (
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{printer.managerPhone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleQuickConsume}
          >
            快速领用
          </Button>
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(printer)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(printer)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

function cn(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
