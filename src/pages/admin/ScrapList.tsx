import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  User,
  FileText,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/context/authStore';
import { umbrellaService } from '@/services/umbrellaService';
import type { Umbrella, ScrapRecord } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { SCRAP_REASONS } from '@/utils/constants';

export const ScrapList: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [scrappedUmbrellas, setScrappedUmbrellas] = useState<Umbrella[]>([]);
  const [scrapRecords, setScrapRecords] = useState<ScrapRecord[]>([]);
  const [selectedUmbrella, setSelectedUmbrella] = useState<Umbrella | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterReason, setFilterReason] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [isLoggedIn, navigate]);

  const loadData = () => {
    setScrappedUmbrellas(umbrellaService.getScrapped());
    setScrapRecords(umbrellaService.getScrapRecords());
  };

  const getScrapRecord = (umbrellaId: string) => {
    return scrapRecords.find(r => r.umbrellaId === umbrellaId);
  };

  const filteredUmbrellas = scrappedUmbrellas.filter(u => {
    const record = getScrapRecord(u.id);
    if (filterReason !== 'all' && record?.reason !== filterReason) {
      return false;
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        u.color.toLowerCase().includes(keyword) ||
        u.brand.toLowerCase().includes(keyword) ||
        u.foundLocation.building.toLowerCase().includes(keyword) ||
        record?.operator.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  const stats = {
    total: scrappedUmbrellas.length,
    damaged: scrappedUmbrellas.filter(u => {
      const r = getScrapRecord(u.id);
      return r?.reason === '破损严重';
    }).length,
    lost: scrappedUmbrellas.filter(u => {
      const r = getScrapRecord(u.id);
      return r?.reason === '遗失';
    }).length,
    other: scrappedUmbrellas.filter(u => {
      const r = getScrapRecord(u.id);
      return r?.reason === '其他';
    }).length,
  };

  if (!isLoggedIn) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
          报废清单
        </h1>
        <p className="text-gray-500">查看和管理报废雨伞记录</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">报废总数</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <Trash2 className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">破损严重</p>
              <p className="text-4xl font-bold mt-2">{stats.damaged}</p>
            </div>
            <FileText className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">遗失</p>
              <p className="text-4xl font-bold mt-2">{stats.lost}</p>
            </div>
            <User className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">其他原因</p>
              <p className="text-4xl font-bold mt-2">{stats.other}</p>
            </div>
            <FileText className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">报废雨伞列表</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="w-36"
                options={[
                  { value: 'all', label: '全部原因' },
                  ...SCRAP_REASONS.map((r) => ({ value: r, label: r })),
                ]}
              />
            </div>
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索颜色、品牌、楼栋..."
                className="pl-9"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>

        {filteredUmbrellas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Trash2 className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">暂无报废雨伞记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">雨伞信息</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">报废原因</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">备注</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">操作人</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">报废时间</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUmbrellas.map((umbrella) => {
                  const record = getScrapRecord(umbrella.id);
                  return (
                    <tr key={umbrella.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={umbrella.canopyPhoto}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: umbrella.colorHex }}
                              />
                              <span className="font-medium text-gray-800">
                                {umbrella.color}伞 · {umbrella.brand}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {umbrella.foundLocation.building}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            record?.reason === '破损严重' ? 'danger' :
                            record?.reason === '遗失' ? 'warning' : 'info'
                          }
                        >
                          {record?.reason || '-'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="text-sm text-gray-600 truncate">
                          {record?.remark || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {record?.operator || '-'}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {record?.scrapTime ? formatDate(record.scrapTime) : '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUmbrella(umbrella);
                            setShowDetailModal(true);
                          }}
                        >
                          查看详情
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="报废雨伞详情"
        size="lg"
      >
        {selectedUmbrella && (() => {
          const record = getScrapRecord(selectedUmbrella.id);
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">伞面照片</p>
                  <img
                    src={selectedUmbrella.canopyPhoto}
                    alt="伞面"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">伞柄照片</p>
                  <img
                    src={selectedUmbrella.handlePhoto}
                    alt="伞柄"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: selectedUmbrella.colorHex }}
                  />
                  <span className="font-semibold text-gray-800">
                    {selectedUmbrella.color}伞 · {selectedUmbrella.brand}
                  </span>
                  <StatusBadge status={selectedUmbrella.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedUmbrella.features.map((f) => (
                    <Badge key={f} variant="info" size="sm">{f}</Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{selectedUmbrella.description}</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  报废信息
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">报废原因</p>
                    <p className="font-medium text-red-700">{record?.reason || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">操作人</p>
                    <p className="font-medium">{record?.operator || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">报废时间</p>
                    <p className="font-medium">
                      {record?.scrapTime ? formatDate(record.scrapTime) : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">备注</p>
                    <p className="text-gray-700">{record?.remark || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-3">历史信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">拾到地点</p>
                    <p className="font-medium">
                      {selectedUmbrella.foundLocation.building} {selectedUmbrella.foundLocation.area}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">拾到时间</p>
                    <p className="font-medium">{formatDate(selectedUmbrella.foundTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">存放位置</p>
                    <p className="font-medium">{selectedUmbrella.storageCell}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
