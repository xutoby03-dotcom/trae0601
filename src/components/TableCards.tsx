import { useState, useMemo } from 'react';
import { useWedding } from '../context/WeddingContext';
import { getTableGuests, getTableHeadCount, getUnprintedTables, calculateSpecialMeals } from '../utils/seatingUtils';
import TableCardPrint from './TableCardPrint';

export default function TableCards() {
  const { tables, guests, togglePrinted } = useWedding();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const unprintedTables = useMemo(() => getUnprintedTables(tables), [tables]);
  const tablesWithGuests = tables.filter(t => t.guestIds.length > 0);

  const handlePrintAll = () => {
    setSelectedTableId(null);
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      tablesWithGuests.forEach(t => {
        if (!t.printed) togglePrinted(t.id);
      });
    }, 500);
  };

  const handlePrintSingle = (tableId: string) => {
    setSelectedTableId(tableId);
    setShowPrintPreview(true);
    setTimeout(() => {
      window.print();
      const table = tables.find(t => t.id === tableId);
      if (table && !table.printed) togglePrinted(tableId);
    }, 500);
  };

  const displayTables = selectedTableId
    ? tables.filter(t => t.id === selectedTableId)
    : tablesWithGuests;

  if (showPrintPreview) {
    return (
      <div className="p-8 print:p-0">
        <div className="no-print mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-wedding-dark">打印预览</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrintPreview(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              返回
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
            >
              打印
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {displayTables.map(table => (
            <TableCardPrint
              key={table.id}
              table={table}
              guests={getTableGuests(table, guests)}
              headCount={getTableHeadCount(table, guests)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-wedding-dark">桌卡打印</h2>
        <p className="text-gray-500 text-sm mt-1">
          生成并打印每桌的桌卡，包含宾客名单和特殊提示
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-wedding-pink/20 p-4 mb-6 no-print">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-500">需打印桌卡</span>
              <p className="text-xl font-bold text-wedding-dark">{unprintedTables.length} 桌</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">已有宾客桌</span>
              <p className="text-xl font-bold text-green-600">{tablesWithGuests.length} 桌</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrintAll}
              disabled={tablesWithGuests.length === 0}
              className="px-6 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              打印全部桌卡
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => {
          const tableGuests = getTableGuests(table, guests);
          const headCount = getTableHeadCount(table, guests);
          const specialMeals = calculateSpecialMeals(tableGuests);
          const specialMealCount = Object.values(specialMeals).reduce((a, b) => a + b, 0);
          const allergyCount = tableGuests.filter(g => g.allergens.length > 0).length;
          const needsReprint = !table.printed && table.guestIds.length > 0;

          if (tableGuests.length === 0) return null;

          return (
            <div
              key={table.id}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                needsReprint ? 'border-orange-300 ring-2 ring-orange-100' : 'border-wedding-pink/20'
              }`}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-wedding-dark">
                        {table.tableName || `第 ${table.tableNumber} 桌`}
                      </h3>
                      {needsReprint && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs font-medium animate-pulse">
                          ⚠️ 待重打
                        </span>
                      )}
                      {!needsReprint && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          已打印
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{headCount} 位宾客</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {specialMealCount > 0 && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                        🍽️ {specialMealCount} 份特殊餐
                      </span>
                    )}
                    {allergyCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                        ⚠️ {allergyCount} 人过敏
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 max-h-48 overflow-y-auto scrollbar-thin">
                <div className="space-y-1">
                  {tableGuests.map(guest => (
                    <div key={guest.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-700">{guest.name}</span>
                      <div className="flex gap-1">
                        {guest.isChild && <span className="text-xs text-yellow-600">👶</span>}
                        {guest.isElderly && <span className="text-xs text-purple-600">👴</span>}
                        {guest.allergens.length > 0 && <span className="text-xs text-red-500">⚠️</span>}
                        {guest.dietaryRestrictions.length > 0 && <span className="text-xs text-orange-500">🍽️</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => handlePrintSingle(table.id)}
                  className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                    needsReprint
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-white border border-wedding-gold text-wedding-gold hover:bg-wedding-gold/10'
                  }`}
                >
                  {needsReprint ? '🔄 重新打印桌卡' : '打印此桌桌卡'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tablesWithGuests.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🃏</p>
          <p>还没有安排宾客的桌位</p>
          <p className="text-sm mt-2">请先到排桌安排页面进行排桌</p>
        </div>
      )}
    </div>
  );
}
