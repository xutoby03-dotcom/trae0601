import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Calendar, MapPin, Package, 
  AlertTriangle, Clock, FileText, ShieldAlert, Plus,
  Thermometer, UtensilsCrossed, Bandage, Shield, Pill
} from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { CATEGORY_LABELS, MedicineCategory } from '@/types';
import { getMedicineStatus, formatDate, getDaysUntilExpiry, getOpenExpiryDate } from '@/utils/medicine';
import StatusBadge from '@/components/StatusBadge';

const categoryIcons: Record<MedicineCategory, typeof Thermometer> = {
  [MedicineCategory.COLD_FEVER]: Thermometer,
  [MedicineCategory.GASTROINTESTINAL]: UtensilsCrossed,
  [MedicineCategory.TRAUMA]: Bandage,
  [MedicineCategory.ALLERGY]: Shield,
  [MedicineCategory.CHRONIC]: Pill,
  [MedicineCategory.OTHER]: Pill,
};

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMedicineById, deleteMedicine, addRecord, updateMedicine } = useMedicineStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [useQuantity, setUseQuantity] = useState(1);
  const [userName, setUserName] = useState('');

  const medicine = id ? getMedicineById(id) : undefined;

  if (!medicine) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">药品不存在</h2>
        <button
          onClick={() => navigate('/medicines')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          返回药品列表
        </button>
      </div>
    );
  }

  const status = getMedicineStatus(medicine);
  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
  const CategoryIcon = categoryIcons[medicine.category];

  const handleDelete = () => {
    if (id) {
      deleteMedicine(id);
      navigate('/medicines');
    }
  };

  const handleUseMedicine = () => {
    if (userName && useQuantity > 0 && useQuantity <= medicine.quantity) {
      addRecord({
        medicineId: medicine.id,
        medicineName: medicine.name,
        userName,
        dosage: `${useQuantity} ${medicine.specification.split('*')[0] || '份'}`,
        symptoms: '',
        needFollowUp: false,
      });
      
      const newQuantity = medicine.quantity - useQuantity;
      if (newQuantity > 0 && id) {
        updateMedicine(id, { quantity: newQuantity });
      } else if (newQuantity <= 0 && id) {
        deleteMedicine(id);
      }
      
      setShowUseModal(false);
      setUseQuantity(1);
      setUserName('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">药品详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUseModal(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            记录用药
          </button>
          <Link
            to={`/medicines/${medicine.id}/edit`}
            className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-xl font-medium hover:bg-primary-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 bg-danger-100 text-danger-700 px-4 py-2 rounded-xl font-medium hover:bg-danger-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-primary-500 to-primary-600">
          {medicine.photo && (
            <img
              src={medicine.photo}
              alt={medicine.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                  <CategoryIcon className="w-4 h-4" />
                  {CATEGORY_LABELS[medicine.category]}
                </span>
                <StatusBadge status={status} />
              </div>
              <h2 className="text-2xl font-bold">{medicine.name}</h2>
              <p className="text-primary-100">{medicine.specification}</p>
            </div>
            {medicine.photo && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={medicine.photo}
                  alt={medicine.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                有效期
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(medicine.expiryDate)}
              </p>
              <p className={`text-sm ${
                status.color === 'red' ? 'text-danger-600' : 
                status.color === 'orange' ? 'text-warning-600' : 'text-gray-500'
              }`}>
                {status.color === 'red' 
                  ? `已过期 ${Math.abs(daysUntilExpiry)} 天` 
                  : status.color === 'orange'
                  ? `还剩 ${daysUntilExpiry} 天`
                  : `还剩 ${daysUntilExpiry} 天`
                }
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Package className="w-4 h-4" />
                剩余数量
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {medicine.quantity} 份
              </p>
              {medicine.quantity <= 2 && (
                <p className="text-sm text-warning-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  库存不足
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                存放位置
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {medicine.location}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                购买日期
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(medicine.purchaseDate)}
              </p>
            </div>
          </div>

          {medicine.openDate && medicine.openExpiryDays && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <Clock className="w-5 h-5" />
                开封信息
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600 mb-1">开封日期</p>
                  <p className="font-semibold text-blue-800">{formatDate(medicine.openDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">开封后有效期至</p>
                  <p className="font-semibold text-blue-800">
                    {formatDate(getOpenExpiryDate(medicine.openDate, medicine.openExpiryDays).toISOString())}
                  </p>
                </div>
              </div>
            </div>
          )}

          {medicine.symptoms && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-5 h-5 text-primary-600" />
                适用症状
              </h3>
              <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                {medicine.symptoms}
              </p>
            </div>
          )}

          {medicine.contraindications.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <ShieldAlert className="w-5 h-5 text-danger-600" />
                禁忌人群
              </h3>
              <div className="flex flex-wrap gap-2">
                {medicine.contraindications.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-danger-100 text-danger-700 rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {medicine.notes && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                备注
              </h3>
              <p className="text-gray-600 bg-gray-50 rounded-xl p-4">
                {medicine.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">确认删除</h3>
            <p className="text-gray-500 text-center mb-6">
              确定要删除「{medicine.name}」吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-danger-500 text-white rounded-xl font-medium hover:bg-danger-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showUseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4">记录用药</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  使用人 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="请输入使用者姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  使用数量 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={medicine.quantity}
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(Math.min(medicine.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <p className="text-xs text-gray-500 mt-1">库存：{medicine.quantity} 份</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUseModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUseMedicine}
                disabled={!userName || useQuantity < 1 || useQuantity > medicine.quantity}
                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Link to="/records/add" className="block w-full h-full">去记录</Link>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
