import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBBQStore } from '@/store/useBBQStore';
import { CATEGORY_EMOJI } from '@/types';
import type { ItemCategory } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<ItemCategory, string> = {
  '肉类': '#E8652E',
  '海鲜': '#4AA8D8',
  '蔬菜': '#5A8F5C',
  '主食': '#D4A574',
  '饮品': '#9B59B6',
  '调料': '#F39C12',
  '耗材': '#8B5E3C',
};

export default function Overview() {
  const items = useBBQStore((s) => s.items);
  const participants = useBBQStore((s) => s.participants);
  const getTotalCost = useBBQStore((s) => s.getTotalCost);
  const getPerPersonCost = useBBQStore((s) => s.getPerPersonCost);
  const getUnclaimedItems = useBBQStore((s) => s.getUnclaimedItems);
  const getMissingReceipts = useBBQStore((s) => s.getMissingReceipts);

  const [searchParams, setSearchParams] = useSearchParams();
  const [showDoneToast, setShowDoneToast] = useState(false);
  const receiptDone = searchParams.get('receiptDone');

  const toastTimerRef = useRef<number | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearToastTimer();
  }, [clearToastTimer]);

  useEffect(() => {
    if (receiptDone === '1') {
      clearToastTimer();
      setShowDoneToast(true);
      const clean = new URLSearchParams(searchParams);
      clean.delete('receiptDone');
      setSearchParams(clean, { replace: true });
      toastTimerRef.current = window.setTimeout(() => {
        toastTimerRef.current = null;
        setShowDoneToast(false);
      }, 4000);
    }
  }, [receiptDone, searchParams, setSearchParams, clearToastTimer]);

  const unclaimedItems = getUnclaimedItems();
  const missingReceipts = getMissingReceipts();
  const refrigeratedItems = items.filter((item) => item.needsRefrigeration);
  const unclaimedRefrigerated = refrigeratedItems.filter((item) => item.status === '未认领');

  const categoryCostMap = items.reduce<Record<string, number>>((acc, item) => {
    if (item.claim?.cost) {
      acc[item.category] = (acc[item.category] ?? 0) + item.claim.cost;
    }
    return acc;
  }, {});

  const pieData = (Object.entries(categoryCostMap) as [ItemCategory, number][])
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalCost = getTotalCost();
  const perPersonCost = getPerPersonCost();

  return (
    <div className="min-h-screen bg-[#FAF5F0] relative" style={{ color: '#2D2A26' }}>
      {showDoneToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-2xl border border-[#5A8F5C]/30">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#5A8F5C]/15 text-[#5A8F5C] text-lg">✓</span>
            <span className="text-sm font-medium text-[#2D2A26]">小票已上传，搞定！</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-[#E8652E] hover:opacity-70 transition-opacity">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display">📋 出发总览</h1>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1 bg-orange-50 text-[#E8652E] text-sm font-medium px-3 py-1 rounded-full border border-orange-200">
          📅 2026年6月15日
        </span>
        <span className="inline-flex items-center gap-1 bg-orange-50 text-[#E8652E] text-sm font-medium px-3 py-1 rounded-full border border-orange-200">
          👥 {participants.length}人参与
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="border-l-4 border-red-500 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-red-500 mb-3">⚠️ 还有食材没人认领</h2>
          {unclaimedItems.length === 0 ? (
            <p className="text-green-600 font-medium">✅ 所有食材已认领！</p>
          ) : (
            <div className="flex flex-col gap-2">
              {unclaimedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-red-50 rounded-lg px-4 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[item.category]}</span>
                    <span className="font-medium">{item.name}</span>
                  </span>
                  <span className="text-sm text-gray-500">¥{item.budget}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-l-4 border-amber-500 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-amber-500 mb-3">🧾 小票待上传</h2>
          {missingReceipts.length === 0 ? (
            <p className="text-green-600 font-medium">✅ 所有人员已上传小票</p>
          ) : (
            <div className="flex flex-col gap-2">
              {missingReceipts.map((entry) => (
                <div
                  key={entry.itemId}
                  className="flex items-center justify-between gap-3 bg-amber-50 rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm flex-shrink-0">🧑</span>
                    <span className="font-medium flex-shrink-0">{entry.buyer}</span>
                    <span className="text-sm text-gray-600 truncate">{entry.item}</span>
                  </div>
                  <Link
                    to={`/?receiptItemId=${entry.itemId}`}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    去补传
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-l-4 border-blue-500 bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold text-blue-500 mb-3">❄️ 冷藏食材追踪</h2>
          {refrigeratedItems.length === 0 ? (
            <p className="text-green-600 font-medium">✅ 无冷藏食材</p>
          ) : (
            <div className="flex flex-col gap-2">
              {refrigeratedItems.map((item) => {
                const isUnclaimed = item.status === '未认领';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-4 py-2',
                      isUnclaimed ? 'bg-red-50' : 'bg-blue-50'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_EMOJI[item.category]}</span>
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {isUnclaimed ? (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          ⚠️ 无人认领
                        </span>
                      ) : (
                        <>
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.status}
                          </span>
                          {item.claim?.buyer && (
                            <span className="text-sm text-gray-500">{item.claim.buyer}</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {unclaimedRefrigerated.length === 0 && refrigeratedItems.length > 0 && (
            <p className="text-green-600 font-medium mt-2">✅ 冷藏食材都有人带</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold mb-4">💰 费用汇总</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `¥${value}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  暂无费用数据
                </div>
              )}
              {pieData.length > 0 && (
                <div className="text-center -mt-2">
                  <span className="text-sm text-gray-500">总计</span>
                  <span className="block text-xl font-bold" style={{ color: '#E8652E' }}>
                    ¥{totalCost}
                  </span>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-2">
              {pieData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                    />
                    <span className="font-medium">{CATEGORY_EMOJI[entry.name]} {entry.name}</span>
                  </span>
                  <span className="font-bold">¥{entry.value}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex items-center justify-between px-3">
                <span className="font-bold">合计</span>
                <span className="font-bold text-lg" style={{ color: '#E8652E' }}>¥{totalCost}</span>
              </div>
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-gray-500">人均</span>
                <span className="text-sm font-medium text-gray-700">¥{perPersonCost.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E8652E' }}
        >
          <ArrowLeft size={18} />
          返回清单
        </Link>
      </div>
      </div>
    </div>
  );
}
