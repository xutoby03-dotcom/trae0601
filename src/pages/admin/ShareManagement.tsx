import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  Clock,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  RefreshCw,
  Filter,
  AlertTriangle,
  Handshake,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useAuthStore } from '@/context/authStore';
import { umbrellaService } from '@/services/umbrellaService';
import { shareService } from '@/services/shareService';
import type { Umbrella, ShareRecord, SharedFrom } from '@/types';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { BUILDINGS } from '@/utils/constants';

export const ShareManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [sharedUmbrellas, setSharedUmbrellas] = useState<Umbrella[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<ShareRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'borrowed'>('all');
  const [filterSource, setFilterSource] = useState<'all' | SharedFrom>('all');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedUmbrella, setSelectedUmbrella] = useState<Umbrella | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ShareRecord | null>(null);
  const [borrowForm, setBorrowForm] = useState({
    borrowerName: '',
    borrowerClass: '',
    borrowerPhone: '',
    location: BUILDINGS[0],
    remark: '',
  });
  const [returnForm, setReturnForm] = useState({
    returnLocation: BUILDINGS[0],
    remark: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [isLoggedIn, navigate]);

  const loadData = () => {
    setSharedUmbrellas(umbrellaService.getShared());
    setBorrowRecords(shareService.getAll());
  };

  const handleBorrow = async () => {
    if (!selectedUmbrella) return;
    if (!borrowForm.borrowerName.trim() || !borrowForm.borrowerPhone.trim()) {
      alert('请填写借用人姓名和手机号');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    shareService.borrow({
      umbrellaId: selectedUmbrella.id,
      borrowerName: borrowForm.borrowerName,
      borrowerClass: borrowForm.borrowerClass,
      borrowerPhone: borrowForm.borrowerPhone,
      borrowLocation: borrowForm.location,
      remark: borrowForm.remark,
    });
    
    loadData();
    setShowBorrowModal(false);
    resetBorrowForm();
    setIsProcessing(false);
  };

  const handleReturn = async () => {
    if (!selectedRecord) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    shareService.returnUmbrella(selectedRecord.id, {
      returnLocation: returnForm.returnLocation,
      remark: returnForm.remark,
    });
    
    loadData();
    setShowReturnModal(false);
    resetReturnForm();
    setIsProcessing(false);
  };

  const resetBorrowForm = () => {
    setBorrowForm({
      borrowerName: '',
      borrowerClass: '',
      borrowerPhone: '',
      location: BUILDINGS[0],
      remark: '',
    });
  };

  const resetReturnForm = () => {
    setReturnForm({
      returnLocation: BUILDINGS[0],
      remark: '',
    });
  };

  const openBorrowModal = (umbrella: Umbrella) => {
    setSelectedUmbrella(umbrella);
    setShowBorrowModal(true);
  };

  const openReturnModal = (record: ShareRecord) => {
    setSelectedRecord(record);
    setShowReturnModal(true);
  };

  const filteredUmbrellas = sharedUmbrellas.filter(u => {
    if (filterSource !== 'all') {
      if (filterSource === 'auto_expired' && u.sharedFrom !== 'auto_expired') return false;
      if (filterSource === 'manual' && u.sharedFrom !== 'manual' && u.sharedFrom !== undefined) return false;
    }
    if (filterStatus === 'all') return true;
    if (filterStatus === 'available') {
      const record = shareService.getActiveRecord(u.id);
      return !record;
    }
    if (filterStatus === 'borrowed') {
      const record = shareService.getActiveRecord(u.id);
      return !!record;
    }
    return true;
  });

  const activeBorrows = borrowRecords.filter(r => r.status === 'borrowed');
  const availableCount = sharedUmbrellas.length - activeBorrows.length;
  const autoExpiredCount = sharedUmbrellas.filter(u => u.sharedFrom === 'auto_expired').length;
  const manualCount = sharedUmbrellas.filter(u => u.sharedFrom === 'manual' || !u.sharedFrom).length;

  if (!isLoggedIn) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
          共享伞管理
        </h1>
        <p className="text-gray-500">管理共享伞的借用和归还</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">共享伞总数</p>
              <p className="text-4xl font-bold mt-2">{sharedUmbrellas.length}</p>
            </div>
            <Share2 className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">可借用</p>
              <p className="text-4xl font-bold mt-2">{availableCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">借用中</p>
              <p className="text-4xl font-bold mt-2">{activeBorrows.length}</p>
            </div>
            <Clock className="w-12 h-12 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">超期转入</p>
              <p className="text-4xl font-bold mt-2">{autoExpiredCount}</p>
              <p className="text-white/60 text-xs mt-1">手动转入 {manualCount}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">共享伞列表</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="w-32"
                options={[
                  { value: 'all', label: '全部来源' },
                  { value: 'auto_expired', label: '超期转入' },
                  { value: 'manual', label: '手动转入' },
                ]}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-32"
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'available', label: '可借用' },
                { value: 'borrowed', label: '借用中' },
              ]}
            />
            <Button variant="ghost" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>

        {filteredUmbrellas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Share2 className="w-12 h-12 mx-auto mb-2" />
            <p>暂无共享伞</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUmbrellas.map((umbrella) => {
              const activeRecord = shareService.getActiveRecord(umbrella.id);
              const isAutoExpired = umbrella.sharedFrom === 'auto_expired';
              return (
                <div
                  key={umbrella.id}
                  className={`p-4 rounded-xl border transition-colors hover:shadow-md ${
                    isAutoExpired
                      ? 'bg-[#FFF8E6] border-[#FFE4A3] hover:border-[#FF8C42]'
                      : 'bg-gray-50 border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {isAutoExpired ? (
                      <Badge variant="warning" className="inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        超期转入
                      </Badge>
                    ) : (
                      <Badge variant="info" className="inline-flex items-center gap-1">
                        <Handshake className="w-3 h-3" />
                        手动转入
                      </Badge>
                    )}
                    {umbrella.sharedAt && (
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(umbrella.sharedAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <img
                      src={umbrella.canopyPhoto}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: umbrella.colorHex }}
                        />
                        <span className="font-medium text-gray-800 truncate">
                          {umbrella.color}伞 · {umbrella.brand}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          原拾到：{umbrella.foundLocation.building}
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          原拾到：{formatDate(umbrella.foundTime).split(' ')[0]}
                        </p>
                        <p>存放格：{umbrella.storageCell}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {activeRecord ? (
                      <div className="p-2 bg-orange-50 rounded-lg mb-3">
                        <p className="text-xs text-orange-700 font-medium">
                          借用中 · {activeRecord.borrowerName}
                        </p>
                        <p className="text-xs text-orange-600">
                          {formatRelativeTime(activeRecord.borrowTime)}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="success" className="mb-2">可借用</Badge>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200/50">
                    {activeRecord ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => openReturnModal(activeRecord)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        确认归还
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => openBorrowModal(umbrella)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        登记借用
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">借用记录</h2>
        {borrowRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-2" />
            <p>暂无借用记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">来源</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">雨伞</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用地点</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">归还时间</th>
                </tr>
              </thead>
              <tbody>
                {borrowRecords.slice(0, 20).map((record) => {
                  const umbrella = umbrellaService.getById(record.umbrellaId);
                  const isAutoExpired = umbrella?.sharedFrom === 'auto_expired';
                  return (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {umbrella && (
                          isAutoExpired ? (
                            <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              超期
                            </Badge>
                          ) : (
                            <Badge variant="info" size="sm" className="inline-flex items-center gap-1">
                              <Handshake className="w-2.5 h-2.5" />
                              手动
                            </Badge>
                          )
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {umbrella && (
                          <div className="flex items-center gap-2">
                            <img
                              src={umbrella.canopyPhoto}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-gray-800">
                              {umbrella.color} · {umbrella.brand}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-800">{record.borrowerName}</p>
                        <p className="text-xs text-gray-500">{record.borrowerClass}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.borrowLocation}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(record.borrowTime)}</td>
                      <td className="py-3 px-4">
                        {record.status === 'borrowed' ? (
                          <Badge variant="warning">借用中</Badge>
                        ) : (
                          <Badge variant="success">已归还</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {record.returnTime ? formatDate(record.returnTime) : '-'}
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
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title="登记借用"
        size="md"
      >
        {selectedUmbrella && (() => {
          const isAutoExpired = selectedUmbrella.sharedFrom === 'auto_expired';
          return (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${
                isAutoExpired
                  ? 'bg-[#FFF8E6] border-[#FFE4A3]'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  {isAutoExpired ? (
                    <Badge variant="warning" className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      超期转入
                    </Badge>
                  ) : (
                    <Badge variant="info" className="inline-flex items-center gap-1">
                      <Handshake className="w-3 h-3" />
                      手动转入
                    </Badge>
                  )}
                  {selectedUmbrella.sharedAt && (
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(selectedUmbrella.sharedAt)}转入
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <img
                    src={selectedUmbrella.canopyPhoto}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedUmbrella.colorHex }}
                      />
                      <span className="font-medium text-gray-800">
                        {selectedUmbrella.color}伞 · {selectedUmbrella.brand}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        原拾到：{selectedUmbrella.foundLocation.building}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        原拾到：{formatDate(selectedUmbrella.foundTime).split(' ')[0]}
                      </p>
                      <p>存放格：{selectedUmbrella.storageCell}</p>
                    </div>
                  </div>
                </div>
              </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="借用人姓名 *"
                value={borrowForm.borrowerName}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrowerName: e.target.value })}
                placeholder="请输入姓名"
              />
              <Input
                label="班级"
                value={borrowForm.borrowerClass}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrowerClass: e.target.value })}
                placeholder="如：高三(1)班"
              />
            </div>

            <Input
              label="手机号 *"
              value={borrowForm.borrowerPhone}
              onChange={(e) => setBorrowForm({ ...borrowForm, borrowerPhone: e.target.value })}
              placeholder="请输入手机号"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="借用地点"
                  value={borrowForm.location}
                  onChange={(e) => setBorrowForm({ ...borrowForm, location: e.target.value })}
                  options={BUILDINGS.map((b) => ({ value: b, label: b }))}
                />
              </div>
            </div>

            <TextArea
              label="备注"
              value={borrowForm.remark}
              onChange={(e) => setBorrowForm({ ...borrowForm, remark: e.target.value })}
              placeholder="可选填写"
              rows={2}
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowBorrowModal(false)}>
                取消
              </Button>
              <Button onClick={handleBorrow} isLoading={isProcessing}>
                确认借用
              </Button>
            </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="确认归还"
        size="md"
      >
        {selectedRecord && (() => {
          const umbrella = umbrellaService.getById(selectedRecord.umbrellaId);
          return umbrella ? (
            <div className="space-y-5">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {selectedRecord.borrowerName}
                  </span>
                  <span className="text-green-600">
                    {selectedRecord.borrowerClass}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedRecord.borrowLocation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedRecord.borrowTime)}
                  </span>
                </div>
              </div>

              {(() => {
                const isAutoExpired = umbrella.sharedFrom === 'auto_expired';
                return (
                  <div className={`p-4 rounded-xl border ${
                    isAutoExpired
                      ? 'bg-[#FFF8E6] border-[#FFE4A3]'
                      : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      {isAutoExpired ? (
                        <Badge variant="warning" className="inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          超期转入
                        </Badge>
                      ) : (
                        <Badge variant="info" className="inline-flex items-center gap-1">
                          <Handshake className="w-3 h-3" />
                          手动转入
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <img
                        src={umbrella.canopyPhoto}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: umbrella.colorHex }}
                          />
                          <span className="font-medium text-gray-800">
                            {umbrella.color}伞 · {umbrella.brand}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            原拾到：{umbrella.foundLocation.building}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            原拾到：{formatDate(umbrella.foundTime).split(' ')[0]}
                          </p>
                          <p>存放格：{umbrella.storageCell}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <Select
                  label="归还地点"
                  value={returnForm.returnLocation}
                  onChange={(e) => setReturnForm({ ...returnForm, returnLocation: e.target.value })}
                  options={BUILDINGS.map((b) => ({ value: b, label: b }))}
                />
              </div>

              <TextArea
                label="备注"
                value={returnForm.remark}
                onChange={(e) => setReturnForm({ ...returnForm, remark: e.target.value })}
                placeholder="雨伞状况、是否有损坏等"
                rows={2}
              />

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowReturnModal(false)}>
                  取消
                </Button>
                <Button onClick={handleReturn} isLoading={isProcessing}>
                  确认归还
                </Button>
              </div>
            </div>
          ) : null;
        })()}
      </Modal>
    </div>
  );
};
