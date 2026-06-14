import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building2, Calendar, DollarSign, FileText, Check, ArrowLeft, Phone, Crown } from 'lucide-react';
import { costumeApi } from '../services/costumeService';
import { borrowApi } from '../services/borrowService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Costume } from '../../shared/types';
import { useAppStore } from '../stores/appStore';

export default function BorrowForm() {
  const navigate = useNavigate();
  const { refreshOverview } = useAppStore();

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    student_name: '',
    club_name: '',
    activity_name: '',
    borrow_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    deposit: 0,
    notes: '',
    club_leader_name: '',
    club_leader_contact: '',
  });

  useEffect(() => {
    loadAvailableCostumes();
  }, []);

  const loadAvailableCostumes = async () => {
    try {
      const result = await costumeApi.getList({ status: 'available', pageSize: 50 });
      setCostumes(result.list);
    } catch (error) {
      console.error('Failed to load costumes:', error);
    }
  };

  const filteredCostumes = costumes.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.program && c.program.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'deposit' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCostume) return;

    setSubmitLoading(true);
    try {
      await borrowApi.create({
        costume_id: selectedCostume.id,
        ...formData,
      });
      await refreshOverview();
      navigate('/borrow/records');
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedCostume;
    if (step === 2) {
      return (
        formData.student_name.trim() !== '' &&
        formData.club_name.trim() !== '' &&
        formData.expected_return_date !== ''
      );
    }
    return true;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">借出登记</h1>
          <p className="text-gray-500">登记服装借出信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 text-sm text-gray-500 -mt-4 mb-6">
          <span className={step >= 1 ? 'text-primary-600 font-medium' : ''}>选择服装</span>
          <span className={step >= 2 ? 'text-primary-600 font-medium' : ''}>填写信息</span>
          <span className={step >= 3 ? 'text-primary-600 font-medium' : ''}>确认提交</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Input
              placeholder="搜索服装编号、名称、节目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {filteredCostumes.map((costume) => (
                <button
                  key={costume.id}
                  onClick={() => setSelectedCostume(costume)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedCostume?.id === costume.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden">
                    {costume.photo_url ? (
                      <img src={costume.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        👗
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-gray-800 text-sm truncate">{costume.name}</p>
                  <p className="text-xs text-gray-500">{costume.id} · {costume.size}</p>
                </button>
              ))}
            </div>

            {filteredCostumes.length === 0 && (
              <p className="text-center text-gray-400 py-8">无可借用的服装</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="借用人姓名"
                name="student_name"
                value={formData.student_name}
                onChange={handleInputChange}
                placeholder="请输入学生姓名"
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="所属社团"
                name="club_name"
                value={formData.club_name}
                onChange={handleInputChange}
                placeholder="请输入社团名称"
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />
              <Input
                label="活动名称"
                name="activity_name"
                value={formData.activity_name}
                onChange={handleInputChange}
                placeholder="请输入活动名称"
                leftIcon={<FileText className="w-4 h-4" />}
              />
              <Input
                label="押金金额（元）"
                name="deposit"
                type="number"
                min="0"
                value={formData.deposit}
                onChange={handleInputChange}
                placeholder="0"
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
              <Input
                label="借出日期"
                name="borrow_date"
                type="date"
                value={formData.borrow_date}
                onChange={handleInputChange}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
              />
              <Input
                label="预计归还日期"
                name="expected_return_date"
                type="date"
                value={formData.expected_return_date}
                onChange={handleInputChange}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
              />
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">社团负责人（逾期联系）</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="社长姓名"
                  name="club_leader_name"
                  value={formData.club_leader_name}
                  onChange={handleInputChange}
                  placeholder="请输入社长姓名"
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="联系电话"
                  name="club_leader_contact"
                  value={formData.club_leader_contact}
                  onChange={handleInputChange}
                  placeholder="请输入联系电话"
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="输入备注信息..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-4">确认借出信息</h3>
              
              {selectedCostume && (
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200">
                    {selectedCostume.photo_url ? (
                      <img src={selectedCostume.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedCostume.name}</p>
                    <p className="text-sm text-gray-500">{selectedCostume.id} · {selectedCostume.size}</p>
                    <StatusBadge status={selectedCostume.status} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">借用人：</span>
                  <span className="font-medium text-gray-800">{formData.student_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">所属社团：</span>
                  <span className="font-medium text-gray-800">{formData.club_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">活动名称：</span>
                  <span className="font-medium text-gray-800">{formData.activity_name || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">押金：</span>
                  <span className="font-medium text-gray-800">¥{formData.deposit}</span>
                </div>
                <div>
                  <span className="text-gray-500">借出日期：</span>
                  <span className="font-medium text-gray-800">{formData.borrow_date}</span>
                </div>
                <div>
                  <span className="text-gray-500">预计归还：</span>
                  <span className="font-medium text-gray-800">{formData.expected_return_date}</span>
                </div>
              </div>

              {(formData.club_leader_name || formData.club_leader_contact) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600">社团负责人</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">社长姓名：</span>
                      <span className="font-medium text-gray-800">{formData.club_leader_name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">联系电话：</span>
                      <span className="font-medium text-gray-800">{formData.club_leader_contact || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">备注：</span>
                  <p className="text-gray-700 text-sm mt-1">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            上一步
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canProceed()}
            >
              下一步
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitLoading}>
              确认借出
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
