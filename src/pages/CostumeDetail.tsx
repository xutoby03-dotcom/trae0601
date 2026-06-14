import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Ruler,
  Theater,
  Droplets,
  Clock,
  Check,
  X,
  Shirt,
  Crown,
  Link as LinkIcon,
  Footprints,
} from 'lucide-react';
import { costumeApi } from '../services/costumeService';
import { borrowApi } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import type { Costume, BorrowRecord, AccessoryCategory } from '../../shared/types';
import { useAppStore } from '../stores/appStore';

const categoryConfig: Record<AccessoryCategory, { label: string; icon: typeof Shirt; color: string }> = {
  clothes: { label: '衣服', icon: Shirt, color: 'text-blue-500' },
  headdress: { label: '头饰', icon: Crown, color: 'text-purple-500' },
  belt: { label: '腰带', icon: LinkIcon, color: 'text-amber-500' },
  shoe_cover: { label: '鞋套', icon: Footprints, color: 'text-green-500' },
};

export default function CostumeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [costume, setCostume] = useState<Costume | null>(null);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshOverview } = useAppStore();

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (costumeId: string) => {
    setLoading(true);
    try {
      const [costumeData, borrowsData] = await Promise.all([
        costumeApi.getById(costumeId),
        borrowApi.getList({ costume_id: costumeId, pageSize: 10 }),
      ]);
      setCostume(costumeData);
      setBorrowRecords(borrowsData.list as unknown as BorrowRecord[]);
    } catch (error) {
      console.error('Failed to load costume detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('确定要删除这套服装吗？')) return;
    try {
      await costumeApi.remove(id);
      await refreshOverview();
      navigate('/costumes');
    } catch (error) {
      console.error('Failed to delete costume:', error);
    }
  };

  const handleMarkWashed = async () => {
    if (!id) return;
    try {
      await costumeApi.markWashed(id);
      await refreshOverview();
      loadData(id);
    } catch (error) {
      console.error('Failed to mark as washed:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="lg:col-span-2 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!costume) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">服装不存在</p>
        <Link to="/costumes" className="text-primary-600 hover:underline mt-2 inline-block">
          返回列表
        </Link>
      </div>
    );
  }

  const groupedAccessories = costume.accessories?.reduce((acc, accItem) => {
    const category = accItem.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(accItem);
    return acc;
  }, {} as Record<string, typeof costume.accessories>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{costume.name}</h1>
          <p className="text-gray-500">编号：{costume.id}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {costume.wash_status === 'dirty' && (
            <Button variant="outline" onClick={handleMarkWashed} leftIcon={<Droplets className="w-4 h-4" />}>
              标记已清洗
            </Button>
          )}
          <Link to={`/costumes/${costume.id}/edit`}>
            <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
              编辑
            </Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
            删除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-50">
              {costume.photo_url ? (
                <img
                  src={costume.photo_url}
                  alt={costume.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  👗
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <StatusBadge status={costume.status} />
              <StatusBadge status={costume.wash_status} type="wash" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">使用统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 使用次数
                </span>
                <span className="font-semibold text-gray-800">{costume.use_count} 次</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 录入时间
                </span>
                <span className="font-medium text-gray-700 text-sm">
                  {costume.created_at?.split('T')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">服装编号</p>
                  <p className="font-medium text-gray-800">{costume.id}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shirt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">款式名称</p>
                  <p className="font-medium text-gray-800">{costume.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">尺码</p>
                  <p className="font-medium text-gray-800">{costume.size}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Theater className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">适用节目</p>
                  <p className="font-medium text-gray-800">{costume.program || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">配饰清单</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([category, config]) => {
                const Icon = config.icon;
                const items = groupedAccessories[category] || [];
                const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-3 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-gray-800">{config.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{items.length} 项 / {totalQty} 件</p>
                    {items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {items.map((item) => (
                          <li key={item.id} className="text-xs text-gray-600 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" />
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">借用历史</h2>
              <Link to="/borrow/records" className="text-sm text-primary-600 hover:underline">
                查看全部
              </Link>
            </div>
            {borrowRecords.length > 0 ? (
              <div className="space-y-3">
                {borrowRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600">
                          {record.student_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{record.student_name}</p>
                        <p className="text-xs text-gray-500">
                          {record.club_name} · {record.activity_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={record.status} type="borrow" />
                      <p className="text-xs text-gray-400 mt-1">
                        {record.borrow_date?.split('T')[0]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">暂无借用记录</p>
            )}
          </div>

          {costume.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">备注</h2>
              <p className="text-gray-600">{costume.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
