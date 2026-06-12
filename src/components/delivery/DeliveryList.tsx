import { Delivery } from '@/types';
import { formatDate } from '@/utils/helpers';
import { Calendar, Package, AlertTriangle, User, FileText } from 'lucide-react';

interface DeliveryListProps {
  deliveries: Delivery[];
}

const DeliveryList = ({ deliveries }: DeliveryListProps) => {
  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">暂无到货记录</p>
      </div>
    );
  }

  const sortedDeliveries = [...deliveries].sort(
    (a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedDeliveries.map((delivery, index) => (
        <div
          key={delivery.id}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-semibold text-sm">
                  {sortedDeliveries.length - index}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  第 {sortedDeliveries.length - index} 批到货
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(delivery.deliveryDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-4 h-4 text-gray-400" />
              <span>实收：{delivery.receivedQuantity}</span>
            </div>
            {delivery.damagedQuantity > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>破损：{delivery.damagedQuantity}</span>
              </div>
            )}
            {delivery.receiver && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>签收：{delivery.receiver}</span>
              </div>
            )}
            {delivery.storageRoom && (
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>存放：{delivery.storageRoom}</span>
              </div>
            )}
          </div>

          {delivery.photo && (
            <div className="mt-3">
              <img
                src={delivery.photo}
                alt="到货照片"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {delivery.remark && (
            <p className="mt-3 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg">
              {delivery.remark}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default DeliveryList;
