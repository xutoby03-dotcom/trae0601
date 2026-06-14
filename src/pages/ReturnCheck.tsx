import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Check,
  X,
  Shirt,
  Crown,
  Link as LinkIcon,
  Footprints,
  Droplets,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { borrowApi, type ReturnData, type BorrowDetail } from '../services/borrowService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAppStore } from '../stores/appStore';

interface CheckItem {
  key: keyof ReturnData;
  label: string;
  icon: typeof Shirt;
  category: 'accessory' | 'condition';
}

const checkItems: CheckItem[] = [
  { key: 'clothes_ok', label: '衣服完好', icon: Shirt, category: 'accessory' },
  { key: 'headdress_ok', label: '头饰完好', icon: Crown, category: 'accessory' },
  { key: 'belt_ok', label: '腰带完好', icon: LinkIcon, category: 'accessory' },
  { key: 'shoe_cover_ok', label: '鞋套完好', icon: Footprints, category: 'accessory' },
];

const conditionItems: CheckItem[] = [
  { key: 'clean_ok', label: '已清洗', icon: Droplets, category: 'condition' },
  { key: 'has_stain', label: '有污渍', icon: AlertTriangle, category: 'condition' },
  { key: 'has_damage', label: '有破损', icon: AlertTriangle, category: 'condition' },
];

export default function ReturnCheckPage() {
  const navigate = useNavigate();
  const { refreshOverview } = useAppStore();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBorrows, setActiveBorrows] = useState<BorrowDetail[]>([]);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowDetail | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<ReturnData>({
    clothes_ok: false,
    headdress_ok: false,
    belt_ok: false,
    shoe_cover_ok: false,
    clean_ok: false,
    has_stain: false,
    has_damage: false,
    issues: '',
  });

  useEffect(() => {
    loadActiveBorrows();
  }, []);

  const loadActiveBorrows = async () => {
    try {
      const [borrowed, overdue] = await Promise.all([
        borrowApi.getList({ status: 'borrowed', pageSize: 50 }),
        borrowApi.getOverdue(),
      ]);
      setActiveBorrows([...borrowed.list, ...overdue] as BorrowDetail[]);
    } catch (error) {
      console.error('Failed to load active borrows:', error);
    }
  };

  const filteredBorrows = activeBorrows.filter(
    (b) =>
      b.costume_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.costume_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCheck = (key: keyof ReturnData) => {
    setCheckResult((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const canStock =
    checkResult.clean_ok &&
    checkResult.clothes_ok &&
    checkResult.headdress_ok &&
    checkResult.belt_ok &&
    checkResult.shoe_cover_ok &&
    !checkResult.has_stain &&
    !checkResult.has_damage;

  const completedCount = [
    checkResult.clothes_ok,
    checkResult.headdress_ok,
    checkResult.belt_ok,
    checkResult.shoe_cover_ok,
  ].filter(Boolean).length;

  const progress = (completedCount / 4) * 100;

  const handleSubmit = async () => {
    if (!selectedBorrow?.id) return;

    setSubmitLoading(true);
    try {
      await borrowApi.returnCostume(selectedBorrow.id!, checkResult);
      await refreshOverview();
      setStep(3);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSubmitLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-800">归还检查</h1>
          <p className="text-gray-500">逐项检查并确认归还状态</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">选择待归还的服装</h2>

          <Input
            placeholder="搜索服装编号、名称或借用人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="mb-4"
          />

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredBorrows.length > 0 ? (
              filteredBorrows.map((borrow) => (
                <button
                  key={borrow.id}
                  onClick={() => {
                    setSelectedBorrow(borrow);
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedBorrow?.id === borrow.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {borrow.costume_photo ? (
                        <img
                          src={borrow.costume_photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          👗
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {borrow.costume_name}
                        </h3>
                        <StatusBadge status={borrow.status} type="borrow" />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {borrow.costume_id} · {borrow.costume_size}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>借用人：{borrow.student_name}</span>
                        <span>社团：{borrow.club_name}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">暂无在借服装</p>
            )}
          </div>
        </div>
      )}

      {step === 2 && selectedBorrow && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {selectedBorrow.costume_photo ? (
                  <img
                    src={selectedBorrow.costume_photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    👗
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{selectedBorrow.costume_name}</h3>
                <p className="text-gray-500">
                  {selectedBorrow.costume_id} · {selectedBorrow.costume_size}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  借用人：{selectedBorrow.student_name} · {selectedBorrow.club_name}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">检查进度</h4>
                <span className="text-sm text-gray-500">{completedCount}/4 项</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">配饰检查</h2>
            <div className="grid grid-cols-2 gap-4">
              {checkItems.map((item) => {
                const Icon = item.icon;
                const isChecked = checkResult[item.key] as boolean;
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleCheck(item.key)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isChecked
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isChecked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isChecked ? 'text-green-700' : 'text-gray-700'}`}>
                          {item.label}
                        </p>
                      </div>
                      {isChecked ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">状态检查</h2>
            <div className="space-y-3">
              {conditionItems.map((item) => {
                const Icon = item.icon;
                const isChecked = checkResult[item.key] as boolean;
                const isNegative = item.key === 'has_stain' || item.key === 'has_damage';

                return (
                  <button
                    key={item.key}
                    onClick={() => toggleCheck(item.key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isChecked
                        ? isNegative
                          ? 'border-red-500 bg-red-50'
                          : 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isChecked
                            ? isNegative
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-medium flex-1 ${
                          isChecked
                            ? isNegative
                              ? 'text-red-700'
                              : 'text-green-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </span>
                      {isChecked ? (
                        isNegative ? (
                          <XCircle className="w-6 h-6 text-red-500" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">问题记录</h2>
            <textarea
              value={checkResult.issues || ''}
              onChange={(e) =>
                setCheckResult((prev) => ({ ...prev, issues: e.target.value }))
              }
              rows={4}
              placeholder="记录归还时发现的问题..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div
            className={`p-5 rounded-xl ${
              canStock ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {canStock ? (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              )}
              <div>
                <h3
                  className={`font-semibold ${
                    canStock ? 'text-green-800' : 'text-amber-800'
                  }`}
                >
                  {canStock ? '可直接入库' : '不能直接入库'}
                </h3>
                <p className={`text-sm mt-1 ${canStock ? 'text-green-600' : 'text-amber-600'}`}>
                  {canStock
                    ? '所有检查项已通过，服装状态完好且已清洗，可直接入库。'
                    : '服装存在未清洗、缺配饰或污损问题，需标记待处理。'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              返回选择
            </Button>
            <Button onClick={handleSubmit} loading={submitLoading}>
              确认归还
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">归还登记成功</h2>
          <p className="text-gray-500 mb-6">
            {canStock ? '服装已成功入库' : '服装已标记为待处理状态'}
          </p>

          <div className="bg-gray-50 rounded-xl p-5 text-left max-w-md mx-auto mb-8">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">服装</span>
                <span className="font-medium text-gray-800">{selectedBorrow?.costume_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">借用人</span>
                <span className="font-medium text-gray-800">{selectedBorrow?.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态</span>
                <StatusBadge status={canStock ? 'available' : 'pending'} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/borrow/records')}>
              查看记录
            </Button>
            <Button
              onClick={() => {
                setStep(1);
                setSelectedBorrow(null);
                setCheckResult({
                  clothes_ok: false,
                  headdress_ok: false,
                  belt_ok: false,
                  shoe_cover_ok: false,
                  clean_ok: false,
                  has_stain: false,
                  has_damage: false,
                  issues: '',
                });
                loadActiveBorrows();
              }}
            >
              继续归还
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
