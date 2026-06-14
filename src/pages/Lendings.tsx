import { useEffect, useState } from 'react';
import { ArrowRightLeft, RefreshCw, Calendar, Clock, Users, MapPin, User, Phone, Search, Check, ChevronDown, ChevronUp, AlertTriangle, Package } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS, COSTUME_SIZES, ACCESSORY_LABELS } from '../../shared/types';

interface LendingPreview {
  canLend: boolean;
  totalNeeded: number;
  totalAvailable: number;
  allocatedCostumes: { size: string; costumes: { id: string; type: string; color: string; rfidTag: string }[] }[];
  insufficient: { size: string; needed: number; available: number }[];
}

interface UnavailableCostume {
  id: string;
  type: string;
  size: string;
  status: string;
  cleaningStatus: string;
}

interface LendingError {
  message: string;
  unavailableCostumes?: UnavailableCostume[];
}

export default function Lendings() {
  const { reservations, lendingRecords, fetchReservations, fetchLendings, previewLending, createLending, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [lenderName, setLenderName] = useState('');
  const [showLendModal, setShowLendModal] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [preview, setPreview] = useState<LendingPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [lendingError, setLendingError] = useState<LendingError | null>(null);

  useEffect(() => {
    fetchReservations();
    fetchLendings();
  }, [fetchReservations, fetchLendings]);

  const approvedReservations = reservations.filter(r => 
    r.status === '已通过' && 
    (searchTerm === '' || 
     r.className.includes(searchTerm) || 
     r.classContact.includes(searchTerm))
  );

  const handleOpenLendModal = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowLendModal(true);
    setPreview(null);
    setPreviewLoading(true);
    setLenderName('');
    setLendingError(null);
    
    const result = await previewLending(reservation.id);
    setPreview(result);
    setPreviewLoading(false);
  };

  const handleLend = async () => {
    if (selectedReservation && lenderName.trim() && preview?.canLend) {
      const costumeIds = preview.allocatedCostumes.flatMap(group => group.costumes.map(c => c.id));
      setLendingError(null);
      const result = await createLending(selectedReservation.id, lenderName.trim(), costumeIds);
      if (result.success && result.record) {
        setShowLendModal(false);
        setSelectedReservation(null);
        setLenderName('');
        setPreview(null);
      } else if (result.unavailableCostumes && result.unavailableCostumes.length > 0) {
        setLendingError({
          message: result.error || '部分服装已无法借出',
          unavailableCostumes: result.unavailableCostumes
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowLendModal(false);
    setSelectedReservation(null);
    setLenderName('');
    setPreview(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">借出管理</h1>
          <p className="text-gray-500 mt-1">按尺码自动分配服装，管理借出记录</p>
        </div>
        <button
          onClick={() => {
            fetchReservations();
            fetchLendings();
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            待借出预约
          </h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索班级名称、联系人..."
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
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {approvedReservations.map((reservation, index) => (
                <div
                  key={reservation.id}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-semibold text-gray-800">
                          {reservation.className}
                        </h3>
                        <span className={`status-badge ${STATUS_COLORS[reservation.status]}`}>
                          {reservation.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{reservation.shootDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{reservation.headCount} 人</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{reservation.pickupLocation}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {COSTUME_SIZES.map(size => (
                          reservation.sizeBreakdown[size] > 0 && (
                            <span
                              key={size}
                              className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded"
                            >
                              {size}: {reservation.sizeBreakdown[size]}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenLendModal(reservation)}
                      className="btn-gold flex items-center gap-1 text-sm py-2 px-3 flex-shrink-0"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      借出
                    </button>
                  </div>
                </div>
              ))}
              {approvedReservations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  暂无待借出的预约
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-gold-500" />
            借出记录
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {lendingRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-xl overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRecordId(
                      expandedRecordId === record.id ? null : record.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-semibold text-gray-800">
                            {record.reservation?.className}
                          </h3>
                          {record.isOverdue && (
                            <span className="status-badge bg-red-100 text-red-800">
                              逾期未还
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>领用人：{record.lenderName}</span>
                          <span>借出日期：{record.lendDate}</span>
                          <span>共 {record.items.length} 件</span>
                        </div>
                      </div>
                      {expandedRecordId === record.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedRecordId === record.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">预计归还日期：</span>
                          <span className="text-gray-800">{record.expectedReturnDate}</span>
                        </div>
                        {(() => {
                          const returned = record.items.filter(i => i.returned).length;
                          const total = record.items.length;
                          const withDamage = record.items.filter(i => {
                            if (!i.returned || !i.accessoryCheck) return false;
                            return Object.values(i.accessoryCheck).some(v => !v) || i.hasStain || i.damageNote;
                          }).length;
                          return (
                            <>
                              <div>
                                <span className="text-gray-500">归还进度：</span>
                                <span className="text-gray-800">{returned}/{total} 件</span>
                              </div>
                              {withDamage > 0 && (
                                <div>
                                  <span className="text-gray-500">缺损记录：</span>
                                  <span className="text-red-600 font-medium">{withDamage} 件有问题</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="space-y-2">
                        {record.items.map((item) => {
                          const missingLabels: string[] = [];
                          if (item.returned && item.accessoryCheck) {
                            (Object.keys(item.accessoryCheck) as Array<keyof Accessory>).forEach(key => {
                              if (!item.accessoryCheck![key]) {
                                missingLabels.push(ACCESSORY_LABELS[key]);
                              }
                            });
                          }
                          const hasDamage = item.returned && (missingLabels.length > 0 || item.hasStain || item.damageNote);
                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-lg text-sm ${hasDamage ? 'bg-red-50 border border-red-100' : 'bg-white'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`status-badge ${STATUS_COLORS[item.costume?.status || '']}`}>
                                    {item.returned ? '已归还' : '借出中'}
                                  </span>
                                  <span className="text-gray-600 font-medium">
                                    {item.costume?.type} - {item.costume?.size}
                                  </span>
                                  <span className="text-gray-400 text-xs">
                                    #{item.costumeId}
                                  </span>
                                </div>
                                {item.returnDate && (
                                  <span className="text-gray-400 text-xs">归还于 {item.returnDate}</span>
                                )}
                              </div>
                              {hasDamage && (
                                <div className="mt-2 pt-2 border-t border-red-100 flex flex-wrap gap-1">
                                  {missingLabels.map((label, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      缺{label}
                                    </span>
                                  ))}
                                  {item.hasStain && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                      有污渍
                                    </span>
                                  )}
                                  {item.damageNote && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      {item.damageNote}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {lendingRecords.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  暂无借出记录
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLendModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-semibold text-gray-800">
                  借出确认
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {selectedReservation.className}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>拍摄日期：{selectedReservation.shootDate}</div>
                    <div>时段：{selectedReservation.timeSlot}</div>
                    <div>人数：{selectedReservation.headCount} 人</div>
                    <div>老师：{selectedReservation.teacherInCharge}</div>
                  </div>
                </div>

                {lendingError?.unavailableCostumes && lendingError.unavailableCostumes.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-800">{lendingError.message}</p>
                        <p className="text-sm text-red-600 mt-1">
                          以下 {lendingError.unavailableCostumes.length} 件服装在您确认前已被借出或状态变化
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                      {lendingError.unavailableCostumes.map((item, idx) => (
                        <div key={idx} className="text-sm text-red-700 flex items-center justify-between bg-red-100 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{item.id}</span>
                            <span className="text-red-500">{item.type} · {item.size}码</span>
                          </div>
                          <span className="text-xs">
                            {item.status}
                            {item.cleaningStatus !== '干净' ? ` · ${item.cleaningStatus}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => selectedReservation && handleOpenLendModal(selectedReservation)}
                      className="mt-3 w-full btn-gold text-sm py-2"
                    >
                      <RefreshCw className="w-4 h-4 inline-block mr-1" />
                      重新分配服装
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-500" />
                    服装分配预览
                  </h4>
                  
                  {previewLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 text-primary-500 animate-spin" />
                      <span className="ml-2 text-gray-500">正在分配服装...</span>
                    </div>
                  ) : preview ? (
                    <div className="space-y-4">
                      {!preview.canLend ? (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-800">库存不足</p>
                              <p className="text-sm text-red-600 mt-1">
                                共需要 {preview.totalNeeded} 套，可用 {preview.totalAvailable} 套
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1">
                            {preview.insufficient.map((item, idx) => (
                              <div key={idx} className="text-sm text-red-700 flex items-center justify-between bg-red-100 px-3 py-2 rounded-lg">
                                <span>{item.size}码</span>
                                <span>需要 {item.needed} 套，差 {item.needed - item.available} 套</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">库存充足，共 {preview.totalAvailable} 套可用</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {preview.allocatedCostumes.map((group, groupIdx) => (
                          group.costumes.length > 0 && (
                            <div key={groupIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                              <div className="bg-primary-50 px-4 py-2 flex items-center justify-between">
                                <span className="font-medium text-primary-700">
                                  {group.size} 码
                                </span>
                                <span className="text-sm text-primary-600">
                                  {group.costumes.length} 套
                                </span>
                              </div>
                              <div className="p-3 grid grid-cols-2 gap-2">
                                {group.costumes.map((costume, idx) => (
                                  <div
                                    key={idx}
                                    className="text-sm p-2 bg-gray-50 rounded-lg"
                                  >
                                    <div className="font-medium text-gray-800">
                                      #{costume.id}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {costume.color} · {costume.type}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {preview?.canLend && (
                  <>
                    <div className="border-t border-gray-100 pt-4">
                      <label className="label">领用人姓名</label>
                      <input
                        type="text"
                        value={lenderName}
                        onChange={(e) => setLenderName(e.target.value)}
                        className="input"
                        placeholder="请输入领用人姓名"
                      />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                      <p className="font-medium">⚠️ 注意事项：</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>请核对分配的服装ID和尺码是否正确</li>
                        <li>请提醒领用人按时归还</li>
                        <li>归还时请检查配件是否齐全</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  取消
                </button>
                {preview?.canLend && (
                  <button
                    onClick={handleLend}
                    disabled={!lenderName.trim() || loading}
                    className="btn-gold flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    确认借出
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
