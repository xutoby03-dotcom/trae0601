import React, { useState, useEffect } from 'react';
import { Search, Umbrella as UmbrellaIcon, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Umbrella, UmbrellaFilters, CreateClaimData } from '@/types';
import { umbrellaService } from '@/services/umbrellaService';
import { claimService } from '@/services/claimService';
import { UmbrellaFilter } from '@/components/UmbrellaFilter';
import { UmbrellaCard } from '@/components/UmbrellaCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/dateUtils';

export const UmbrellaList: React.FC = () => {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [filters, setFilters] = useState<UmbrellaFilters>({ status: 'pending' });
  const [selectedUmbrella, setSelectedUmbrella] = useState<Umbrella | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    applicantClass: '',
    phoneLastFour: '',
    ownershipProof: '',
  });
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUmbrellas();
  }, [filters]);

  const loadUmbrellas = () => {
    const data = umbrellaService.getAll(filters);
    setUmbrellas(data);
  };

  const handleFilterChange = (newFilters: UmbrellaFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ status: 'pending' });
  };

  const handleClaim = (umbrella: Umbrella) => {
    setSelectedUmbrella(umbrella);
    setShowClaimModal(true);
    setClaimForm({ applicantClass: '', phoneLastFour: '', ownershipProof: '' });
    setClaimErrors({});
  };

  const validateClaimForm = () => {
    const errors: Record<string, string> = {};
    if (!claimForm.applicantClass.trim()) {
      errors.applicantClass = '请填写班级';
    }
    if (!claimForm.phoneLastFour.trim()) {
      errors.phoneLastFour = '请填写手机号后四位';
    } else if (!/^\d{4}$/.test(claimForm.phoneLastFour)) {
      errors.phoneLastFour = '请输入4位数字';
    }
    if (!claimForm.ownershipProof.trim()) {
      errors.ownershipProof = '请填写归属证明描述';
    } else if (claimForm.ownershipProof.trim().length < 10) {
      errors.ownershipProof = '请详细描述雨伞特征（至少10个字）';
    }
    setClaimErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitClaim = async () => {
    if (!validateClaimForm() || !selectedUmbrella) return;

    setIsSubmitting(true);
    try {
      const claimData: CreateClaimData = {
        umbrellaId: selectedUmbrella.id,
        applicantClass: claimForm.applicantClass.trim(),
        phoneLastFour: claimForm.phoneLastFour.trim(),
        ownershipProof: claimForm.ownershipProof.trim(),
      };

      claimService.create(claimData);
      setShowClaimModal(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = umbrellas.filter(u => u.status === 'pending').length;
  const otherCount = umbrellas.filter(u => u.status !== 'pending').length;

  return (
    <div>
      <div className="bg-gradient-to-r from-[#4A90D9] to-[#5DA3E5] rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <UmbrellaIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
                雨伞招领墙
              </h1>
              <p className="text-white/80 text-sm">雨天过后，让每一把伞都能找到回家的路</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-sm text-white/70">待认领雨伞</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
              <div className="text-2xl font-bold">{otherCount}</div>
              <div className="text-sm text-white/70">其他状态</div>
            </div>
          </div>
        </div>
      </div>

      <UmbrellaFilter
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['pending', 'claimed', 'shared', 'scrapped'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, status }))}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${filters.status === status
                  ? 'bg-[#4A90D9] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {status === 'pending' && '待认领'}
              {status === 'claimed' && '已认领'}
              {status === 'shared' && '共享中'}
              {status === 'scrapped' && '已报废'}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          共 {umbrellas.length} 把雨伞
        </p>
      </div>

      {umbrellas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">没有找到符合条件的雨伞</p>
          <p className="text-gray-400 text-sm">试试调整筛选条件，或稍后再来查看</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {umbrellas.map((umbrella, index) => (
            <div
              key={umbrella.id}
              className="animate-[fadeInUp_0.5s_ease-out]"
              style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <UmbrellaCard
                umbrella={umbrella}
                onClaim={() => handleClaim(umbrella)}
                showActions={umbrella.status === 'pending'}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        title="申请认领"
        size="lg"
      >
        {selectedUmbrella && (
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={selectedUmbrella.canopyPhoto}
                alt="伞面"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-5 h-5 rounded-full border border-white shadow"
                    style={{ backgroundColor: selectedUmbrella.colorHex }}
                  />
                  <h3 className="font-semibold text-gray-800">
                    {selectedUmbrella.color}伞 · {selectedUmbrella.brand}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedUmbrella.features.slice(0, 3).map(f => (
                    <Badge key={f} variant="info" size="sm">{f}</Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  拾到于 {formatDate(selectedUmbrella.foundTime)} · {selectedUmbrella.foundLocation.building}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FFF8E6] border border-[#FFE4A3] rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[#FF8C42] mb-1">认领须知</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 请如实填写以下信息，管理员将核对后联系您</li>
                    <li>• 归属证明请详细描述雨伞独有特征（如磨损位置、特殊标记等）</li>
                    <li>• 冒用他人信息认领将承担相应责任</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="班级"
                placeholder="如：高一(3)班、大三(2)班"
                value={claimForm.applicantClass}
                onChange={(e) => setClaimForm(prev => ({ ...prev, applicantClass: e.target.value }))}
                error={claimErrors.applicantClass}
              />
              <Input
                label="手机号后四位"
                placeholder="请输入4位数字"
                maxLength={4}
                value={claimForm.phoneLastFour}
                onChange={(e) => setClaimForm(prev => ({ ...prev, phoneLastFour: e.target.value.replace(/\D/g, '') }))}
                error={claimErrors.phoneLastFour}
              />
              <TextArea
                label="归属证明描述"
                placeholder="请详细描述这把雨伞的独有特征，如：伞面有划痕、伞柄有名字缩写、是生日礼物等..."
                value={claimForm.ownershipProof}
                onChange={(e) => setClaimForm(prev => ({ ...prev, ownershipProof: e.target.value }))}
                error={claimErrors.ownershipProof}
                rows={4}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowClaimModal(false)}>
                取消
              </Button>
              <Button onClick={handleSubmitClaim} isLoading={isSubmitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                提交申请
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="申请已提交"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-2">您的认领申请已成功提交！</p>
          <p className="text-gray-500 text-sm mb-6">
            管理员将在1-2个工作日内审核，<br />
            请保持手机畅通，留意通知。
          </p>
          <Button onClick={() => setShowSuccess(false)}>
            我知道了
          </Button>
        </div>
      </Modal>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
