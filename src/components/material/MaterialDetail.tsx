import { useState } from 'react';
import { Material, Delivery, AfterSale } from '@/types';
import Drawer from '../common/Drawer';
import DeliveryList from '../delivery/DeliveryList';
import DeliveryForm from '../delivery/DeliveryForm';
import Modal from '../common/Modal';
import AfterSaleForm from '../aftersale/AfterSaleForm';
import AfterSaleList from '../aftersale/AfterSaleList';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  calculateReceivedQuantity,
  calculateDamagedQuantity,
  getMaterialStatus,
  getStatusText,
  getStatusColor,
  formatDate,
} from '@/utils/helpers';
import { Package, Calendar, MapPin, Building, Edit2, Trash2, Plus, Wrench } from 'lucide-react';

interface MaterialDetailProps {
  material: Material | null;
  deliveries: Delivery[];
  afterSales: AfterSale[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => void;
  onAddAfterSale: (afterSale: Omit<AfterSale, 'id' | 'createdAt'>) => void;
}

type TabType = 'info' | 'deliveries' | 'aftersales';

const MaterialDetail = ({
  material,
  deliveries,
  afterSales,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddDelivery,
  onAddAfterSale,
}: MaterialDetailProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showAfterSaleForm, setShowAfterSaleForm] = useState(false);

  if (!material) return null;

  const materialDeliveries = deliveries.filter((d) => d.materialId === material.id);
  const materialAfterSales = afterSales.filter((a) => a.materialId === material.id);
  const receivedQuantity = calculateReceivedQuantity(material.id, deliveries);
  const damagedQuantity = calculateDamagedQuantity(material.id, deliveries);
  const status = getMaterialStatus(material, deliveries);
  const progress = Math.min((receivedQuantity / material.orderQuantity) * 100, 100);

  const handleAddDelivery = (data: Omit<Delivery, 'id' | 'createdAt'>) => {
    onAddDelivery(data);
    setShowDeliveryForm(false);
  };

  const handleAddAfterSale = (data: Omit<AfterSale, 'id' | 'createdAt'>) => {
    onAddAfterSale(data);
    setShowAfterSaleForm(false);
  };

  const tabs = [
    { key: 'info' as TabType, label: '基本信息' },
    { key: 'deliveries' as TabType, label: `到货记录 (${materialDeliveries.length})` },
    { key: 'aftersales' as TabType, label: `售后工单 (${materialAfterSales.length})` },
  ];

  const statusColor = {
    pending: 'bg-gray-200',
    partial: 'bg-amber-400',
    complete: 'bg-emerald-500',
    delayed: 'bg-red-500',
  };

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} title={material.name}>
        <div className="flex flex-col h-full">
          <div className="px-6 pb-4 border-b border-gray-100">
            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4">
              {material.photo ? (
                <img
                  src={material.photo}
                  alt={material.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(status)}>
                  {getStatusText(status)}
                </Badge>
                <Badge variant="info">{material.category}</Badge>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-500">到货进度</span>
                <span className="font-semibold text-gray-700">
                  {receivedQuantity} / {material.orderQuantity} {material.unit}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${statusColor[status]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {damagedQuantity > 0 && (
                <p className="text-xs text-red-500 mt-1.5">
                  累计破损 {damagedQuantity} {material.unit}
                </p>
              )}
            </div>
          </div>

          <div className="flex border-b border-gray-100 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <InfoRow icon={Building} label="品牌" value={material.brand} />
                <InfoRow
                  icon={Package}
                  label="规格"
                  value={material.specification}
                />
                <InfoRow
                  icon={Building}
                  label="供应商"
                  value={material.supplier}
                />
                <InfoRow
                  icon={Calendar}
                  label="预计到货日"
                  value={formatDate(material.expectedDate)}
                />
                <InfoRow icon={MapPin} label="存放房间" value={material.room} />
                {material.remark && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-1.5">备注</p>
                    <p className="text-sm text-gray-700">{material.remark}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deliveries' && (
              <div>
                <div className="flex justify-end mb-4">
                  <Button size="sm" onClick={() => setShowDeliveryForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    登记到货
                  </Button>
                </div>
                <DeliveryList deliveries={materialDeliveries} />
              </div>
            )}

            {activeTab === 'aftersales' && (
              <div>
                <div className="flex justify-end mb-4">
                  <Button size="sm" onClick={() => setShowAfterSaleForm(true)}>
                    <Wrench className="w-4 h-4 mr-1" />
                    创建售后
                  </Button>
                </div>
                <AfterSaleList afterSales={materialAfterSales} showMaterial={false} />
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <Modal
        isOpen={showDeliveryForm}
        onClose={() => setShowDeliveryForm(false)}
        title="登记到货"
        className="max-w-md"
      >
        <DeliveryForm
          materialId={material.id}
          orderQuantity={material.orderQuantity}
          receivedSoFar={receivedQuantity}
          onSubmit={handleAddDelivery}
          onCancel={() => setShowDeliveryForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showAfterSaleForm}
        onClose={() => setShowAfterSaleForm(false)}
        title="创建售后工单"
        className="max-w-md"
      >
        <AfterSaleForm
          materialId={material.id}
          onSubmit={handleAddAfterSale}
          onCancel={() => setShowAfterSaleForm(false)}
        />
      </Modal>
    </>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
      <Icon className="w-4.5 h-4.5 text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
    </div>
  </div>
);

export default MaterialDetail;
