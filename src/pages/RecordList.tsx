import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Trash2, Tag, User, DollarSign, Calendar, MapPin, FileText, Package, Filter, X } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDateDisplay } from '../utils/dateUtils';

export default function RecordList() {
  const location = useLocation();
  const state = location.state as { deviceId?: string } | null;
  const initialDeviceId = state?.deviceId;

  const { records, devices, deleteRecord } = useFilterStore();

  const [selectedFilterModel, setSelectedFilterModel] = useState<string>('all');
  const [onlyZeroStock, setOnlyZeroStock] = useState<boolean>(false);

  const filterModels = useMemo(() => {
    const models = new Set<string>();
    devices.forEach((d) => models.add(d.filterModel));
    return Array.from(models).sort();
  }, [devices]);

  useEffect(() => {
    if (initialDeviceId) {
      const device = devices.find((d) => d.id === initialDeviceId);
      if (device) {
        setSelectedFilterModel(device.filterModel);
      }
    }
  }, [initialDeviceId, devices]);

  const getDeviceLocation = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    return device?.location || '未知设备';
  };

  const getDeviceFilterModel = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    return device?.filterModel || '未知型号';
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条更换记录吗？库存将自动返还。')) {
      deleteRecord(id);
    }
  };

  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (selectedFilterModel !== 'all') {
      result = result.filter((r) => {
        const model = getDeviceFilterModel(r.deviceId);
        return model === selectedFilterModel;
      });
    }
    if (onlyZeroStock) {
      result = result.filter((r) => r.remainingInventory === 0);
    }
    return result.sort(
      (a, b) => new Date(b.installDate).getTime() - new Date(a.installDate).getTime()
    );
  }, [records, selectedFilterModel, onlyZeroStock, devices]);

  const hasActiveFilters = selectedFilterModel !== 'all' || onlyZeroStock;
  const initialDeviceName = initialDeviceId
    ? devices.find((d) => d.id === initialDeviceId)?.location
    : null;

  const clearFilters = () => {
    setSelectedFilterModel('all');
    setOnlyZeroStock(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">更换记录</h1>
          <p className="text-gray-500 mt-1">
            查看和管理所有滤芯更换历史
            {initialDeviceName && (
              <span className="ml-2 text-primary-600 font-medium">
                · 当前筛选：{initialDeviceName}
              </span>
            )}
          </p>
        </div>
        <Link to="/records/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          记录更换
        </Link>
      </div>

      <div className="card !p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium">筛选条件</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-danger-500 rounded-lg hover:bg-danger-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                清除
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:ml-4 flex-1">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-sm text-gray-600 whitespace-nowrap">滤芯型号：</label>
              <select
                value={selectedFilterModel}
                onChange={(e) => setSelectedFilterModel(e.target.value)}
                className="input-field !py-2 !px-3 !text-sm flex-1 max-w-xs"
              >
                <option value="all">全部型号</option>
                {filterModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={onlyZeroStock}
                  onChange={(e) => setOnlyZeroStock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger-500" />
              </div>
              <span className="text-sm text-gray-700 group-hover:text-danger-600 transition-colors">
                只看更换后库存为 0
              </span>
            </label>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            共 <span className="font-semibold text-gray-800">{records.length}</span> 条记录
            {hasActiveFilters && (
              <>
                <span className="mx-1.5">·</span>
                筛选后 <span className="font-semibold text-primary-600">{filteredRecords.length}</span> 条
              </>
            )}
          </p>
          {onlyZeroStock && (
            <span className="badge-danger inline-flex items-center gap-1">
              <X className="w-3 h-3" />
              仅显示库存耗尽记录
            </span>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无更换记录</h3>
          <p className="text-gray-500 mb-6">点击上方按钮记录第一次滤芯更换</p>
          <Link to="/records/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            记录更换
          </Link>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">没有符合条件的记录</h3>
          <p className="text-gray-500 mb-4">
            换个筛选条件试试，或者点击下方按钮清除所有筛选
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={clearFilters} className="btn-secondary inline-flex items-center gap-2">
              <X className="w-4 h-4" />
              清除筛选
            </button>
            <Link to="/records/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新增记录
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={record.id}
                className={`card relative overflow-hidden ${
                  isLatest && !hasActiveFilters ? 'ring-2 ring-primary-200' : ''
                }`}
              >
                {isLatest && !hasActiveFilters && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-bl from-primary-500 to-primary-600 text-white text-xs font-medium px-3 py-1 rounded-bl-xl">
                      最新
                    </div>
                  </div>
                )}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 lg:w-64">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white flex-shrink-0">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {formatDateDisplay(record.installDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getDeviceLocation(record.deviceId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">滤芯型号</p>
                        <p className="text-sm font-medium text-gray-700">
                          {getDeviceFilterModel(record.deviceId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">批次号</p>
                        <p className="text-sm font-medium text-gray-700">{record.batchNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">安装人</p>
                        <p className="text-sm font-medium text-gray-700">{record.installer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">费用</p>
                        <p className="text-sm font-medium text-gray-700">¥{record.cost}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:w-72 justify-end">
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">预计到期</p>
                        <p className="text-sm font-medium text-primary-600">
                          {formatDateDisplay(record.expectedExpireDate)}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-400">更换后库存：</p>
                        <span className={`text-sm font-semibold ${
                          (record.remainingInventory ?? 0) === 0 ? 'text-danger-500' :
                          (record.remainingInventory ?? 0) <= 1 ? 'text-warning-500' : 'text-success-600'
                        }`}>
                          {record.remainingInventory ?? '-'} 件
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">备注：</span>
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
