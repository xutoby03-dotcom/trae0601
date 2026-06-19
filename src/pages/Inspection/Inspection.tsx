import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTablewareStore } from '../../store/useTablewareStore';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { disinfectionLabels, severityLabels } from '../../data/mockData';
import { formatDate, formatNumber, cn } from '../../utils/format';
import type { DisinfectionStatus, SeverityLevel } from '../../types';

const Inspection = () => {
  const { inspectionRecords, addInspection, tablewareList: tablewares } =
    useTablewareStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(
    searchParams.get('search') || ''
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchText) {
      setSearchText(urlSearch);
    }
  }, [searchParams]);

  const onSearchChange = (value: string) => {
    setSearchText(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };
  const [formData, setFormData] = useState({
    tablewareId: '',
    tablewareBatchNo: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    crackCount: 0,
    chipCount: 0,
    deformationCount: 0,
    oilStainCount: 0,
    disinfectionStatus: 'qualified' as DisinfectionStatus,
    severity: 'minor' as SeverityLevel,
    remark: '',
  });

  const filteredRecords = inspectionRecords.filter(
    (record) =>
      record.tablewareBatchNo
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      record.inspector.includes(searchText)
  );

  const handleAdd = () => {
    setFormData({
      tablewareId: tablewares[0]?.id || '',
      tablewareBatchNo: tablewares[0]?.batchNo || '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: '',
      crackCount: 0,
      chipCount: 0,
      deformationCount: 0,
      oilStainCount: 0,
      disinfectionStatus: 'qualified',
      severity: 'minor',
      remark: '',
    });
    setShowModal(true);
  };

  const handleTablewareChange = (tablewareId: string) => {
    const tw = tablewares.find((t) => t.id === tablewareId);
    setFormData({
      ...formData,
      tablewareId,
      tablewareBatchNo: tw?.batchNo || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInspection(formData);
    setShowModal(false);
  };

  const totalDamaged = (record: any) => {
    return (
      record.crackCount +
      record.chipCount +
      record.deformationCount +
      record.oilStainCount
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">巡检记录</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {filteredRecords.length} 条巡检记录
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          新建巡检
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索批次号、巡检员..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {searchText && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
        {searchText && (
          <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
            <Search className="w-4 h-4" />
            正在搜索「<span className="font-medium">{searchText}</span>」相关巡检记录
            {filteredRecords.length === 0 && (
              <span className="ml-auto text-gray-500">暂无匹配结果</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredRecords.map((record, index) => (
          <div
            key={record.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    record.disinfectionStatus === 'qualified'
                      ? 'bg-success-50 text-success-500'
                      : 'bg-danger-50 text-danger-500'
                  }`}
                >
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {record.tablewareBatchNo}
                    </h3>
                    <StatusBadge
                      status={record.severity}
                      label={severityLabels[record.severity]}
                    />
                    <StatusBadge
                      status={record.disinfectionStatus}
                      label={disinfectionLabels[record.disinfectionStatus]}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(record.inspectionDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {record.inspector}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 flex-1">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(record.crackCount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">裂纹</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-warning-500">
                    {formatNumber(record.chipCount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">缺角</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-danger-500">
                    {formatNumber(record.deformationCount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">变形</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-500">
                    {formatNumber(record.oilStainCount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">油污</p>
                </div>
              </div>
            </div>

            {record.remark && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">备注：</span>
                  {record.remark}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {totalDamaged(record) > 0 ? (
                  <span className="flex items-center gap-1 text-sm text-warning-600">
                    <AlertCircle className="w-4 h-4" />
                    共发现 {totalDamaged(record)} 处问题
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-success-600">
                    <CheckCircle className="w-4 h-4" />
                    状况良好
                  </span>
                )}
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                查看详情 →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无巡检记录</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">新建巡检记录</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    选择批次 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tablewareId}
                    onChange={(e) => handleTablewareChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    required
                  >
                    {tablewares.map((tw) => (
                      <option key={tw.id} value={tw.id}>
                        {tw.batchNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    巡检日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.inspectionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, inspectionDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  巡检员 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.inspector}
                  onChange={(e) =>
                    setFormData({ ...formData, inspector: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="请输入巡检员姓名"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    裂纹
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.crackCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        crackCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    缺角
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.chipCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chipCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    变形
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deformationCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deformationCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    油污
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.oilStainCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        oilStainCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  消毒状态
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="disinfection"
                      value="qualified"
                      checked={formData.disinfectionStatus === 'qualified'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disinfectionStatus: e.target.value as DisinfectionStatus,
                        })
                      }
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      合格
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="disinfection"
                      value="unqualified"
                      checked={formData.disinfectionStatus === 'unqualified'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disinfectionStatus: e.target.value as DisinfectionStatus,
                        })
                      }
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="flex items-center gap-1 text-sm text-gray-700">
                      <XCircle className="w-4 h-4 text-danger-500" />
                      不合格
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  严重程度
                </label>
                <div className="flex gap-3">
                  {(['minor', 'severe'] as SeverityLevel[]).map((s) => (
                    <label
                      key={s}
                      className={cn(
                        'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-colors',
                        formData.severity === s
                          ? s === 'severe'
                            ? 'border-danger-500 bg-danger-50'
                            : 'border-success-500 bg-success-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={s}
                        checked={formData.severity === s}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            severity: e.target.value as SeverityLevel,
                          })
                        }
                        className="sr-only"
                      />
                      <AlertCircle
                        className={cn(
                          'w-5 h-5',
                          formData.severity === s
                            ? s === 'severe'
                              ? 'text-danger-500'
                              : 'text-success-500'
                            : 'text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          formData.severity === s
                            ? s === 'severe'
                              ? 'text-danger-600'
                              : 'text-success-600'
                            : 'text-gray-600'
                        )}
                      >
                        {severityLabels[s]}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {formData.severity === 'severe'
                    ? '严重破损将自动下架该批次餐具'
                    : '轻微问题将进入待复查状态'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                  placeholder="填写巡检备注说明..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                >
                  提交记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspection;
