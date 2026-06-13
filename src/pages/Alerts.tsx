import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import { AlertCard } from '@/components/AlertCard';
import { Badge } from '@/components/ui/Badge';
import type { Alert, AlertType } from '../../shared/types';

type FilterType = 'all' | 'low_stock' | 'abnormal_consumption';
type FilterStatus = 'all' | 'unresolved' | 'resolved';

export default function Alerts() {
  const { alerts, loading, fetchAlerts } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const unresolvedAlerts = alerts.filter((a) => !a.isResolved);
  const lowStockAlerts = alerts.filter((a) => a.type === 'low_stock');
  const abnormalAlerts = alerts.filter((a) => a.type === 'abnormal_consumption');
  const resolvedAlerts = alerts.filter((a) => a.isResolved);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      (alert.printerLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all' || alert.type === filterType;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unresolved' && !alert.isResolved) ||
      (filterStatus === 'resolved' && alert.isResolved);

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预警中心</h1>
          <p className="text-gray-500 mt-1">查看和处理库存预警与异常领用</p>
        </div>
        {unresolvedAlerts.length > 0 && (
          <Badge variant="danger" className="text-sm px-3 py-1.5">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {unresolvedAlerts.length} 条待处理
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500">待处理预警</p>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-600">
            {unresolvedAlerts.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-500">低库存预警</p>
          </div>
          <p className="text-2xl font-bold font-mono text-red-600">
            {lowStockAlerts.filter((a) => !a.isResolved).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">异常领用</p>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">
            {abnormalAlerts.filter((a) => !a.isResolved).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">已处理</p>
          </div>
          <p className="text-2xl font-bold font-mono text-green-600">
            {resolvedAlerts.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索打印点位置、预警内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
          >
            <option value="all">全部类型</option>
            <option value="low_stock">低库存预警</option>
            <option value="abnormal_consumption">异常领用</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
          >
            <option value="all">全部状态</option>
            <option value="unresolved">待处理</option>
            <option value="resolved">已处理</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : sortedAlerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无预警</h3>
          <p className="text-gray-500">
            {filterStatus === 'unresolved'
              ? '当前没有待处理的预警，所有问题都已解决！'
              : filterStatus === 'resolved'
              ? '还没有已处理的预警记录'
              : filterType === 'low_stock'
              ? '暂无低库存预警'
              : filterType === 'abnormal_consumption'
              ? '暂无异常领用预警'
              : '系统运行正常，没有预警信息'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
