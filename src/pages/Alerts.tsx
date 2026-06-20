import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Ban, Package, RefreshCw, Trash2 } from 'lucide-react';
import { productApi } from '../services/api';
import { useStore } from '../store';
import type { Product } from '../../shared/types';

export default function Alerts() {
  const { alerts, setAlerts } = useStore();

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const alerts = await productApi.getAlerts();
    setAlerts(alerts);
  }

  async function handleRestock(product: Product, quantity: number) {
    await productApi.restock(product.id, quantity);
    loadAlerts();
  }

  async function handleMarkExpired(product: Product) {
    if (!confirm(`确定将 "${product.name}" 标记为过期并下架吗？`)) return;
    await productApi.update(product.id, { status: 'expired' });
    loadAlerts();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`确定删除 "${product.name}" 吗？`)) return;
    await productApi.delete(product.id);
    loadAlerts();
  }

  async function handleOffline(product: Product) {
    await productApi.update(product.id, { status: 'offline' });
    loadAlerts();
  }

  const today = new Date();

  function getDaysRemaining(expiryDate: string) {
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-gray-800 mb-2">预警中心</h1>
            <p className="text-gray-500">低库存、临期和过期商品管理</p>
          </div>
          <button
            onClick={loadAlerts}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-danger-50 to-danger-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-7 h-7 text-danger-500" />
              </div>
              <div>
                <p className="text-sm text-danger-600 font-medium">低库存商品</p>
                <p className="font-display text-4xl text-danger-600">{alerts?.lowStock.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Clock className="w-7 h-7 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-warning-600 font-medium">临期商品</p>
                <p className="font-display text-4xl text-warning-600">{alerts?.expiring.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Ban className="w-7 h-7 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">已过期商品</p>
                <p className="font-display text-4xl text-gray-600">{alerts?.expired.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-danger-500" />
            <h2 className="font-display text-xl text-gray-800">低库存预警</h2>
            <span className="text-sm text-gray-500">（库存 {'<'} 5 件）</span>
          </div>
          {alerts?.lowStock.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>库存充足</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {alerts?.lowStock.map((product, idx) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex items-center gap-4">
                    <img src={product.photo} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.spec} · {product.flavor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-danger-100 text-danger-600 px-2 py-0.5 rounded-full">
                          仅剩 {product.stock} 件
                        </span>
                        <span className="text-xs text-gray-400">{product.shelfPosition}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRestock(product, 10)}
                        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                      >
                        补货 +10
                      </button>
                      <button
                        onClick={() => handleOffline(product)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        下架
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-warning-500" />
            <h2 className="font-display text-xl text-gray-800">临期提醒</h2>
            <span className="text-sm text-gray-500">（30天内到期）</span>
          </div>
          {alerts?.expiring.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无临期商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {alerts?.expiring.map((product, idx) => {
                const days = getDaysRemaining(product.expiryDate);
                return (
                  <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                    <div className="flex items-center gap-4">
                      <img src={product.photo} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.spec} · {product.flavor}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            days <= 7 ? 'bg-danger-100 text-danger-600' : 'bg-warning-100 text-warning-600'
                          }`}>
                            还剩 {days} 天
                          </span>
                          <span className="text-xs text-gray-400">到期日: {product.expiryDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleMarkExpired(product)}
                          className="px-3 py-1.5 bg-warning-500 text-white rounded-lg text-sm hover:bg-warning-600 transition-colors"
                        >
                          标记过期
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expired */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-gray-500" />
            <h2 className="font-display text-xl text-gray-800">已过期商品</h2>
            <span className="text-sm text-gray-500">（已自动下架）</span>
          </div>
          {alerts?.expired.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              <Ban className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无已过期商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {alerts?.expired.map((product, idx) => (
                <div key={product.id} className="bg-gray-50 rounded-2xl p-4 shadow-sm opacity-75 animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className="flex items-center gap-4">
                    <img src={product.photo} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 grayscale" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.spec} · {product.flavor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          已过期
                        </span>
                        <span className="text-xs text-gray-400">到期日: {product.expiryDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product)}
                      className="px-3 py-1.5 bg-danger-100 text-danger-600 rounded-lg text-sm hover:bg-danger-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      清理
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
