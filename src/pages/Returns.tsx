import { useEffect, useState } from 'react';
import { Undo2, RefreshCw, Calendar, Users, Search, Check, AlertTriangle, Droplets, Package } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS, ACCESSORY_LABELS } from '../../shared/types';

interface ReturnItemState {
  costumeId: string;
  accessoryCheck: Accessory;
  hasStain: boolean;
  damageNote: string;
}

export default function Returns() {
  const { pendingReturns, fetchPendingReturns, returnItems, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<LendingRecord | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItemsState, setReturnItemsState] = useState<ReturnItemState[]>([]);

  useEffect(() => {
    fetchPendingReturns();
  }, [fetchPendingReturns]);

  const filteredPending = pendingReturns.filter(r =>
    searchTerm === '' ||
    r.reservation?.className.includes(searchTerm) ||
    r.lenderName.includes(searchTerm)
  );

  const openReturnModal = (record: LendingRecord) => {
    setSelectedRecord(record);
    const items: ReturnItemState[] = record.items
      .filter(item => !item.returned)
      .map(item => ({
        costumeId: item.costumeId,
        accessoryCheck: {
          hat: true,
          tassel: true,
          bowtie: true,
          shawl: true,
        },
        hasStain: false,
        damageNote: '',
      }));
    setReturnItemsState(items);
    setShowReturnModal(true);
  };

  const updateAccessory = (index: number, key: keyof Accessory, value: boolean) => {
    const newItems = [...returnItemsState];
    newItems[index] = {
      ...newItems[index],
      accessoryCheck: {
        ...newItems[index].accessoryCheck,
        [key]: value,
      },
    };
    setReturnItemsState(newItems);
  };

  const updateStain = (index: number, value: boolean) => {
    const newItems = [...returnItemsState];
    newItems[index] = {
      ...newItems[index],
      hasStain: value,
    };
    setReturnItemsState(newItems);
  };

  const updateDamageNote = (index: number, value: string) => {
    const newItems = [...returnItemsState];
    newItems[index] = {
      ...newItems[index],
      damageNote: value,
    };
    setReturnItemsState(newItems);
  };

  const getMissingAccessories = (item: ReturnItemState): string[] => {
    const missing: string[] = [];
    (Object.keys(item.accessoryCheck) as Array<keyof Accessory>).forEach(key => {
      if (!item.accessoryCheck[key]) {
        missing.push(ACCESSORY_LABELS[key]);
      }
    });
    return missing;
  };

  const hasIssues = (): boolean => {
    return returnItemsState.some(item => {
      const missing = getMissingAccessories(item);
      return missing.length > 0 || item.hasStain || item.damageNote.trim() !== '';
    });
  };

  const handleReturn = async () => {
    if (selectedRecord && returnItemsState.length > 0) {
      await returnItems(selectedRecord.id, returnItemsState);
      setShowReturnModal(false);
      setSelectedRecord(null);
      setReturnItemsState([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">归还管理</h1>
          <p className="text-gray-500 mt-1">检查配件和污渍，记录缺损情况</p>
        </div>
        <button
          onClick={() => fetchPendingReturns()}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-600 text-sm">待归还</p>
              <p className="text-2xl font-bold text-blue-800">{pendingReturns.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-red-600 text-sm">逾期未还</p>
              <p className="text-2xl font-bold text-red-800">
                {pendingReturns.filter(r => r.isOverdue).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-orange-600 text-sm">归还后入清洗队列</p>
              <p className="text-2xl font-bold text-orange-800">自动</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Undo2 className="w-5 h-5 text-primary-500" />
          待归还列表
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索班级、领用人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPending.map((record, index) => (
              <div
                key={record.id}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif font-semibold text-gray-800">
                        {record.reservation?.className}
                      </h3>
                      {record.isOverdue && (
                        <span className="status-badge bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          逾期
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>借出：{record.lendDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>应还：{record.expectedReturnDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>领用人：{record.lenderName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>
                          {record.items.filter(i => !i.returned).length} / {record.items.length} 件
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {record.items.filter(i => !i.returned).map((item) => (
                        <span
                          key={item.id}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                        >
                          {item.costume?.type} - {item.costume?.size}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openReturnModal(record)}
                    className="btn-primary flex items-center gap-2 py-2 px-4"
                  >
                    <Undo2 className="w-4 h-4" />
                    归还
                  </button>
                </div>
              </div>
            ))}
            {filteredPending.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无待归还记录
              </div>
            )}
          </div>
        )}
      </div>

      {showReturnModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl font-semibold text-gray-800">
                归还检查 - {selectedRecord.reservation?.className}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                领用人：{selectedRecord.lenderName} | 借出日期：{selectedRecord.lendDate}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {hasIssues() && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">检测到异常情况</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        以下服装存在配件缺失、污渍或损坏，将自动记录到缺损档案
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {returnItemsState.map((itemState, index) => {
                  const originalItem = selectedRecord.items.find(
                    i => i.costumeId === itemState.costumeId
                  );
                  const missing = getMissingAccessories(itemState);
                  const hasItemIssues = missing.length > 0 || itemState.hasStain || itemState.damageNote.trim() !== '';

                  return (
                    <div
                      key={itemState.costumeId}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        hasItemIssues
                          ? 'border-yellow-300 bg-yellow-50/50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {originalItem?.costume?.type} - {originalItem?.costume?.size}
                            </h4>
                            <p className="text-xs text-gray-500">#{itemState.costumeId}</p>
                          </div>
                        </div>
                        {hasItemIssues && (
                          <span className="status-badge bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            有异常
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            配件检查
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(Object.keys(itemState.accessoryCheck) as Array<keyof Accessory>).map((key) => (
                              <label
                                key={key}
                                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                                  itemState.accessoryCheck[key]
                                    ? 'bg-green-50 border-2 border-green-200'
                                    : 'bg-red-50 border-2 border-red-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={itemState.accessoryCheck[key]}
                                  onChange={(e) => updateAccessory(index, key, e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className={itemState.accessoryCheck[key] ? 'text-green-700' : 'text-red-700'}>
                                  {ACCESSORY_LABELS[key]}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={itemState.hasStain}
                              onChange={(e) => updateStain(index, e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-700">有污渍</span>
                          </label>

                          {missing.length > 0 && (
                            <span className="text-sm text-red-600">
                              缺少：{missing.join('、')}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="label">损坏/备注说明</label>
                          <textarea
                            value={itemState.damageNote}
                            onChange={(e) => updateDamageNote(index, e.target.value)}
                            className="input min-h-[60px]"
                            placeholder="如有损坏或其他情况请在此说明..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  归还后服装将自动进入清洗队列，未清洗不可再次预约
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setSelectedRecord(null);
                      setReturnItemsState([]);
                    }}
                    className="btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleReturn}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    确认归还
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
