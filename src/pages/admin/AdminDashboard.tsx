import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Umbrella as UmbrellaIcon,
  PlusCircle,
  Share2,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  FileCheck,
  Users,
  Eye,
} from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { BuildingChart } from '@/components/BuildingChart';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge, ClaimStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/context/authStore';
import { umbrellaService } from '@/services/umbrellaService';
import { claimService } from '@/services/claimService';
import type { DashboardStats, BuildingStat, SimilarUmbrellaGroup, Umbrella, ClaimApplication } from '@/types';
import { formatRelativeTime, getDaysUntilExpiry, formatDate } from '@/utils/dateUtils';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [buildingStats, setBuildingStats] = useState<BuildingStat[]>([]);
  const [similarGroups, setSimilarGroups] = useState<SimilarUmbrellaGroup[]>([]);
  const [expiringUmbrellas, setExpiringUmbrellas] = useState<Umbrella[]>([]);
  const [pendingClaims, setPendingClaims] = useState<ClaimApplication[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimApplication | null>(null);
  const [selectedUmbrella, setSelectedUmbrella] = useState<Umbrella | null>(null);
  const [showClaimDetail, setShowClaimDetail] = useState(false);
  const [showUmbrellaDetail, setShowUmbrellaDetail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [isLoggedIn, navigate]);

  const loadData = () => {
    setStats(umbrellaService.getDashboardStats());
    setBuildingStats(umbrellaService.getBuildingStats());
    setSimilarGroups(umbrellaService.getSimilarUmbrellas());
    setExpiringUmbrellas(umbrellaService.getExpiringUmbrellas());
    setPendingClaims(claimService.getPending());
  };

  const handleApproveClaim = async (claimId: string) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    claimService.approve(claimId);
    loadData();
    setShowClaimDetail(false);
    setIsProcessing(false);
  };

  const handleRejectClaim = async (claimId: string) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    claimService.reject(claimId, '特征描述不符');
    loadData();
    setShowClaimDetail(false);
    setIsProcessing(false);
  };

  const handleTransferToShared = async (umbrellaId: string) => {
    if (confirm('确定将此雨伞转为共享备用伞吗？')) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      umbrellaService.transferToShared(umbrellaId);
      loadData();
      setShowUmbrellaDetail(false);
      setIsProcessing(false);
    }
  };

  const handleScrapUmbrella = async (umbrellaId: string) => {
    const reason = prompt('请输入报废原因：');
    if (!reason) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    umbrellaService.scrapUmbrella(umbrellaId, reason, '管理员');
    loadData();
    setShowUmbrellaDetail(false);
    setIsProcessing(false);
  };

  if (!isLoggedIn) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
          管理后台
        </h1>
        <p className="text-gray-500">查看数据统计和待处理事项</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && (
          <>
            <StatsCard
              title="待认领雨伞"
              value={stats.totalPending}
              icon={UmbrellaIcon}
              color="blue"
              onClick={() => navigate('/')}
            />
            <StatsCard
              title="今日新增"
              value={stats.todayNew}
              icon={PlusCircle}
              color="green"
              trend={{ value: 12, isUp: true }}
            />
            <StatsCard
              title="共享伞数量"
              value={stats.sharedCount}
              icon={Share2}
              color="purple"
              onClick={() => navigate('/admin/share')}
            />
            <StatsCard
              title="待审核认领"
              value={stats.pendingClaims}
              icon={FileCheck}
              color="orange"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BuildingChart data={buildingStats} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            即将到期
          </h3>
          {expiringUmbrellas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>暂无即将到期的雨伞</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {expiringUmbrellas.map((umbrella) => {
                const daysLeft = getDaysUntilExpiry(umbrella.foundTime, umbrella.storagePeriodDays);
                return (
                  <div
                    key={umbrella.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedUmbrella(umbrella);
                      setShowUmbrellaDetail(true);
                    }}
                  >
                    <img
                      src={umbrella.canopyPhoto}
                      alt={umbrella.color}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: umbrella.colorHex }}
                        />
                        <span className="font-medium text-gray-800 truncate">
                          {umbrella.color}伞 · {umbrella.brand}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {umbrella.foundLocation.building}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          daysLeft <= 1 ? 'text-red-600' : 'text-orange-600'
                        }`}
                      >
                        {daysLeft > 0 ? `${daysLeft}天` : '今日'}
                      </span>
                      <p className="text-xs text-gray-400">到期</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {similarGroups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            疑似重复雨伞
            <Badge variant="warning" size="sm">{similarGroups.length}组</Badge>
          </h3>
          <div className="space-y-4">
            {similarGroups.map((group) => (
              <div key={group.groupId} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-700">
                      相似度 {group.similarity}%
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.umbrellas[0].color} · {group.umbrellas[0].foundLocation.building}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {group.umbrellas.map((umbrella) => (
                    <div
                      key={umbrella.id}
                      className="flex-shrink-0 w-32 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors"
                      onClick={() => {
                        setSelectedUmbrella(umbrella);
                        setShowUmbrellaDetail(true);
                      }}
                    >
                      <img
                        src={umbrella.canopyPhoto}
                        alt=""
                        className="w-full aspect-square rounded-lg object-cover mb-2"
                      />
                      <p className="text-xs text-gray-600 truncate">
                        {umbrella.foundLocation.area}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(umbrella.foundTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#4A90D9]" />
          待审核认领申请
        </h3>
        {pendingClaims.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p>暂无待审核的认领申请</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">雨伞信息</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">申请人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">申请时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingClaims.map((claim) => {
                  const umbrella = umbrellaService.getById(claim.umbrellaId);
                  return (
                    <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        {umbrella && (
                          <div className="flex items-center gap-3">
                            <img
                              src={umbrella.canopyPhoto}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                {umbrella.color}伞 · {umbrella.brand}
                              </p>
                              <p className="text-xs text-gray-500">
                                {umbrella.foundLocation.building}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-800">{claim.applicantClass}</p>
                        <p className="text-sm text-gray-500">****{claim.phoneLastFour}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(claim.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <ClaimStatusBadge status={claim.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowClaimDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          审核
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
        isOpen={showClaimDetail}
        onClose={() => setShowClaimDetail(false)}
        title="认领申请审核"
        size="lg"
      >
        {selectedClaim && (() => {
          const umbrella = umbrellaService.getById(selectedClaim.umbrellaId);
          return umbrella ? (
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={umbrella.canopyPhoto}
                  alt=""
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: umbrella.colorHex }}
                    />
                    <h3 className="font-semibold text-gray-800">
                      {umbrella.color}伞 · {umbrella.brand}
                    </h3>
                  </div>
                  <StatusBadge status={umbrella.status} />
                  <p className="text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {umbrella.foundLocation.building} {umbrella.foundLocation.area}
                  </p>
                  <p className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(umbrella.foundTime)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#FFF8E6] border border-[#FFE4A3] rounded-xl">
                <h4 className="font-medium text-[#FF8C42] mb-2">申请人信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">班级：</span>
                    <span className="font-medium">{selectedClaim.applicantClass}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">手机尾号：</span>
                    <span className="font-medium">{selectedClaim.phoneLastFour}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">归属证明描述</h4>
                <div className="p-4 bg-gray-50 rounded-xl text-gray-600 whitespace-pre-wrap">
                  {selectedClaim.ownershipProof}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="danger"
                  onClick={() => handleRejectClaim(selectedClaim.id)}
                  isLoading={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  驳回
                </Button>
                <Button
                  onClick={() => handleApproveClaim(selectedClaim.id)}
                  isLoading={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  通过
                </Button>
              </div>
            </div>
          ) : null;
        })()}
      </Modal>

      <Modal
        isOpen={showUmbrellaDetail}
        onClose={() => setShowUmbrellaDetail(false)}
        title="雨伞详情"
        size="lg"
      >
        {selectedUmbrella && (
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#4A90D9]/5 rounded-xl">
                <p className="text-gray-500 mb-1">拾到地点</p>
                <p className="font-medium">
                  {selectedUmbrella.foundLocation.building} {selectedUmbrella.foundLocation.area}
                </p>
              </div>
              <div className="p-3 bg-[#4A90D9]/5 rounded-xl">
                <p className="text-gray-500 mb-1">存放位置</p>
                <p className="font-medium">{selectedUmbrella.storageCell}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <p className="text-gray-500 mb-1">拾到时间</p>
                <p className="font-medium">{formatDate(selectedUmbrella.foundTime)}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <p className="text-gray-500 mb-1">剩余保管期</p>
                <p className={`font-medium ${
                  getDaysUntilExpiry(selectedUmbrella.foundTime) <= 3 ? 'text-red-600' : ''
                }`}>
                  {getDaysUntilExpiry(selectedUmbrella.foundTime)}天
                </p>
              </div>
            </div>

            {selectedUmbrella.status === 'pending' && (
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button
                  variant="danger"
                  onClick={() => handleScrapUmbrella(selectedUmbrella.id)}
                  isLoading={isProcessing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  标记报废
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleTransferToShared(selectedUmbrella.id)}
                  isLoading={isProcessing}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  转为共享伞
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
