import { Table, Guest } from '../types';

interface TableCardPrintProps {
  table: Table;
  guests: Guest[];
  headCount: number;
}

export default function TableCardPrint({ table, guests, headCount }: TableCardPrintProps) {
  const specialMealGuests = guests.filter(g => g.dietaryRestrictions.length > 0 || g.allergens.length > 0);
  const childCount = guests.filter(g => g.isChild).length;
  const elderlyCount = guests.filter(g => g.isElderly).length;

  return (
    <div className="print-page border border-gray-300 rounded-lg p-8 bg-white max-w-lg mx-auto" style={{ pageBreakAfter: 'always' }}>
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-1">💒 婚礼桌卡</div>
        <h1 className="text-3xl font-bold text-wedding-dark">
          {table.tableName || `第 ${table.tableNumber} 桌`}
        </h1>
        <div className="w-20 h-0.5 bg-wedding-gold mx-auto mt-3"></div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">宾客名单</span>
          <span className="text-sm font-medium text-wedding-dark">{headCount} 人</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {guests.map(guest => (
            <div key={guest.id} className="flex items-center gap-2 py-1">
              <span className="text-gray-700">{guest.name}</span>
              <span className="text-xs text-gray-400">({guest.headCount}人)</span>
            </div>
          ))}
        </div>
      </div>

      {(childCount > 0 || elderlyCount > 0 || specialMealGuests.length > 0) && (
        <div className="bg-wedding-cream rounded-lg p-4">
          <h3 className="text-sm font-medium text-wedding-dark mb-2">📋 特别提示</h3>
          <div className="space-y-1 text-sm">
            {childCount > 0 && (
              <p className="text-yellow-700">
                👶 儿童 {childCount} 位 - 需要儿童椅和儿童餐
              </p>
            )}
            {elderlyCount > 0 && (
              <p className="text-purple-700">
                👴 老人 {elderlyCount} 位 - 需要协助入座
              </p>
            )}
            {specialMealGuests.length > 0 && (
              <div className="mt-2">
                <p className="text-orange-700 mb-1">🍽️ 特殊饮食：</p>
                <ul className="pl-4 space-y-0.5">
                  {specialMealGuests.map(guest => (
                    <li key={guest.id} className="text-xs text-gray-600">
                      <span className="font-medium">{guest.name}：</span>
                      {[...guest.dietaryRestrictions, ...guest.allergens.map(a => a + '过敏')].join('、')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">祝您用餐愉快 · 新婚快乐</p>
      </div>
    </div>
  );
}
